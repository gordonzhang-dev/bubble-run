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

  // Only merch is skipped. Every other category CoCo publishes is kept automatically,
  // including ones that don't exist yet (e.g. a new "August Summer Special").
  const SKIP_CATEGORIES = new Set(["misc"]);
  const SKIP_TOPPINGS = new Set(["no toppings", "no topping", "none"]);

  // "Recommended" is CoCo's curated shelf: it re-lists drinks that also live in real
  // categories. It's the ONLY category we dedupe against, and it's processed last so
  // it keeps just the drinks found nowhere else. Every other category — promotional or
  // regular, known or brand new — keeps its own items.
  const isRecommendedGroup = (g) => (g.name || "").toLowerCase() === "recommended";

  // Record each category's position in CoCo's own menu so display order needs no
  // hardcoded list. Recommended is forced to the end of the sequence.
  const catIndexByName = new Map();
  let seq = 0;
  for (const g of groups) {
    if (g.hidden) continue;
    const cat = g.name || "Other";
    if (cat.toLowerCase() === "misc") continue;
    if (isRecommendedGroup(g)) continue;
    if (!catIndexByName.has(cat)) catIndexByName.set(cat, seq++);
  }
  for (const g of groups) {
    if (g.hidden || !isRecommendedGroup(g)) continue;
    const cat = g.name || "Recommended";
    if (!catIndexByName.has(cat)) catIndexByName.set(cat, 9999);
  }

  // Track which base names have been claimed by a non-Recommended category, so
  // Recommended can skip them and so repeat names get distinct keys.
  const claimedBaseNames = new Set();

  const passes = [
    (g) => !isRecommendedGroup(g), // every real/promo category, in CoCo's order
    (g) => isRecommendedGroup(g),  // Recommended last
  ];

  for (const passFilter of passes) {
    for (const g of groups) {
      if (g.hidden) continue;
      if (!passFilter(g)) continue;
      const groupIsRecommended = isRecommendedGroup(g);

      for (const item of g.menuItems || []) {
        if (!item.name) continue;
        const category = item.menuGroup || g.name || "Other";
        const catKey = category.toLowerCase();

        // Harvest toppings from every item (shared list across the menu)
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

        if (SKIP_CATEGORIES.has(catKey)) continue;

        const base = stripSize(item.name);
        const size = sizeOf(item.name);
        const price = priceOf(item);

        if (!base || /^(medium|large|small)$/i.test(base)) continue;
        if (price > 9) continue; // filters merch and oversized combo bundles

        const baseKey = base.toLowerCase().replace(/[^a-z0-9]/g, "");

        // Recommended: skip anything already claimed by a real category.
        if (groupIsRecommended && claimedBaseNames.has(baseKey)) continue;

        // Key includes the category so the same drink listed in two categories
        // (e.g. a promo section and its regular home) stays distinct.
        const key = `${catKey}::${baseKey}`;

        if (!drinksByKey.has(key)) {
          drinksByKey.set(key, {
            name: base,
            category,
            catIndex: catIndexByName.has(category) ? catIndexByName.get(category) : 5000,
            baseKey,
            prices: {},
            oos: {},
          });
        }
        const d = drinksByKey.get(key);
        d.prices[size] = price;
        d.oos[size] = !!item.outOfStock;

        if (!groupIsRecommended) claimedBaseNames.add(baseKey);
      }
    }
  }

  // Build the final menu. A drink keeps a plain id when its name is unique across the
  // whole menu, and gets a category-prefixed id only when the same name appears in more
  // than one category — that keeps ids stable for the common case.
  const nameCounts = new Map();
  for (const d of drinksByKey.values()) {
    nameCounts.set(d.baseKey, (nameCounts.get(d.baseKey) || 0) + 1);
  }

  const menu = [];
  for (const d of drinksByKey.values()) {
    const mPrice = d.prices.M;
    const lPrice = d.prices.L;
    let basePrice;
    if (typeof mPrice === "number") basePrice = mPrice;
    else if (typeof lPrice === "number") basePrice = Math.max(0, +(lPrice - 0.5).toFixed(2));
    else basePrice = 0;

    const anyAvail = (d.prices.M !== undefined && !d.oos.M) || (d.prices.L !== undefined && !d.oos.L);
    const duplicated = (nameCounts.get(d.baseKey) || 0) > 1;
    const id = duplicated ? `${slugify(d.category)}_${slugify(d.name)}` : slugify(d.name);

    menu.push({
      id,
      name: d.name,
      basePrice: +basePrice.toFixed(2),
      category: d.category,
      catIndex: d.catIndex,   // lets the app order categories without a hardcoded list
      color: colorFor(d.name),
      isAvailable: anyAvail,
    });
  }

  // Category order straight from CoCo's own sequence, limited to categories that
  // actually ended up with drinks.
  const used = new Set(menu.map((d) => d.category));
  const categoryOrder = [...catIndexByName.entries()]
    .filter(([cat]) => used.has(cat))
    .sort((a, b) => a[1] - b[1])
    .map(([cat]) => cat);

  return { menu, toppings, categoryOrder };
}
