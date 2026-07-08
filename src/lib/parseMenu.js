// Parses CoCo's Snappy menu API response into Bubble Run's menu + toppings format.
// Snappy structure: menuGroups[] -> menuItems[] with name (size-prefixed), menuGroup, outOfStock, charges[]

// Deterministic color per drink so the same drink always looks the same
function colorFor(name) {
  const n = name.toLowerCase();
  if (n.includes("taro")) return "#c9a9d6";
  if (n.includes("matcha")) return "#a7c49a";
  if (n.includes("choco")) return "#6b4a35";
  if (n.includes("mango")) return "#f2a93b";
  if (n.includes("peach")) return "#f0a87a";
  if (n.includes("berry") || n.includes("strawberry")) return "#b85a7a";
  if (n.includes("passion")) return "#e8b33a";
  if (n.includes("lemon")) return "#d7e06a";
  if (n.includes("grapefruit")) return "#ef8c8c";
  if (n.includes("lychee")) return "#f0b8c0";
  if (n.includes("honeydew")) return "#b8d89a";
  if (n.includes("brown sugar")) return "#8b5e3c";
  if (n.includes("jasmine")) return "#d8c79a";
  if (n.includes("oolong")) return "#9c7a4e";
  if (n.includes("green tea")) return "#8ab060";
  if (n.includes("black tea")) return "#a07040";
  if (n.includes("coffee") || n.includes("brew")) return "#5a3b28";
  if (n.includes("milk tea") || n.includes("pearl")) return "#caa06a";
  return "#c09a6b";
}

// Strip leading size token (L / M / S / Large / Medium / Small) from a drink name
function stripSize(name) {
  return name.replace(/^\s*(L|M|S|Large|Medium|Small)[\s.\-]+/i, "").trim();
}

// Detect size from the name prefix; default Medium
function sizeOf(name) {
  const m = name.match(/^\s*(L|Large)\b/i);
  if (m) return "L";
  return "M";
}

// Extract a numeric price from a menuItem's charges array
function priceOf(item) {
  try {
    const charges = item.charges || [];
    for (const c of charges) {
      if (typeof c.price === "number") return c.price;
      if (c.charges && c.charges[0] && typeof c.charges[0].price === "number") return c.charges[0].price;
    }
  } catch {}
  return 0;
}

// Make a stable slug id from a drink name
function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 40) || "item";
}

export function parseSnappyMenu(data) {
  const groups = data?.menuGroups || [];
  const drinksByKey = new Map(); // base-name -> { name, category, prices:{M,L}, oos:{M,L} }
  let toppings = [];
  const seenToppings = new Set();

  // Categories to skip entirely (merch, and the Recommended shelf which duplicates real drinks)
  const SKIP_CATEGORIES = new Set(["misc", "recommended"]);
  // Topping values that aren't real toppings
  const SKIP_TOPPINGS = new Set(["no toppings", "no topping", "none"]);

  for (const g of groups) {
    if (g.hidden) continue;
    const items = g.menuItems || [];
    for (const item of items) {
      if (!item.name) continue;
      const category = item.menuGroup || g.name || "Other";
      const catKey = category.toLowerCase();

      // Always harvest toppings even from skipped categories (they share the same topping list)
      const configs = item?.attributes?.Configurable || [];
      for (const cfg of configs) {
        const nm = (cfg.name || cfg.description || "").toUpperCase();
        if (nm.includes("TOPPING")) {
          for (const v of cfg.values || []) {
            const tName = (v.value || "").trim();
            if (!tName || seenToppings.has(tName.toLowerCase())) continue;
            if (SKIP_TOPPINGS.has(tName.toLowerCase())) continue;
            seenToppings.add(tName.toLowerCase());
            let tPrice = 0.6;
            try { tPrice = v.charges?.[0]?.price ?? 0.6; } catch {}
            toppings.push({ id: slugify(tName), name: tName, price: tPrice, isAvailable: !v.outOfStock });
          }
        }
      }

      // Skip merch and the Recommended shelf for the drink list
      if (SKIP_CATEGORIES.has(catKey)) continue;

      const base = stripSize(item.name);
      const size = sizeOf(item.name);
      const key = base.toLowerCase().replace(/[^a-z0-9]/g, ""); // normalize "3 Guys" vs "3Guys"
      const price = priceOf(item);

      // Skip junk: size-only names (Medium/Large/Small), empty base, or absurd prices (merch/combos)
      if (!base || /^(medium|large|small)$/i.test(base)) continue;
      if (price > 9) continue; // no CoCo drink is over $9; filters combos/merch

      if (!drinksByKey.has(key)) {
        drinksByKey.set(key, { name: base, category, prices: {}, oos: {} });
      }
      const d = drinksByKey.get(key);
      d.prices[size] = price;
      d.oos[size] = !!item.outOfStock;
    }
  }

  // Build final menu
  const menu = [];
  for (const d of drinksByKey.values()) {
    const mPrice = d.prices.M;
    const lPrice = d.prices.L;
    let basePrice;
    if (typeof mPrice === "number") basePrice = mPrice;
    else if (typeof lPrice === "number") basePrice = Math.max(0, +(lPrice - 0.5).toFixed(2));
    else basePrice = 0;

    const anyAvail = (d.prices.M !== undefined && !d.oos.M) || (d.prices.L !== undefined && !d.oos.L);

    menu.push({
      id: slugify(d.name),
      name: d.name,
      basePrice: +basePrice.toFixed(2),
      category: d.category,
      color: colorFor(d.name),
      isAvailable: anyAvail,
    });
  }

  // Derive category order (visible, non-skipped, in Snappy's order)
  const categoryOrder = [];
  for (const g of groups) {
    if (g.hidden) continue;
    for (const item of g.menuItems || []) {
      const cat = item.menuGroup || g.name || "Other";
      if (SKIP_CATEGORIES.has(cat.toLowerCase())) continue;
      if (!categoryOrder.includes(cat)) categoryOrder.push(cat);
    }
  }

  return { menu, toppings, categoryOrder };
}
