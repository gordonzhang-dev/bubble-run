"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  Check, X, Plus, Copy, Lock, Unlock, ShoppingBag, AlertTriangle,
  Trash2, ClipboardCheck, Sparkles, Tag, Wallet, Send, BadgeCheck,
  Pencil, Search, Share2, LogIn, ArrowLeft,
} from "lucide-react";

/* ═══════════════════════════════════════════
   CONSTANTS — Menu, Toppings, Quiz
   ═══════════════════════════════════════════ */

const SIZES = [
  { id: "M", label: "Medium", up: 0 },
  { id: "L", label: "Large", up: 0.75 },
];
const SUGAR = ["0%", "30%", "50%", "70%", "100%"];
const ICE = ["No ice", "Less ice", "Regular ice"];

const DEFAULT_MENU = [
  { id:"pmt",name:"Pearl Milk Tea",basePrice:5.5,category:"Milk Tea",color:"#caa06a",isAvailable:true },
  { id:"3guys",name:"Three Guys (pearl, pudding, grass jelly)",basePrice:6.5,category:"Milk Tea",color:"#b5894e",isAvailable:true },
  { id:"classic",name:"Classic Milk Tea",basePrice:5.25,category:"Milk Tea",color:"#c09a6b",isAvailable:true },
  { id:"bspmt",name:"Brown Sugar Pearl Milk Tea",basePrice:6.5,category:"Milk Tea",color:"#8b5e3c",isAvailable:true,deal:{label:"$1 off",price:5.5,active:true}},
  { id:"bsjmt",name:"Brown Sugar Pearl Jasmine Milk Tea",basePrice:6.5,category:"Milk Tea",color:"#a9763f",isAvailable:true },
  { id:"jasmine",name:"Jasmine Milk Tea",basePrice:5.5,category:"Milk Tea",color:"#d8c79a",isAvailable:true },
  { id:"taro",name:"Taro Milk Tea",basePrice:6.25,category:"Milk Tea",color:"#c9a9d6",isAvailable:false },
  { id:"matcha",name:"Matcha Milk Tea",basePrice:6.25,category:"Milk Tea",color:"#a7c49a",isAvailable:true },
  { id:"caramel",name:"Caramel Milk Tea",basePrice:5.75,category:"Milk Tea",color:"#b07a45",isAvailable:true },
  { id:"strawberry",name:"Strawberry Jasmine Milk Tea",basePrice:6.5,category:"Milk Tea",color:"#e89ba5",isAvailable:true,deal:{label:"New",price:6.0,active:true}},
  { id:"choco",name:"Chocolate",basePrice:5.75,category:"Milk Tea",color:"#6b4a35",isAvailable:true },
  { id:"gaga",name:"Bubble Gaga (passion fruit, coconut jelly)",basePrice:6.25,category:"Fruit Tea",color:"#e3b23c",isAvailable:true },
  { id:"passion",name:"Passion Fruit Green Tea",basePrice:5.75,category:"Fruit Tea",color:"#e8b33a",isAvailable:true },
  { id:"mango",name:"Mango Green Tea",basePrice:5.95,category:"Fruit Tea",color:"#f2a93b",isAvailable:true,deal:{label:"Summer special",price:4.95,active:true}},
  { id:"lemongreen",name:"Lemon Green Tea",basePrice:5.25,category:"Fruit Tea",color:"#d7e06a",isAvailable:true },
  { id:"lemonblack",name:"Lemon Black Tea",basePrice:5.25,category:"Fruit Tea",color:"#c9b36a",isAvailable:true },
  { id:"orangejasmine",name:"Orange Jasmine Green Tea",basePrice:5.75,category:"Fruit Tea",color:"#f0a24e",isAvailable:true },
  { id:"grapefruit",name:"Grapefruit Green Tea",basePrice:5.95,category:"Fruit Tea",color:"#ef8c8c",isAvailable:true },
  { id:"pmango",name:"Passion Fruit & Mango",basePrice:6.0,category:"Fruit Tea",color:"#f0992f",isAvailable:true },
  { id:"bslatte",name:"Brown Sugar Pearl Fresh Milk",basePrice:6.5,category:"Fresh Milk",color:"#c2a98e",isAvailable:true },
  { id:"freshpearl",name:"Fresh Milk Tea with Pearls",basePrice:5.75,category:"Fresh Milk",color:"#d9c7a8",isAvailable:true },
  { id:"mangoslush",name:"Mango Slush",basePrice:6.25,category:"Slush / Smoothie",color:"#f3b43a",isAvailable:true },
  { id:"taroslush",name:"Taro Slush",basePrice:6.25,category:"Slush / Smoothie",color:"#c9a9d6",isAvailable:true },
  { id:"pmslush",name:"Passionfruit & Mango Slush",basePrice:6.5,category:"Slush / Smoothie",color:"#f0992f",isAvailable:true },
  { id:"matchasmoothie",name:"Matcha Smoothie (salty cream foam)",basePrice:6.75,category:"Slush / Smoothie",color:"#9fbe8e",isAvailable:true },
  { id:"lemonyakult",name:"Lemon Yakult",basePrice:5.95,category:"Yakult",color:"#ebe49a",isAvailable:true },
  { id:"greenyakult",name:"Green Tea Yakult",basePrice:5.95,category:"Yakult",color:"#cfe0a0",isAvailable:true },
  { id:"orangeyakult",name:"Orange Yakult",basePrice:5.95,category:"Yakult",color:"#f2b85a",isAvailable:true },
  { id:"jasminecloud",name:"Jasmine Green Tea Cream Cloud",basePrice:5.95,category:"Cream Cloud",color:"#dde3b0",isAvailable:true },
  { id:"blackcloud",name:"Black Tea Cream Cloud (Himalayan salt)",basePrice:5.95,category:"Cream Cloud",color:"#c7ae7e",isAvailable:true },
  { id:"coldbrew",name:"Cold Brew Coffee",basePrice:5.5,category:"Coffee",color:"#5a3b28",isAvailable:true },
];

const DEFAULT_TOPPINGS = [
  { id:"pearls",name:"Pearls",price:0.75,isAvailable:true },
  { id:"pudding",name:"Pudding",price:0.75,isAvailable:true },
  { id:"grass",name:"Grass Jelly",price:0.75,isAvailable:true },
  { id:"coconut",name:"Coconut Jelly",price:0.75,isAvailable:true },
  { id:"redbean",name:"Red Bean",price:0.75,isAvailable:false },
  { id:"aloe",name:"Aloe",price:0.75,isAvailable:true },
  { id:"sago",name:"Sago",price:0.75,isAvailable:true },
  { id:"cream",name:"Cream Cloud",price:1.0,isAvailable:true },
];

const CATEGORIES = ["Milk Tea","Fruit Tea","Fresh Milk","Slush / Smoothie","Yakult","Cream Cloud","Coffee"];

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */
const money = (n) => `$${n.toFixed(2)}`;
const TAX_RATE = 0.13;
const taxOf = (n) => n * TAX_RATE;
const withTax = (n) => n * (1 + TAX_RATE);
const hasDeal = (item) => item.deal && item.deal.active;
const effectiveBase = (item) => (hasDeal(item) ? item.deal.price : item.basePrice);

function getPeople(orders) {
  const map = new Map();
  orders.forEach((o) => {
    const key = o.person.trim().toLowerCase();
    if (!key) return;
    if (!map.has(key)) map.set(key, { key, name: o.person.trim(), total: 0, count: 0 });
    const p = map.get(key);
    p.total += o.price;
    p.count += 1;
  });
  return [...map.values()];
}

// Row mapping: camelCase (app) <-> snake_case (DB)
const rowToOrder = (r) => ({
  id: r.id, person: r.person, drinkId: r.drink_id, size: r.size,
  sugar: r.sugar, ice: r.ice, toppingIds: r.topping_ids || [],
  notes: r.notes || "", price: parseFloat(r.price),
  status: r.status, hostNote: r.host_note || "",
  unavailableItems: r.unavailable_items || [],
});
const orderToRow = (o, roundId) => ({
  id: o.id, round_id: roundId, person: o.person, drink_id: o.drinkId,
  size: o.size, sugar: o.sugar, ice: o.ice, topping_ids: o.toppingIds,
  notes: o.notes, price: o.price, status: o.status,
  host_note: o.hostNote || "", unavailable_items: o.unavailableItems || [],
});

/* ═══════════════════════════════════════════
   SUPABASE SYNC — Orders diff engine
   ═══════════════════════════════════════════ */
