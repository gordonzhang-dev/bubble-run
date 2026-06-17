const SYSTEM = `You are CoCo Bot, a friendly bubble tea assistant for the Bubble Run app. Bubble Run helps groups collect CoCo Fresh Tea & Juice orders so one person can run to CoCo and pick them all up.

WHAT YOU HELP WITH:
- Recommending drinks based on mood, taste, or dietary preferences
- Explaining drink ingredients, sweetness levels, caffeine content
- Helping people decide between options
- Explaining how Bubble Run works

MENU — CoCo McMaster (Hamilton). Prices are Medium; Large is +$0.50.

MILK TEA: Pearl Milk Tea $6.50 | 3 Guys $6.90 | Milk Tea $5.90 | Jasmine Milk Tea $5.90 | Oolong Milk Tea $5.90 | Taro Milk Tea $6.10 | Matcha Milk Tea $6.10 | Peach Milk Tea $6.50 | 2 Ladies $6.60 | Honeydew Jasmine w/ Tea Jelly $6.40 | Oolong w/ Pearls $6.50 | Chunky Mango Milk Tea $6.50 | Brown Sugar Pearl Milk Tea $7.10 | Brown Sugar Pearl Jasmine $7.10 | Sago Taro $6.10 | Bubble GaGa $6.80
FRUIT TEA: Peach & Berry Iced Tea $6.70 | Mango Green Tea $5.80 | Passion Fruit Black/Green Tea $5.80 | Popping Mars $6.80 | Lemon Black/Green Tea $5.80 | Berry Black Tea $6.30
FRESH TEA: Black/Green/Oolong Tea $5.30
SLUSH/SMOOTHIE: PM Slush $6.42 | Taro Smoothie $6.42 | Berry Smoothie $6.94 | Honeydew Smoothie $6.70 | PMT Smoothie $7.00 | Mango Smoothie $6.60 | BS Matcha Smoothie $7.40
PROBIOTIC: Green Tea Yogurt $6.20 | Mango/Lemon/Grapefruit Yogurt $6.50
MACCHIATO: Green Tea $6.30 | Matcha $7.10 | Berry Black Tea $7.30
MILK: BS Pearl Latte $7.30 | Matcha Latte $6.60 | Matcha Mango Latte $6.90 | Berry Latte $6.90
TOPPINGS: Pearls/Pudding/Grass Jelly/Sago/Coconut Jelly/Crystal Pearl/Tea Jelly $0.60 | Macchiato/Lychee Pop/Strawberry Pop $1.00 | Brown Sugar Pearl/Creme Brulee $1.20
Sugar: 0-100%. Ice: No/Less/Regular. 13% HST on all orders.

Keep answers short (2-3 sentences), casual, with occasional emoji. Recommend specific drinks with prices when asked.`;

export async function POST(req) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return Response.json({
      reply: "CoCo Bot isn't set up yet — the host needs to add a Gemini API key. Get one free at aistudio.google.com/apikey"
    });
  }

  let message, history;
  try {
    const body = await req.json();
    message = body.message;
    history = body.history;
  } catch {
    return Response.json({ reply: "Something went wrong reading your message." });
  }

  const contents = [];
  contents.push({ role: "user", parts: [{ text: SYSTEM + "\n\nSay hi briefly." }] });
  contents.push({ role: "model", parts: [{ text: "Hey! 🧋 I'm CoCo Bot — ask me about any drink on the menu or tell me what vibe you're going for!" }] });

  if (history && history.length) {
    for (const msg of history) {
      contents.push({ role: msg.role === "user" ? "user" : "model", parts: [{ text: msg.text }] });
    }
  }
  contents.push({ role: "user", parts: [{ text: message }] });

  // Try multiple models in case one is rate-limited
  const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents }),
        }
      );

      if (res.status === 429) continue; // try next model
      if (!res.ok) {
        const errText = await res.text();
        if (res.status === 400 || res.status === 403) {
          return Response.json({ reply: "API key issue — check GEMINI_API_KEY in Vercel. Get a free key at aistudio.google.com/apikey" });
        }
        return Response.json({ reply: `API error (${res.status}). Try again in a moment!` });
      }

      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) return Response.json({ reply });
    } catch {
      continue;
    }
  }

  return Response.json({ reply: "All models are busy right now — try again in about 30 seconds! 🧋" });
}
