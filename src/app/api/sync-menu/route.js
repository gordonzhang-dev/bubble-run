import { createClient } from "@supabase/supabase-js";
import { parseSnappyMenu } from "@/lib/parseMenu";

const MENU_CODE = "65cb919c-5c62-44e7-96db-faf8a577ac24";
const STORE_ID = "3017";
const SNAPPY_URL = `https://gosnappy.io/v1/owa/menu/${MENU_CODE}`;

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Merge freshly-parsed menu into the stored master.
// Rule: never delete. Update price + availability on existing (matched by id).
// Add brand-new drinks. Keep host-customized colors/names on existing items.
function mergeMenu(stored, fresh) {
  const byId = new Map(stored.map((d) => [d.id, d]));
  const result = [];

  for (const f of fresh) {
    const existing = byId.get(f.id);
    if (existing) {
      // Update price/availability/category from CoCo, but keep host's color and any deal
      result.push({
        ...f,
        color: existing.color || f.color,
        ...(existing.deal ? { deal: existing.deal } : {}),
      });
    } else {
      result.push(f);
    }
  }
  // Anything not in CoCo's current menu is dropped entirely (menu mirrors CoCo exactly)
  return result;
}

function mergeToppings(stored, fresh) {
  const byId = new Map(stored.map((t) => [t.id, t]));
  const result = [];
  for (const f of fresh) {
    const existing = byId.get(f.id);
    result.push(existing ? { ...f } : f);
  }
  // Toppings not in CoCo's current menu are dropped
  return result;
}

async function runSync() {
  // Fetch Snappy menu. The API requires the store ID passed as a header.
  const res = await fetch(SNAPPY_URL, {
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "storeId": STORE_ID,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let body = "";
    try { body = (await res.text()).slice(0, 200); } catch {}
    throw new Error(`Snappy returned ${res.status}${body ? " — " + body : ""}`);
  }

  const data = await res.json();
  const { menu: freshMenu, toppings: freshToppings, categoryOrder } = parseSnappyMenu(data);

  if (!freshMenu.length) {
    // Report what we actually received to help diagnose
    const groupCount = data?.menuGroups?.length ?? 0;
    const topKeys = Object.keys(data || {}).join(",");
    throw new Error(`Parsed 0 drinks. groups=${groupCount} keys=${topKeys}`);
  }

  const db = admin();

  // Load existing master (if any)
  const { data: masterRow } = await db.from("menu_master").select("*").eq("id", "master").maybeSingle();

  const storedMenu = masterRow?.menu || [];
  const storedToppings = masterRow?.toppings || [];

  const mergedMenu = mergeMenu(storedMenu, freshMenu);
  const mergedToppings = mergeToppings(storedToppings, freshToppings);

  const { error: writeErr } = await db.from("menu_master").upsert({
    id: "master",
    menu: mergedMenu,
    toppings: mergedToppings,
    categories: categoryOrder,
    updated_at: new Date().toISOString(),
  });

  if (writeErr) {
    throw new Error(`DB write failed: ${writeErr.message} (did you run menu-master-setup.sql?)`);
  }

  return {
    ok: true,
    drinks: mergedMenu.length,
    toppings: mergedToppings.length,
    categories: categoryOrder.length,
    added: freshMenu.filter((f) => !storedMenu.find((s) => s.id === f.id)).map((f) => f.name),
  };
}

export async function GET() {
  try {
    const result = await runSync();
    return Response.json(result);
  } catch (e) {
    return Response.json({ ok: false, error: String(e.message || e) }, { status: 200 });
  }
}

export async function POST() {
  return GET();
}