async function syncOrders(prev, next, roundId) {
  const prevMap = new Map(prev.map(o => [o.id, o]));
  const nextMap = new Map(next.map(o => [o.id, o]));
  const promises = [];

  // Added
  for (const o of next) {
    if (!prevMap.has(o.id)) promises.push(supabase.from("orders").insert(orderToRow(o, roundId)));
  }
  // Removed
  for (const o of prev) {
    if (!nextMap.has(o.id)) promises.push(supabase.from("orders").delete().eq("id", o.id));
  }
  // Modified
  for (const o of next) {
    const old = prevMap.get(o.id);
    if (old && JSON.stringify(old) !== JSON.stringify(o)) {
      promises.push(supabase.from("orders").update(orderToRow(o, roundId)).eq("id", o.id));
    }
  }
  await Promise.allSettled(promises);
}

async function syncPayments(prev, next, roundId) {
  for (const key of Object.keys(next)) {
    const p = prev[key];
    const n = next[key];
    if (!p || p.sent !== n.sent || p.received !== n.received) {
      await supabase.from("payments").upsert({
        round_id: roundId, person_key: key, sent: n.sent, received: n.received,
      }, { onConflict: "round_id,person_key" });
    }
  }
}

/* ═══════════════════════════════════════════
   PAGE — Router (Landing vs Round)
   ═══════════════════════════════════════════ */
export default function Page() {
  const [roundId, setRoundId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get("r");
    if (r) {
      setRoundId(r);
      const saved = localStorage.getItem(`br_host_${r}`);
      if (saved) setIsHost(true);
    }
    setBooting(false);
  }, []);

  const goToRound = (id, host) => {
    window.history.pushState({}, "", `?r=${id}`);
    setRoundId(id);
    setIsHost(!!host);
  };

  if (booting) return <div className="min-h-screen bg-amber-50 flex items-center justify-center text-stone-400">Loading…</div>;
  if (!roundId) return <Landing onGo={goToRound} />;
  return <BubbleRunLive roundId={roundId} isHost={isHost} setIsHost={setIsHost} onLeave={() => { window.history.pushState({}, "", "/"); setRoundId(null); }} />;
}

/* ═══════════════════════════════════════════
   LANDING
   ═══════════════════════════════════════════ */
function Landing({ onGo }) {
  const [joinCode, setJoinCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const create = async () => {
    setCreating(true);
    setError("");
    const { data, error: err } = await supabase.from("rounds").insert({
      menu: DEFAULT_MENU, toppings: DEFAULT_TOPPINGS,
    }).select("id, host_code").single();
    if (err || !data) { setError("Couldn't create round — try again."); setCreating(false); return; }
    localStorage.setItem(`br_host_${data.id}`, data.host_code);
    onGo(data.id, true);
  };

  const join = async () => {
    const code = joinCode.trim().toLowerCase();
    if (!code) return;
    setError("");
    const { data } = await supabase.from("rounds").select("id").eq("id", code).maybeSingle();
    if (data) { onGo(code, false); return; }
    setError("Round not found — double-check the code.");
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <DrinkThumb color="#caa06a" size={56} />
          <h1 className="text-3xl font-bold tracking-tight mt-3">Bubble Run</h1>
          <p className="text-stone-500 text-sm mt-1">Drop your bubble tea order in.<br/>One person runs to CoCo.</p>
        </div>

        <button onClick={create} disabled={creating} className="w-full rounded-2xl bg-amber-800 text-white font-semibold py-4 text-base hover:bg-amber-900 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700">
          {creating ? "Creating…" : "Start a new round"}
        </button>

        <div className="flex items-center gap-3">
          <span className="flex-1 h-px bg-stone-300" />
          <span className="text-xs text-stone-400 uppercase tracking-wider">or join one</span>
          <span className="flex-1 h-px bg-stone-300" />
        </div>

        <div className="flex gap-2">
          <input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && join()} placeholder="Paste round code" className="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700" />
          <button onClick={join} className="rounded-xl bg-stone-800 text-white px-5 font-medium hover:bg-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700">
            <LogIn className="w-4 h-4" />
          </button>
        </div>

        {error && <p className="text-sm text-rose-600 text-center">{error}</p>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   BUBBLE RUN LIVE — Supabase-backed main app
   ═══════════════════════════════════════════ */
function BubbleRunLive({ roundId, isHost, setIsHost, onLeave }) {
  const [roundData, setRoundData] = useState(null);
  const [orders, _setOrders] = useState([]);
  const [payments, _setPayments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hostInput, setHostInput] = useState("");
  const [showHostPrompt, setShowHostPrompt] = useState(false);
  const [view, setView] = useState(isHost ? "host" : "order");
  const [copied, setCopied] = useState(false);

  const ordersRef = useRef(orders);
  ordersRef.current = orders;
  const paymentsRef = useRef(payments);
  paymentsRef.current = payments;

  // Fetch all data
  const fetchAll = useCallback(async () => {
    const [rRes, oRes, pRes] = await Promise.all([
      supabase.from("rounds").select("*").eq("id", roundId).maybeSingle(),
      supabase.from("orders").select("*").eq("round_id", roundId).order("created_at"),
      supabase.from("payments").select("*").eq("round_id", roundId),
    ]);
    if (!rRes.data) { setError("Round not found."); setLoading(false); return; }
    setRoundData(rRes.data);
    _setOrders((oRes.data || []).map(rowToOrder));
    const pm = {};
    (pRes.data || []).forEach(r => { pm[r.person_key] = { sent: r.sent, received: r.received }; });
    _setPayments(pm);
    setLoading(false);
  }, [roundId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase.channel(`round-${roundId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "rounds", filter: `id=eq.${roundId}` }, (p) => {
        if (p.new) setRoundData(p.new);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `round_id=eq.${roundId}` }, () => {
        supabase.from("orders").select("*").eq("round_id", roundId).order("created_at").then(({ data }) => {
          if (data) _setOrders(data.map(rowToOrder));
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "payments", filter: `round_id=eq.${roundId}` }, () => {
        supabase.from("payments").select("*").eq("round_id", roundId).then(({ data }) => {
          const pm = {};
          (data || []).forEach(r => { pm[r.person_key] = { sent: r.sent, received: r.received }; });
          _setPayments(pm);
        });
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [roundId]);

  // Wrapped setters — update local state AND sync to Supabase
  const patchRound = useCallback(async (updates) => {
    setRoundData(prev => ({ ...prev, ...updates }));
    await supabase.from("rounds").update(updates).eq("id", roundId);
  }, [roundId]);

  const menu = roundData?.menu || [];
  const toppings = roundData?.toppings || [];
  const round = useMemo(() => ({
    status: roundData?.status || "open",
    pickup: roundData?.pickup || "",
    deadline: roundData?.deadline || "",
  }), [roundData]);
  const payInfo = useMemo(() => ({
    handle: roundData?.pay_handle || "",
    name: roundData?.pay_name || "",
    note: roundData?.pay_note || "",
  }), [roundData]);

  const setRound = useCallback((updater) => {
    const cur = { status: roundData?.status||"open", pickup: roundData?.pickup||"", deadline: roundData?.deadline||"" };
    const next = typeof updater === "function" ? updater(cur) : updater;
    patchRound({ status: next.status, pickup: next.pickup, deadline: next.deadline });
  }, [roundData, patchRound]);

  const setPayInfo = useCallback((updater) => {
    const cur = { handle: roundData?.pay_handle||"", name: roundData?.pay_name||"", note: roundData?.pay_note||"" };
    const next = typeof updater === "function" ? updater(cur) : updater;
    patchRound({ pay_handle: next.handle, pay_name: next.name, pay_note: next.note });
  }, [roundData, patchRound]);

  const setMenu = useCallback((updater) => {
    const cur = roundData?.menu || [];
    const next = typeof updater === "function" ? updater(cur) : updater;
    patchRound({ menu: next });
  }, [roundData, patchRound]);

  const setToppings = useCallback((updater) => {
    const cur = roundData?.toppings || [];
    const next = typeof updater === "function" ? updater(cur) : updater;
    patchRound({ toppings: next });
  }, [roundData, patchRound]);

  const setOrders = useCallback((updater) => {
    const prev = ordersRef.current;
    const next = typeof updater === "function" ? updater(prev) : updater;
    _setOrders(next);
    syncOrders(prev, next, roundId);
  }, [roundId]);

  const setPayments = useCallback((updater) => {
    const prev = paymentsRef.current;
    const next = typeof updater === "function" ? updater(prev) : updater;
    _setPayments(next);
    syncPayments(prev, next, roundId);
  }, [roundId]);

  const total = useMemo(() => orders.reduce((s, o) => s + o.price, 0), [orders]);

  const shareLink = typeof window !== "undefined" ? `${window.location.origin}?r=${roundId}` : "";
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareLink); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  const tryHostCode = () => {
    if (hostInput.trim() === roundData?.host_code) {
      localStorage.setItem(`br_host_${roundId}`, roundData.host_code);
      setIsHost(true);
      setShowHostPrompt(false);
      setView("host");
    } else {
      setError("Wrong code.");
    }
  };

  if (loading) return <div className="min-h-screen bg-amber-50 flex items-center justify-center text-stone-400">Loading round…</div>;
  if (error && !roundData) return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
      <div className="text-center space-y-3">
        <p className="text-rose-600 font-medium">{error}</p>
        <button onClick={onLeave} className="text-sm text-stone-500 underline">Back to home</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-amber-50 text-stone-800">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <header className="flex items-center gap-3">
          <button onClick={onLeave} aria-label="Back" className="rounded-full p-1.5 text-stone-400 hover:bg-stone-200 focus-visible:outline-none"><ArrowLeft className="w-5 h-5" /></button>
          <DrinkThumb color="#caa06a" size={40} />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold tracking-tight leading-none">Bubble Run</h1>
            <p className="text-sm text-stone-500 truncate">Round <span className="font-mono">{roundId}</span></p>
          </div>
          <button onClick={copyLink} className={`inline-flex items-center gap-1.5 rounded-lg text-xs font-medium px-3 py-2 ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 ${copied ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-white text-stone-600 ring-stone-200 hover:ring-amber-700"}`}>
            {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Share2 className="w-3.5 h-3.5" /> Share</>}
          </button>
        </header>

        {/* Host code for new host */}
        {isHost && roundData?.host_code && (
          <div className="mt-3 rounded-xl bg-amber-100 ring-1 ring-amber-200 px-4 py-2.5 text-xs text-amber-900">
            <span className="font-semibold">Your host code:</span> <span className="font-mono font-bold select-all">{roundData.host_code}</span>
            <span className="text-amber-700 ml-1.5">— save this to manage from another device.</span>
          </div>
        )}

        {/* Role switcher */}
        <div className="mt-5 flex rounded-full bg-stone-200/70 p-1 text-sm font-medium">
          <button onClick={() => setView("order")} className={`flex-1 rounded-full px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 ${view === "order" ? "bg-white shadow-sm text-stone-900" : "text-stone-500"}`}>Order</button>
          {isHost ? (
            <button onClick={() => setView("host")} className={`flex-1 rounded-full px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 ${view === "host" ? "bg-white shadow-sm text-stone-900" : "text-stone-500"}`}>Host dashboard</button>
          ) : (
            <button onClick={() => setShowHostPrompt(true)} className="flex-1 rounded-full px-4 py-2 text-stone-400 hover:text-stone-600 transition-colors focus-visible:outline-none">I'm the host</button>
          )}
        </div>

        {showHostPrompt && (
          <div className="mt-2 rounded-xl bg-white ring-1 ring-stone-200 p-3 flex gap-2">
            <input value={hostInput} onChange={(e) => { setHostInput(e.target.value); setError(""); }} onKeyDown={(e) => e.key === "Enter" && tryHostCode()} placeholder="Enter host code" className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700" />
            <button onClick={tryHostCode} className="rounded-lg bg-amber-800 text-white text-sm px-4 hover:bg-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700">Go</button>
            {error && <p className="self-center text-xs text-rose-600">{error}</p>}
          </div>
        )}

        {/* Round status strip */}
        <div className="mt-4 rounded-2xl bg-white ring-1 ring-stone-200 p-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${round.status === "open" ? "bg-amber-100 text-amber-800 ring-amber-200" : "bg-stone-100 text-stone-600 ring-stone-200"}`}>
            {round.status === "open" ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}{ROUND_LABEL[round.status]}
          </span>
          {round.pickup && <span className="text-stone-500">Pickup <span className="text-stone-800 font-medium">{round.pickup}</span></span>}
          {round.deadline && <span className="text-stone-500">By <span className="text-stone-800 font-medium">{round.deadline}</span></span>}
          <span className="ml-auto font-mono text-stone-800">{orders.length} {orders.length === 1 ? "drink" : "drinks"} · {money(withTax(total))} <span className="text-stone-400">tax in</span></span>
        </div>

        <div className="mt-5">
          {view === "order" ? (
            <OrderView round={round} menu={menu} toppings={toppings} orders={orders} setOrders={setOrders} payInfo={payInfo} payments={payments} setPayments={setPayments} />
          ) : (
            <HostView round={round} setRound={setRound} menu={menu} setMenu={setMenu} toppings={toppings} setToppings={setToppings} orders={orders} setOrders={setOrders} total={total} payInfo={payInfo} setPayInfo={setPayInfo} payments={payments} setPayments={setPayments} />
          )}
        </div>

        <footer className="mt-8">
          <Pearls />
          <p className="text-center text-xs text-stone-400 mt-1">Bubble Run · Live synced via Supabase</p>
        </footer>
      </div>
    </div>
  );
}

const ROUND_FLOW = ["open","locked","ordered","ready"];
const ROUND_LABEL = { open:"Open for orders", locked:"Locked", ordered:"Ordered at CoCo", ready:"Ready for pickup" };

const STATUS_STYLE = { submitted:"bg-stone-100 text-stone-600 ring-stone-200", confirmed:"bg-emerald-50 text-emerald-700 ring-emerald-200", needs_attention:"bg-rose-50 text-rose-700 ring-rose-200" };
const STATUS_LABEL = { submitted:"Submitted", confirmed:"Confirmed", needs_attention:"Needs a swap" };

/* ═══════════════════════════════════════════
   ORDER VIEW (participant)
   ═══════════════════════════════════════════ */
function OrderView({ round, menu, toppings, orders, setOrders, payInfo, payments, setPayments }) {
  const [name, setName] = useState("");
  const [building, setBuilding] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [dealsOnly, setDealsOnly] = useState(false);
  const [hideSoldOut, setHideSoldOut] = useState(false);
  const [maxPrice, setMaxPrice] = useState(7);

  const filteredMenu = useMemo(() => {
    const q = search.trim().toLowerCase();
    return menu.filter((m) => {
      if (q && !m.name.toLowerCase().includes(q)) return false;
      if (filterCat !== "All" && m.category !== filterCat) return false;
      if (dealsOnly && !hasDeal(m)) return false;
      if (hideSoldOut && !m.isAvailable) return false;
      if (effectiveBase(m) > maxPrice) return false;
      return true;
    });
  }, [menu, search, filterCat, dealsOnly, hideSoldOut, maxPrice]);

  const myOrders = orders.filter((o) => name.trim() && o.person.toLowerCase() === name.trim().toLowerCase());
  const unconfirmedCount = myOrders.filter((o) => o.status === "submitted").length;
  const nameReady = !!name.trim();

  const surprise = () => {
    const avail = menu.filter((m) => m.isAvailable);
    if (!avail.length) return;
    const item = avail[Math.floor(Math.random() * avail.length)];
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const availTops = toppings.filter((t) => t.isAvailable);
    const shuffled = [...availTops].sort(() => Math.random() - 0.5);
    const n = Math.floor(Math.random() * 3);
    const initToppings = shuffled.slice(0, n).map((t) => t.id);
    setBuilding({ item, init: { surprise: true, size: pick(SIZES).id, sugar: pick(SUGAR), ice: pick(ICE), toppingIds: initToppings } });
  };

  if (round.status !== "open") {
    return <EmptyState icon={<Lock className="w-6 h-6 text-stone-400" />} title="Ordering's closed for now" body="The host has locked this round. Hang tight — your drink is already in the queue if you submitted one." />;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white ring-1 ring-stone-200 p-4">
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Your name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="So the host knows whose drink is whose" className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700" />
      </div>

      {myOrders.length > 0 && (
        <div className="rounded-2xl bg-white ring-1 ring-stone-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-stone-700">Your drinks</h2>
            {unconfirmedCount > 0 && <span className="rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold px-2.5 py-1">{unconfirmedCount} not confirmed</span>}
          </div>
          {unconfirmedCount > 0 && (
            <div className="mb-3 rounded-xl bg-amber-50 ring-1 ring-amber-200 p-3 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
              <p className="text-xs text-amber-900 flex-1">Almost there — tap confirm so the host counts you in. Unconfirmed drinks may get left off the run.</p>
              {unconfirmedCount > 1 && (
                <button onClick={() => setOrders((prev) => prev.map((p) => (p.person.toLowerCase() === name.trim().toLowerCase() && p.status === "submitted" ? { ...p, status: "confirmed" } : p)))} className="shrink-0 rounded-lg bg-amber-800 text-white text-xs font-medium px-3 py-1.5 hover:bg-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700">Confirm all</button>
              )}
            </div>
          )}
          <ul className="space-y-3">
            {myOrders.map((o) => (
              <MyOrderRow key={o.id} order={o} menu={menu} toppings={toppings}
                onConfirm={() => setOrders((prev) => prev.map((p) => (p.id === o.id ? { ...p, status: "confirmed" } : p)))}
                onRemove={() => setOrders((prev) => prev.filter((p) => p.id !== o.id))}
                onEdit={() => { const item = menu.find((m) => m.id === o.drinkId); if (item) setBuilding({ item, editId: o.id, init: { size: o.size, sugar: o.sugar, ice: o.ice, toppingIds: o.toppingIds, notes: o.notes } }); }}
                onFix={() => { const item = menu.find((m) => m.id === o.drinkId); setOrders((prev) => prev.filter((p) => p.id !== o.id)); if (item) setBuilding({ item, init: null }); }}
              />
            ))}
          </ul>
        </div>
      )}

      {myOrders.length > 0 && (
        <PaymentCard payInfo={payInfo} amount={myOrders.reduce((s, o) => s + o.price, 0)} pay={payments[name.trim().toLowerCase()] || { sent: false, received: false }} onToggleSent={() => setPayments((prev) => { const key = name.trim().toLowerCase(); const cur = prev[key] || { sent: false, received: false }; if (cur.received) return prev; return { ...prev, [key]: { ...cur, sent: !cur.sent } }; })} />
      )}

      <DrinkQuiz menu={menu} nameReady={nameReady} onPick={(item) => setBuilding({ item, init: null })} />

      <button onClick={surprise} disabled={!nameReady} className={`w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 ${nameReady ? "border-amber-300 text-amber-800 hover:bg-amber-100/60" : "border-stone-200 text-stone-300"}`}>
        <Sparkles className="w-4 h-4" /> Can't decide? Surprise me
      </button>

      <div>
        <h2 className="text-sm font-semibold text-stone-700 mb-2 px-1">Menu</h2>
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search drinks…" className="w-full rounded-xl border border-stone-200 bg-white pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700" />
          {search && <button onClick={() => setSearch("")} aria-label="Clear" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"><X className="w-4 h-4" /></button>}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-2 -mx-1 px-1">
          {["All", ...CATEGORIES].map((cat) => (
            <button key={cat} onClick={() => setFilterCat(cat)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 ${filterCat === cat ? "bg-stone-800 text-white ring-stone-800" : "bg-white text-stone-600 ring-stone-200 hover:ring-stone-400"}`}>{cat}</button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3 px-1">
          <label className="inline-flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer"><input type="checkbox" checked={dealsOnly} onChange={(e) => setDealsOnly(e.target.checked)} className="rounded accent-rose-600" /> On sale only</label>
          <label className="inline-flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer"><input type="checkbox" checked={hideSoldOut} onChange={(e) => setHideSoldOut(e.target.checked)} className="rounded accent-emerald-600" /> Hide sold out</label>
          <label className="inline-flex items-center gap-1.5 text-xs text-stone-600">Under <span className="font-mono font-semibold">{money(maxPrice)}</span><input type="range" min="5" max="7" step="0.25" value={maxPrice} onChange={(e) => setMaxPrice(parseFloat(e.target.value))} className="w-24 accent-amber-700" /></label>
          {(search || filterCat !== "All" || dealsOnly || hideSoldOut || maxPrice < 7) && <button onClick={() => { setSearch(""); setFilterCat("All"); setDealsOnly(false); setHideSoldOut(false); setMaxPrice(7); }} className="text-xs text-amber-800 underline">Reset</button>}
        </div>
        {(filterCat === "All" ? CATEGORIES : [filterCat]).map((cat) => {
          const items = filteredMenu.filter((m) => m.category === cat);
          if (!items.length) return null;
          return (
            <div key={cat} className="mb-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-amber-800/70 px-1 mb-2">{cat}</div>
              <div className="grid grid-cols-2 gap-2.5">
                {items.map((item) => <MenuCard key={item.id} item={item} nameReady={nameReady} onClick={() => setBuilding({ item, init: null })} />)}
              </div>
            </div>
          );
        })}
        {filteredMenu.length === 0 && <p className="text-center text-sm text-stone-400 py-6">No drinks match — try clearing a filter.</p>}
        {!nameReady && <p className="text-center text-xs text-stone-400">Add your name above to start picking.</p>}
      </div>

      {building && (
        <Customizer item={building.item} init={building.init} editing={!!building.editId} toppings={toppings} onClose={() => setBuilding(null)}
          onAdd={(order) => {
            if (building.editId) {
              setOrders((prev) => prev.map((p) => (p.id === building.editId ? { ...p, ...order, status: "submitted" } : p)));
            } else {
              setOrders((prev) => [...prev, { ...order, id: crypto.randomUUID(), person: name.trim(), status: "submitted", hostNote: "", unavailableItems: [] }]);
            }
            setBuilding(null);
          }}
        />
      )}
    </div>
  );
}

function MenuCard({ item, nameReady, onClick }) {
  const deal = hasDeal(item);
  return (
    <button disabled={!item.isAvailable || !nameReady} onClick={onClick}
      className={`text-left rounded-2xl ring-1 p-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 ${item.isAvailable ? "bg-white ring-stone-200 hover:ring-amber-700" : "bg-stone-100 ring-stone-200"} ${!nameReady ? "opacity-60" : ""}`}>
      <div className="flex gap-2.5">
        <DrinkThumb color={item.color} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1">
            <span className={`text-[13px] font-medium leading-snug ${item.isAvailable ? "text-stone-800" : "text-stone-400 line-through"}`}>{item.name}</span>
            {!item.isAvailable && <span className="shrink-0 rounded-full bg-rose-100 text-rose-700 text-[10px] font-semibold px-2 py-0.5">Sold out</span>}
          </div>
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            {deal ? (<><span className="font-mono text-xs text-stone-400 line-through">{money(item.basePrice)}</span><span className="font-mono text-xs font-semibold text-rose-600">{money(item.deal.price)}</span><span className="inline-flex items-center gap-0.5 rounded-full bg-rose-100 text-rose-700 text-[9px] font-bold px-1.5 py-0.5"><Tag className="w-2.5 h-2.5" />{item.deal.label}</span></>) : (<span className="font-mono text-xs text-stone-500">{money(item.basePrice)}</span>)}
          </div>
        </div>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════ */
function DrinkThumb({ color, size = 44 }) {
  return (
    <div style={{ width: size, height: size }} className="relative shrink-0">
      <div className="absolute left-1 right-1 top-1.5 bottom-0 overflow-hidden ring-1 ring-stone-300" style={{ background: color, borderRadius: "4px 4px 9px 9px" }}>
        <div className="absolute inset-x-0 top-0 h-1/3" style={{ background: "rgba(255,255,255,0.18)" }} />
        <div className="absolute bottom-0 inset-x-0 flex justify-center gap-px pb-0.5">
          <span className="rounded-full" style={{ width: 3, height: 3, background: "rgba(0,0,0,0.5)" }} />
          <span className="rounded-full" style={{ width: 3, height: 3, background: "rgba(0,0,0,0.5)" }} />
          <span className="rounded-full" style={{ width: 3, height: 3, background: "rgba(0,0,0,0.5)" }} />
        </div>
      </div>
      <div className="absolute left-0 right-0 top-0 h-1.5 rounded-full bg-stone-700" />
      <div className="absolute right-1.5 -top-1 w-1 rounded-full bg-stone-700" style={{ height: size * 0.32, transform: "rotate(14deg)" }} />
    </div>
  );
}

function Pearls() {
  return <div className="flex items-center justify-center gap-1.5 py-1" aria-hidden="true">{Array.from({ length: 7 }).map((_, i) => <span key={i} className="w-1.5 h-1.5 rounded-full bg-stone-300" />)}</div>;
}

function MyOrderRow({ order, menu, toppings, onConfirm, onRemove, onEdit, onFix }) {
  const drink = menu.find((m) => m.id === order.drinkId);
  const tNames = order.toppingIds.map((id) => toppings.find((t) => t.id === id)?.name).filter(Boolean);
  return (
    <li className={`rounded-xl p-3 ring-1 ${order.status === "submitted" ? "bg-amber-50 ring-amber-300" : order.status === "needs_attention" ? "bg-rose-50 ring-rose-200" : "bg-stone-50 ring-stone-200"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex gap-2.5">
          <DrinkThumb color={drink?.color || "#caa06a"} size={36} />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-stone-800">{drink?.name} <span className="text-stone-400">·</span> {SIZES.find((s) => s.id === order.size)?.label}</p>
              {order.status === "submitted" && <span className="rounded-full bg-amber-200 text-amber-900 text-[10px] font-semibold px-2 py-0.5">Not confirmed</span>}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">Sugar {order.sugar} · {order.ice}{tNames.length > 0 && <> · {tNames.join(", ")}</>}</p>
            {order.notes && <p className="text-xs text-stone-400 italic mt-0.5">&quot;{order.notes}&quot;</p>}
          </div>
        </div>
        <span className="font-mono text-sm text-stone-700 shrink-0">{money(order.price)}</span>
      </div>
      {order.status === "needs_attention" && (
        <div className="mt-2 rounded-lg bg-white ring-1 ring-rose-200 p-2.5 text-xs text-rose-700">
          <span className="font-semibold">Sold out at CoCo:</span> {order.unavailableItems?.length > 0 ? order.unavailableItems.join(", ") : "something here"}
          {order.hostNote && <p className="mt-1 text-rose-600 italic">&quot;{order.hostNote}&quot;</p>}
          <p className="mt-1 text-stone-500">Tap below to rebuild this drink.</p>
        </div>
      )}
      {order.status === "needs_attention" ? (
        <button onClick={onFix} className="mt-2.5 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 text-white text-sm font-semibold py-2.5 hover:bg-rose-700">Change this drink</button>
      ) : order.status === "confirmed" ? (
        <div className="mt-2.5 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700"><Check className="w-4 h-4" /> Confirmed</span>
          <button onClick={onRemove} className="inline-flex items-center gap-1 rounded-lg text-stone-400 text-xs px-2 py-1.5 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /> Remove</button>
        </div>
      ) : (
        <>
          <button onClick={onConfirm} className="mt-2.5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-800 text-white text-sm font-bold py-3 shadow-sm hover:bg-amber-900"><Check className="w-4 h-4" /> Confirm this drink</button>
          <div className="mt-1.5 flex items-center justify-center gap-4">
            <button onClick={onEdit} className="inline-flex items-center gap-1 text-stone-500 text-xs hover:text-amber-800"><Pencil className="w-3.5 h-3.5" /> Edit</button>
            <button onClick={onRemove} className="inline-flex items-center gap-1 text-stone-400 text-xs hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /> Remove</button>
          </div>
        </>
      )}
    </li>
  );
}

function PaymentCard({ payInfo, amount, pay, onToggleSent }) {
  const hasInfo = payInfo.handle?.trim();
  return (
    <div className="rounded-2xl bg-white ring-1 ring-stone-200 p-4">
      <h2 className="text-sm font-semibold text-stone-700 inline-flex items-center gap-1.5 mb-2"><Wallet className="w-4 h-4 text-amber-700" /> Pay the runner</h2>
      <div className="rounded-xl bg-amber-50 ring-1 ring-amber-200 px-3 py-2.5 space-y-1">
        <div className="flex items-center justify-between text-xs text-amber-900/70"><span>Subtotal</span><span className="font-mono">{money(amount)}</span></div>
        <div className="flex items-center justify-between text-xs text-amber-900/70"><span>HST (13%)</span><span className="font-mono">{money(taxOf(amount))}</span></div>
        <div className="flex items-center justify-between pt-1 border-t border-amber-200"><span className="text-sm font-medium text-amber-900">You owe</span><span className="font-mono text-lg font-bold text-amber-900">{money(withTax(amount))}</span></div>
      </div>
      {hasInfo ? (
        <div className="mt-3 space-y-1 text-sm">
          <p className="text-stone-500">Send your e-transfer to:</p>
          <p className="font-mono text-stone-900 break-all">{payInfo.handle}</p>
          {payInfo.name && <p className="text-stone-600">Name: <span className="font-medium">{payInfo.name}</span></p>}
          {payInfo.note && <p className="text-xs text-stone-500 italic">{payInfo.note}</p>}
        </div>
      ) : <p className="mt-3 text-sm text-stone-400">The host hasn&apos;t added e-transfer details yet.</p>}
      <button onClick={onToggleSent} disabled={pay.received} role="checkbox" aria-checked={pay.sent}
        className={`mt-3 w-full flex items-center gap-3 rounded-xl ring-1 px-3 py-3 text-left transition-colors ${pay.sent ? "bg-emerald-50 ring-emerald-200" : "bg-white ring-stone-200 hover:ring-amber-700"} ${pay.received ? "opacity-90 cursor-default" : ""}`}>
        <span className={`flex items-center justify-center w-6 h-6 rounded-md ring-1 shrink-0 ${pay.sent ? "bg-emerald-500 ring-emerald-500" : "bg-white ring-stone-300"}`}>{pay.sent && <Check className="w-4 h-4 text-white" />}</span>
        <span className="text-sm font-medium text-stone-800">I&apos;ve sent the e-transfer</span>
        {pay.sent && <Send className="w-4 h-4 text-emerald-600 ml-auto" />}
      </button>
      {pay.received ? (
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-emerald-50 ring-1 ring-emerald-200 px-3 py-2.5 text-sm text-emerald-800"><BadgeCheck className="w-5 h-5 shrink-0" /> Host confirmed. You&apos;re all set!</div>
      ) : pay.sent ? <p className="mt-2 text-xs text-stone-500 text-center">Marked as sent — waiting for the host to confirm.</p> : null}
    </div>
  );
}

function Customizer({ item, init, editing, toppings, onClose, onAdd }) {
  const [size, setSize] = useState(init?.size || "M");
  const [sugar, setSugar] = useState(init?.sugar || "50%");
  const [ice, setIce] = useState(init?.ice || "Regular ice");
  const [picked, setPicked] = useState(() => new Set(init?.toppingIds || []));
  const [notes, setNotes] = useState(init?.notes || "");
  const deal = hasDeal(item);
  const price = useMemo(() => {
    const up = SIZES.find((s) => s.id === size)?.up || 0;
    const tops = [...picked].reduce((s, id) => s + (toppings.find((t) => t.id === id)?.price || 0), 0);
    return effectiveBase(item) + up + tops;
  }, [size, picked, item, toppings]);
  const toggleTop = (id) => setPicked((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="fixed inset-0 z-20 flex items-end sm:items-center justify-center bg-stone-900/40 p-3">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-xl ring-1 ring-stone-200 max-h-[88vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-stone-100 flex items-start gap-3">
          <DrinkThumb color={item.color} size={48} />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold tracking-tight leading-tight">{item.name}</h3>
            {init?.surprise && <p className="text-[11px] text-amber-700 font-medium">🎲 Surprise pick — tweak it however you like</p>}
            {deal ? <p className="text-xs"><span className="text-stone-400 line-through font-mono">{money(item.basePrice)}</span> <span className="text-rose-600 font-semibold font-mono">{money(item.deal.price)}</span> <span className="text-rose-600">· {item.deal.label}</span></p> : <p className="text-xs text-stone-500">Build it the way you like.</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <ChipRow label="Size" options={SIZES.map((s) => s.label)} value={SIZES.find((s) => s.id === size)?.label} onPick={(lbl) => setSize(SIZES.find((s) => s.label === lbl).id)} />
          <ChipRow label="Sugar" options={SUGAR} value={sugar} onPick={setSugar} />
          <ChipRow label="Ice" options={ICE} value={ice} onPick={setIce} />
          <div>
            <p className="text-sm font-medium text-stone-700 mb-1.5">Toppings</p>
            <div className="grid grid-cols-2 gap-2">
              {toppings.map((t) => { const on = picked.has(t.id); return (
                <button key={t.id} disabled={!t.isAvailable} onClick={() => toggleTop(t.id)} className={`flex items-center justify-between rounded-xl ring-1 px-3 py-2 text-sm transition-colors ${!t.isAvailable ? "bg-stone-100 ring-stone-200 text-stone-400" : on ? "bg-amber-800 text-white ring-amber-800" : "bg-white ring-stone-200 text-stone-700 hover:ring-amber-700"}`}>
                  <span className={!t.isAvailable ? "line-through" : ""}>{t.name}</span>
                  {!t.isAvailable ? <span className="text-[10px] font-semibold text-rose-600">out</span> : <span className={`font-mono text-xs ${on ? "text-amber-100" : "text-stone-400"}`}>+{t.price.toFixed(2)}</span>}
                </button>
              ); })}
            </div>
          </div>
          <div><label className="block text-sm font-medium text-stone-700 mb-1.5">Notes (optional)</label><input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. extra hot, light foam" className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700" /></div>
        </div>
        <div className="sticky bottom-0 bg-white border-t border-stone-100 px-5 py-4">
          <button onClick={() => onAdd({ drinkId: item.id, size, sugar, ice, toppingIds: [...picked], notes, price })} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-800 text-white font-medium py-3 hover:bg-amber-900">
            {editing ? <><Check className="w-4 h-4" /> Save changes · <span className="font-mono">{money(price)}</span></> : <><Plus className="w-4 h-4" /> Add to order · <span className="font-mono">{money(price)}</span></>}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChipRow({ label, options, value, onPick }) {
  return (
    <div>
      <p className="text-sm font-medium text-stone-700 mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => <button key={opt} onClick={() => onPick(opt)} className={`rounded-full px-3.5 py-1.5 text-sm ring-1 transition-colors ${value === opt ? "bg-stone-800 text-white ring-stone-800" : "bg-white text-stone-600 ring-stone-200 hover:ring-stone-400"}`}>{opt}</button>)}
      </div>
    </div>
  );
}

function ToggleRow({ label, on, onToggle, color }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="flex items-center gap-2 min-w-0">
        {color && <DrinkThumb color={color} size={26} />}
        <span className={`text-sm ${on ? "text-stone-700" : "text-stone-400 line-through"}`}>{label}</span>
      </span>
      <button onClick={onToggle} role="switch" aria-checked={on} className={`relative inline-flex h-6 w-11 items-center rounded-full shrink-0 transition-colors ${on ? "bg-emerald-500" : "bg-stone-300"}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${on ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

function EmptyState({ icon, title, body }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-stone-200 p-8 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-3">{icon}</div>
      <h3 className="font-semibold text-stone-800">{title}</h3>
      <p className="text-sm text-stone-500 mt-1 max-w-xs mx-auto">{body}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DRINK QUIZ
   ═══════════════════════════════════════════ */
const QUIZ_QUESTIONS = [
  { q:"What are you in the mood for?", emoji:"✨", options:[{label:"Creamy & cozy",tags:["creamy"]},{label:"Fruity & refreshing",tags:["fruity"]},{label:"Something bold",tags:["bold"]},{label:"Frozen / blended",tags:["frozen"]}] },
  { q:"How sweet?", emoji:"🍬", options:[{label:"Sweet tooth — go big",tags:["sweet"]},{label:"Balanced, middle ground",tags:["balanced"]},{label:"Light & clean",tags:["light"]}] },
  { q:"Caffeine?", emoji:"⚡", options:[{label:"Yes, I need it",tags:["caffeine"]},{label:"Doesn't matter",tags:[]},{label:"None — caffeine-free",tags:["nocaf"]}] },
  { q:"Anything else?", emoji:"🧋", options:[{label:"Show me deals first",tags:["deal"]},{label:"Toppings are a must",tags:["toppings"]},{label:"Just show me what you've got",tags:[]}] },
];
const DRINK_TAGS = {
  pmt:["creamy","sweet","caffeine","toppings"],"3guys":["creamy","sweet","caffeine","toppings"],classic:["creamy","balanced","caffeine"],bspmt:["creamy","sweet","bold","caffeine","toppings"],bsjmt:["creamy","sweet","caffeine","toppings"],jasmine:["creamy","balanced","light","caffeine"],taro:["creamy","sweet","nocaf"],matcha:["creamy","balanced","bold","caffeine"],caramel:["creamy","sweet","bold","caffeine"],strawberry:["creamy","fruity","sweet","caffeine"],choco:["creamy","sweet","bold","nocaf"],gaga:["fruity","sweet","caffeine","toppings"],passion:["fruity","balanced","caffeine"],mango:["fruity","sweet","light","caffeine"],lemongreen:["fruity","light","caffeine"],lemonblack:["fruity","balanced","bold","caffeine"],orangejasmine:["fruity","balanced","caffeine"],grapefruit:["fruity","light","caffeine"],pmango:["fruity","sweet","caffeine"],bslatte:["creamy","sweet","nocaf","toppings"],freshpearl:["creamy","balanced","caffeine","toppings"],mangoslush:["fruity","sweet","frozen","nocaf"],taroslush:["creamy","sweet","frozen","nocaf"],pmslush:["fruity","sweet","frozen","nocaf"],matchasmoothie:["creamy","balanced","frozen","nocaf"],lemonyakult:["fruity","light","nocaf"],greenyakult:["fruity","light","caffeine"],orangeyakult:["fruity","balanced","nocaf"],jasminecloud:["creamy","light","caffeine"],blackcloud:["creamy","bold","balanced","caffeine"],coldbrew:["bold","balanced","caffeine"],
};

function DrinkQuiz({ menu, nameReady, onPick }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState([]);
  const [results, setResults] = useState(null);
  const reset = () => { setStep(0); setPicks([]); setResults(null); };
  const answer = (tags) => {
    const np = [...picks, tags];
    setPicks(np);
    if (step + 1 < QUIZ_QUESTIONS.length) { setStep(step + 1); } else {
      const allTags = np.flat();
      const wd = allTags.includes("deal");
      const scored = menu.filter((m) => m.isAvailable).map((m) => {
        const dt = DRINK_TAGS[m.id] || [];
        let sc = allTags.reduce((s, t) => s + (t === "deal" ? 0 : dt.includes(t) ? 1 : 0), 0);
        if (wd && hasDeal(m)) sc += 2;
        return { item: m, score: sc };
      }).sort((a, b) => b.score - a.score).slice(0, 3).filter((r) => r.score > 0);
      setResults(scored);
    }
  };
  const cur = QUIZ_QUESTIONS[step];
  const prog = results ? 100 : (step / QUIZ_QUESTIONS.length) * 100;
  return (
    <div className="rounded-2xl bg-white ring-1 ring-stone-200 overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-2.5 px-4 py-3.5 text-left">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 shrink-0"><Sparkles className="w-4 h-4 text-amber-800" /></span>
        <span className="flex-1"><span className="block text-sm font-semibold text-stone-800">Not sure what to get?</span><span className="block text-xs text-stone-500">Take the 4-question quiz</span></span>
        <span className="text-stone-400 text-sm">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="border-t border-stone-100 px-4 py-4">
          <div className="h-1.5 rounded-full bg-stone-100 mb-4 overflow-hidden"><div className="h-full rounded-full bg-amber-700 transition-all duration-300" style={{ width: `${prog}%` }} /></div>
          {!results ? (
            <div>
              <p className="text-lg mb-1">{cur.emoji}</p>
              <p className="text-sm font-semibold text-stone-800 mb-3">{cur.q}</p>
              <div className="space-y-2">{cur.options.map((opt) => <button key={opt.label} onClick={() => answer(opt.tags)} className="w-full text-left rounded-xl ring-1 ring-stone-200 bg-white px-4 py-3 text-sm text-stone-700 hover:ring-amber-700 hover:bg-amber-50">{opt.label}</button>)}</div>
              {step > 0 && <button onClick={() => { setStep(step - 1); setPicks(picks.slice(0, -1)); }} className="mt-3 text-xs text-stone-500 hover:text-stone-700">← Back</button>}
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-stone-800 mb-1">🎯 Here&apos;s what you should try</p>
              <p className="text-xs text-stone-500 mb-3">Tap one to customize and add it.</p>
              {results.length > 0 ? (
                <div className="space-y-2">
                  {results.map(({ item }, i) => (
                    <button key={item.id} disabled={!nameReady} onClick={() => onPick(item)} className={`w-full flex items-center gap-3 rounded-xl ring-1 bg-white p-3 text-left hover:ring-amber-700 ${i === 0 ? "ring-amber-300 bg-amber-50" : "ring-stone-200"} ${!nameReady ? "opacity-60" : ""}`}>
                      <DrinkThumb color={item.color} size={40} />
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-2"><span className="text-sm font-medium text-stone-800 truncate">{item.name}</span>{i === 0 && <span className="shrink-0 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0.5">Best match</span>}</span>
                        <span className="flex items-center gap-1.5 mt-0.5"><span className="font-mono text-xs text-stone-500">{money(effectiveBase(item))}</span>{hasDeal(item) && <span className="text-rose-600 text-[10px] font-semibold">{item.deal.label}</span>}</span>
                      </span>
                      <Plus className="w-5 h-5 text-amber-800 shrink-0" />
                    </button>
                  ))}
                </div>
              ) : <p className="text-sm text-stone-400 text-center py-3">Nothing available matches — try the menu below.</p>}
              <button onClick={reset} className="mt-4 w-full rounded-xl ring-1 ring-stone-200 text-stone-600 text-sm py-2.5 hover:bg-stone-50">Retake quiz</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   HOST VIEW
   ═══════════════════════════════════════════ */
function HostView({ round, setRound, menu, setMenu, toppings, setToppings, orders, setOrders, total, payInfo, setPayInfo, payments, setPayments }) {
  const [showSummary, setShowSummary] = useState(false);
  const [flagging, setFlagging] = useState(null);
  const [flagNote, setFlagNote] = useState("");
  const [flagItems, setFlagItems] = useState(() => new Set());
  const flagOrder = orders.find((o) => o.id === flagging) || null;
  const idx = ROUND_FLOW.indexOf(round.status);
  const nextStatus = ROUND_FLOW[idx + 1];
  const summary = useMemo(() => buildSummary(orders, menu, toppings, round, total), [orders, menu, toppings, round, total]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white ring-1 ring-stone-200 p-4">
        <h2 className="text-sm font-semibold text-stone-700 mb-3">Round</h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div><label className="block text-xs text-stone-500 mb-1">Pickup spot</label><input value={round.pickup} onChange={(e) => setRound((r) => ({ ...r, pickup: e.target.value }))} className="w-full rounded-lg border border-stone-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700" /></div>
          <div><label className="block text-xs text-stone-500 mb-1">Cutoff</label><input value={round.deadline} onChange={(e) => setRound((r) => ({ ...r, deadline: e.target.value }))} className="w-full rounded-lg border border-stone-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700" /></div>
        </div>
        <div className="flex items-center gap-1.5 mb-3">
          {ROUND_FLOW.map((s, i) => (<React.Fragment key={s}><span className={`flex-1 text-center text-[11px] font-medium rounded-full py-1 ${i <= idx ? "bg-amber-800 text-white" : "bg-stone-100 text-stone-400"}`}>{ROUND_LABEL[s]}</span>{i < ROUND_FLOW.length - 1 && <span className="text-stone-300">›</span>}</React.Fragment>))}
        </div>
        <div className="flex gap-2">
          {nextStatus && <button onClick={() => setRound((r) => ({ ...r, status: nextStatus }))} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-800 text-white text-sm font-medium py-2.5 hover:bg-amber-900">
            {nextStatus === "locked" && <><Lock className="w-4 h-4" /> Lock round</>}
            {nextStatus === "ordered" && <><ShoppingBag className="w-4 h-4" /> Mark as ordered</>}
            {nextStatus === "ready" && <><Check className="w-4 h-4" /> Mark ready</>}
          </button>}
          {idx > 0 && <button onClick={() => setRound((r) => ({ ...r, status: ROUND_FLOW[idx - 1] }))} className="rounded-xl ring-1 ring-stone-200 text-stone-500 text-sm px-4 hover:bg-stone-50">Back</button>}
        </div>
      </div>

      <div className="rounded-2xl bg-white ring-1 ring-stone-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-700">Orders coming in</h2>
          <button onClick={() => setShowSummary(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-stone-800 text-white text-xs font-medium px-3 py-1.5 hover:bg-stone-900"><ClipboardCheck className="w-3.5 h-3.5" /> Copy for CoCo</button>
        </div>
        {orders.length === 0 ? <div className="px-4 py-8 text-center text-sm text-stone-400">No drinks yet. Share the link!</div> : (
          <ul className="divide-y divide-stone-100">
            {orders.map((o) => { const drink = menu.find((m) => m.id === o.drinkId); const tNames = o.toppingIds.map((id) => toppings.find((t) => t.id === id)?.name).filter(Boolean); return (
              <li key={o.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-2.5 min-w-0">
                    <DrinkThumb color={drink?.color || "#caa06a"} size={36} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap"><span className="text-sm font-semibold text-stone-800">{o.person}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${STATUS_STYLE[o.status]}`}>{STATUS_LABEL[o.status]}</span></div>
                      <p className="text-sm text-stone-700 mt-0.5">{drink?.name} · {SIZES.find((s) => s.id === o.size)?.label}</p>
                      <p className="text-xs text-stone-500">Sugar {o.sugar} · {o.ice}{tNames.length > 0 && <> · {tNames.join(", ")}</>}</p>
                      {o.notes && <p className="text-xs text-stone-400 italic">&quot;{o.notes}&quot;</p>}
                      {o.status === "needs_attention" && <p className="text-xs text-rose-600 mt-0.5">sold out: {o.unavailableItems?.length > 0 ? o.unavailableItems.join(", ") : "—"}{o.hostNote && <> · {o.hostNote}</>}</p>}
                    </div>
                  </div>
                  <span className="font-mono text-sm text-stone-700 shrink-0">{money(o.price)}</span>
                </div>
                <div className="mt-2 flex gap-2 pl-[46px]">
                  {o.status === "needs_attention" ? <button onClick={() => setOrders((prev) => prev.map((p) => (p.id === o.id ? { ...p, status: "submitted", hostNote: "", unavailableItems: [] } : p)))} className="text-xs text-stone-500 hover:text-stone-800">Clear flag</button> : <button onClick={() => { setFlagging(o.id); setFlagNote(""); setFlagItems(new Set()); }} className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700"><AlertTriangle className="w-3.5 h-3.5" /> Flag unavailable</button>}
                </div>
              </li>
            ); })}
          </ul>
        )}
        <div className="px-4 py-3 bg-stone-50 border-t border-stone-100 space-y-1">
          <div className="flex items-center justify-between text-sm text-stone-500"><span>Subtotal · {orders.length} drinks</span><span className="font-mono">{money(total)}</span></div>
          <div className="flex items-center justify-between text-sm text-stone-500"><span>HST (13%)</span><span className="font-mono">{money(taxOf(total))}</span></div>
          <div className="flex items-center justify-between pt-1 border-t border-stone-200"><span className="text-sm font-semibold text-stone-700">Total</span><span className="font-mono text-base font-semibold text-stone-900">{money(withTax(total))}</span></div>
        </div>
      </div>

      <PaymentHost payInfo={payInfo} setPayInfo={setPayInfo} orders={orders} payments={payments} setPayments={setPayments} />
      <DealsPanel menu={menu} setMenu={setMenu} />

      <div className="rounded-2xl bg-white ring-1 ring-stone-200 p-4">
        <h2 className="text-sm font-semibold text-stone-700 mb-1">What&apos;s in stock</h2>
        <p className="text-xs text-stone-500 mb-3">Flip anything off and it shows as sold out.</p>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => { const items = menu.filter((m) => m.category === cat); if (!items.length) return null; return (
            <div key={cat}><div className="text-[11px] font-semibold uppercase tracking-wide text-amber-800/70 pt-2">{cat}</div>
            {items.map((m) => <ToggleRow key={m.id} label={m.name} color={m.color} on={m.isAvailable} onToggle={() => setMenu((prev) => prev.map((p) => (p.id === m.id ? { ...p, isAvailable: !p.isAvailable } : p)))} />)}</div>
          ); })}
          <div className="pt-2 mt-1 border-t border-stone-100 text-[11px] font-semibold uppercase tracking-wide text-amber-800/70">Toppings</div>
          {toppings.map((t) => <ToggleRow key={t.id} label={t.name} on={t.isAvailable} onToggle={() => setToppings((prev) => prev.map((p) => (p.id === t.id ? { ...p, isAvailable: !p.isAvailable } : p)))} />)}
        </div>
      </div>

      {/* Flag modal */}
      {flagging && flagOrder && (() => {
        const drink = menu.find((m) => m.id === flagOrder.drinkId);
        const ot = flagOrder.toppingIds.map((id) => toppings.find((t) => t.id === id)).filter(Boolean);
        const rows = [{ key: `drink:${drink?.id}`, name: drink?.name, kind: "Base" }, ...ot.map((t) => ({ key: `top:${t.id}`, name: t.name, kind: "Topping" }))];
        const toggle = (key) => setFlagItems((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
        const chosen = rows.filter((r) => flagItems.has(r.key)).map((r) => r.name);
        const canFlag = chosen.length > 0;
        return (
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-stone-900/40 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
              <h3 className="text-base font-bold">What&apos;s sold out?</h3>
              <p className="text-xs text-stone-500 mt-1">Uncheck whatever {flagOrder.person} can&apos;t get.</p>
              <div className="mt-3 space-y-1.5">
                {rows.map((r) => { const u = flagItems.has(r.key); return (
                  <button key={r.key} onClick={() => toggle(r.key)} className={`w-full flex items-center justify-between rounded-xl ring-1 px-3 py-2.5 text-sm ${u ? "bg-rose-50 ring-rose-300" : "bg-white ring-stone-200"}`}>
                    <span className="flex items-center gap-2">
                      <span className={`flex items-center justify-center w-5 h-5 rounded-md ring-1 ${u ? "bg-white ring-rose-300" : "bg-emerald-500 ring-emerald-500"}`}>{!u && <Check className="w-3.5 h-3.5 text-white" />}{u && <X className="w-3.5 h-3.5 text-rose-500" />}</span>
                      <span className={u ? "text-rose-700 line-through" : "text-stone-800"}>{r.name}</span>
                    </span>
                    <span className="text-[10px] uppercase tracking-wide text-stone-400">{r.kind}</span>
                  </button>
                ); })}
              </div>
              <input value={flagNote} onChange={(e) => setFlagNote(e.target.value)} placeholder="Add a note (optional)" className="mt-3 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600" />
              <div className="mt-4 flex gap-2">
                <button onClick={() => setFlagging(null)} className="flex-1 rounded-xl ring-1 ring-stone-200 text-stone-600 text-sm py-2.5 hover:bg-stone-50">Cancel</button>
                <button disabled={!canFlag} onClick={() => { setOrders((prev) => prev.map((p) => (p.id === flagging ? { ...p, status: "needs_attention", hostNote: flagNote, unavailableItems: chosen } : p))); setFlagging(null); }} className={`flex-1 rounded-xl text-white text-sm py-2.5 ${canFlag ? "bg-rose-600 hover:bg-rose-700" : "bg-stone-300 cursor-not-allowed"}`}>{canFlag ? `Flag ${chosen.length} item${chosen.length > 1 ? "s" : ""}` : "Pick what's out"}</button>
              </div>
            </div>
          </div>
        );
      })()}

      {showSummary && <SummaryModal text={summary} onClose={() => setShowSummary(false)} />}
    </div>
  );
}

function PaymentHost({ payInfo, setPayInfo, orders, payments, setPayments }) {
  const people = getPeople(orders);
  const collected = people.reduce((s, p) => s + (payments[p.key]?.received ? withTax(p.total) : 0), 0);
  const grand = people.reduce((s, p) => s + withTax(p.total), 0);
  const setReceived = (key, val) => setPayments((prev) => ({ ...prev, [key]: { sent: prev[key]?.sent ?? false, received: val } }));
  return (
    <div className="rounded-2xl bg-white ring-1 ring-stone-200 p-4">
      <h2 className="text-sm font-semibold text-stone-700 inline-flex items-center gap-1.5 mb-1"><Wallet className="w-4 h-4 text-amber-700" /> Getting paid</h2>
      <p className="text-xs text-stone-500 mb-3">Your e-transfer details show up for everyone.</p>
      <div className="space-y-2.5">
        <div><label className="block text-xs text-stone-500 mb-1">Interac e-Transfer email or phone</label><input value={payInfo.handle} onChange={(e) => setPayInfo((p) => ({ ...p, handle: e.target.value }))} placeholder="you@email.com" className="w-full rounded-lg border border-stone-200 px-2.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-700" /></div>
        <div className="grid grid-cols-2 gap-2.5">
          <div><label className="block text-xs text-stone-500 mb-1">Recipient name</label><input value={payInfo.name} onChange={(e) => setPayInfo((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-lg border border-stone-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700" /></div>
          <div><label className="block text-xs text-stone-500 mb-1">Note (optional)</label><input value={payInfo.note} onChange={(e) => setPayInfo((p) => ({ ...p, note: e.target.value }))} className="w-full rounded-lg border border-stone-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700" /></div>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2"><h3 className="text-xs font-semibold uppercase tracking-wide text-amber-800/70">Who&apos;s paid</h3><span className="text-xs text-stone-500">Collected <span className="font-mono font-semibold text-stone-800">{money(collected)}</span> / {money(grand)}</span></div>
        {people.length === 0 ? <p className="text-xs text-stone-400">No orders yet.</p> : (
          <ul className="divide-y divide-stone-100">
            {people.map((p) => { const pay = payments[p.key] || { sent: false, received: false }; return (
              <li key={p.key} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><span className="text-sm font-medium text-stone-800">{p.name}</span>{pay.sent && !pay.received && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5"><Send className="w-2.5 h-2.5" /> says sent</span>}</div>
                  <span className="text-xs text-stone-500 font-mono">{money(withTax(p.total))} <span className="text-stone-400">incl. tax</span> · {p.count} {p.count === 1 ? "drink" : "drinks"}</span>
                </div>
                <button onClick={() => setReceived(p.key, !pay.received)} className={`inline-flex items-center gap-1.5 rounded-lg text-xs font-medium px-3 py-2 ${pay.received ? "bg-emerald-500 text-white hover:bg-emerald-600" : "ring-1 ring-stone-200 text-stone-600 hover:bg-stone-50"}`}>
                  {pay.received ? <><BadgeCheck className="w-4 h-4" /> Received</> : "Mark received"}
                </button>
              </li>
            ); })}
          </ul>
        )}
      </div>
    </div>
  );
}

function DealsPanel({ menu, setMenu }) {
  const [adding, setAdding] = useState("");
  const withDeal = menu.filter((m) => m.deal);
  const without = menu.filter((m) => !m.deal);
  const addDeal = (id) => { if (!id) return; setMenu((prev) => prev.map((m) => (m.id === id ? { ...m, deal: { label: "Special", price: +(Math.max(0, m.basePrice - 1)).toFixed(2), active: true } } : m))); setAdding(""); };
  const update = (id, patch) => setMenu((prev) => prev.map((m) => (m.id === id ? { ...m, deal: { ...m.deal, ...patch } } : m)));
  const remove = (id) => setMenu((prev) => prev.map((m) => { if (m.id !== id) return m; const { deal, ...rest } = m; return rest; }));
  return (
    <div className="rounded-2xl bg-white ring-1 ring-stone-200 p-4">
      <h2 className="text-sm font-semibold text-stone-700 mb-1 inline-flex items-center gap-1.5"><Tag className="w-4 h-4 text-rose-600" /> Deals &amp; promos</h2>
      <p className="text-xs text-stone-500 mb-3">Active deals show the lower price to everyone.</p>
      <div className="space-y-2">
        {withDeal.length === 0 && <p className="text-xs text-stone-400">No deals running.</p>}
        {withDeal.map((m) => (
          <div key={m.id} className={`rounded-xl ring-1 p-3 ${m.deal.active ? "bg-rose-50 ring-rose-200" : "bg-stone-50 ring-stone-200"}`}>
            <div className="flex items-center gap-2.5"><DrinkThumb color={m.color} size={32} /><span className="text-sm font-medium text-stone-800 flex-1 min-w-0">{m.name}</span><button onClick={() => remove(m.id)} className="text-stone-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button></div>
            <div className="mt-2 flex items-end gap-2 flex-wrap">
              <label className="text-xs text-stone-500">Label<input value={m.deal.label} onChange={(e) => update(m.id, { label: e.target.value })} className="mt-0.5 block w-28 rounded-lg border border-stone-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600" /></label>
              <label className="text-xs text-stone-500">Deal price<input type="number" step="0.25" value={m.deal.price} onChange={(e) => update(m.id, { price: parseFloat(e.target.value) || 0 })} className="mt-0.5 block w-24 rounded-lg border border-stone-200 px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-600" /></label>
              <span className="text-xs text-stone-400 mb-1.5">was <span className="font-mono line-through">{money(m.basePrice)}</span></span>
              <div className="ml-auto flex items-center gap-2 mb-0.5">
                <span className="text-xs text-stone-500">{m.deal.active ? "Live" : "Paused"}</span>
                <button onClick={() => update(m.id, { active: !m.deal.active })} role="switch" aria-checked={m.deal.active} className={`relative inline-flex h-6 w-11 items-center rounded-full ${m.deal.active ? "bg-rose-500" : "bg-stone-300"}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white ${m.deal.active ? "translate-x-6" : "translate-x-1"}`} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3"><select value={adding} onChange={(e) => addDeal(e.target.value)} className="w-full rounded-lg border border-stone-200 px-2.5 py-2 text-sm text-stone-600 focus:outline-none focus:ring-2 focus:ring-rose-600"><option value="">+ Add a deal to a drink…</option>{without.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
    </div>
  );
}

function SummaryModal({ text, onClose }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {} };
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-stone-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between"><h3 className="text-base font-bold">Order summary</h3><button onClick={onClose} className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100"><X className="w-5 h-5" /></button></div>
        <p className="text-xs text-stone-500 mt-1 mb-3">Copy and type into the CoCo app.</p>
        <textarea readOnly value={text} rows={Math.min(16, text.split("\n").length + 1)} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 font-mono text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-700" />
        <button onClick={copy} className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-800 text-white font-medium py-2.5 hover:bg-amber-900">{copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy to clipboard</>}</button>
      </div>
    </div>
  );
}

function buildSummary(orders, menu, toppings, round, total) {
  const lines = [`CoCo group order — ${round.pickup}`, `Cutoff: ${round.deadline}`, `${orders.length} drinks`, ""];
  orders.forEach((o, i) => {
    const drink = menu.find((m) => m.id === o.drinkId);
    const tNames = o.toppingIds.map((id) => toppings.find((t) => t.id === id)?.name).filter(Boolean);
    lines.push(`${i + 1}. ${o.person} — ${drink?.name} (${SIZES.find((s) => s.id === o.size)?.label})`);
    lines.push(`   Sugar ${o.sugar}, ${o.ice}`);
    if (tNames.length) lines.push(`   + ${tNames.join(", ")}`);
    if (o.notes) lines.push(`   note: ${o.notes}`);
  });
  lines.push("", `Subtotal: ${money(total)}`, `HST (13%): ${money(taxOf(total))}`, `Total: ${money(withTax(total))}`);
  return lines.join("\n");
}
