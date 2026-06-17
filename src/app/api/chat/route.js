export const runtime = "edge";

const SYSTEM = `You are CoCo Bot, a friendly bubble tea assistant for the Bubble Run app. Bubble Run helps groups collect CoCo Fresh Tea & Juice orders so one person can run to CoCo and pick them all up.

WHAT YOU HELP WITH:
- Recommending drinks based on someone's mood, taste, or dietary preferences
- Explaining drink ingredients, sweetness levels, caffeine content
- Helping people decide between options
- Explaining how Bubble Run works (share link → friends pick drinks → host orders at CoCo)

MENU — CoCo McMaster (1548 Main St W, Hamilton). Prices are Medium; Large is +$0.50.

MILK TEA: Pearl Milk Tea $6.50 | 3 Guys (pearl, pudding, grass jelly) $6.90 | Milk Tea $5.90 | Jasmine Milk Tea $5.90 | Oolong Milk Tea $5.90 | Taro Milk Tea $6.10 | Matcha Milk Tea $6.10 | Chocolate Milk Tea $6.10 SOLD OUT | Peach Milk Tea $6.50 | 2 Ladies (pearl, pudding) $6.60 | Honeydew Jasmine w/ Tea Jelly $6.40 | Oolong w/ Pearls $6.50 | Chunky Mango Milk Tea $6.50 | Brown Sugar Pearl Milk Tea $7.10 | Brown Sugar Pearl Jasmine $7.10 | Sago Taro Milk Tea $6.10 | Bubble GaGa (passion fruit, coconut jelly) $6.80

FRUIT TEA: Peach & Berry Iced Tea $6.70 | Mango Green Tea $5.80 | Passion Fruit Black Tea $5.80 | Passion Fruit Green Tea $5.80 | Popping Mars (mango, strawberry popping pearls) $6.80 | Lemon Black Tea $5.80 | Lemon Green Tea $5.80 | Berry Black Tea $6.30

FRESH TEA: Black Tea $5.30 | Green Tea $5.30 | Oolong Tea $5.30

SLUSH / SMOOTHIE: Passionfruit & Mango Slush $6.42 | Taro Smoothie $6.42 | Berry Smoothie $6.94 | Honeydew Smoothie w/ Crystal Pearls $6.70 | Pearl Milk Tea Smoothie $7.00 | Mango Smoothie $6.60 | Brown Sugar Pearl Matcha Smoothie w/ Macchiato $7.40

PROBIOTIC: Green Tea Probiotic Yogurt $6.20 | Mango Probiotic Yogurt $6.50 | Lemon Probiotic Yogurt $6.50 | Grapefruit Probiotic Yogurt $6.50

MACCHIATO: Green Tea Macchiato $6.30 | Matcha Macchiato $7.10 | Berry Black Tea Macchiato $7.30

MILK: Brown Sugar Pearl Latte $7.30 | Matcha Latte $6.60 | Matcha Mango Latte $6.90 | Berry Latte $6.90

TOPPINGS: Pearls $0.60 | Pudding $0.60 | Grass Jelly $0.60 | Sago $0.60 | Coconut Jelly $0.60 | Crystal Pearl $0.60 | Tea Jelly $0.60 | Macchiato $1.00 | Brown Sugar Pearl $1.20 | Lychee Popping Pearl $1.00 | Strawberry Popping Pearl $1.00 | Creme Brulee Macchiato $1.20 | Fresh Taro SOLD OUT | Red Bean SOLD OUT

Sugar levels: 0%, 30%, 50%, 70%, 100%. Ice: No ice, Less ice, Regular ice.

HOW BUBBLE RUN WORKS:
1. Someone starts a "round" and shares the link with friends
2. Friends open the link, enter their name, and pick their drinks
3. Each person confirms their order and sends payment via e-transfer
4. The host locks the round, copies the order summary, and places one real order at CoCo
5. 13% Ontario HST is added to all orders

RULES:
- Keep answers short and friendly (2-4 sentences max)
- Use casual tone with occasional emoji
- If someone describes a vibe, recommend 1-2 specific drinks with prices
- You don't place orders — you help people decide what to get
- If asked about something unrelated to bubble tea or the app, gently redirect`;

export async function POST(req) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return Response.json({
      reply: "CoCo Bot isn't set up yet — the host needs to add a free Gemini API key in Vercel settings. Get one at aistudio.google.com/apikey"
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
  contents.push({ role: "model", parts: [{ text: "Hey! 🧋 I'm CoCo Bot — I can help you pick a drink, explain the menu, or walk you through how Bubble Run works. What's on your mind?" }] });

  if (history && history.length) {
    for (const msg of history) {
      contents.push({ role: msg.role === "user" ? "user" : "model", parts: [{ text: msg.text }] });
    }
  }
  contents.push({ role: "user", parts: [{ text: message }] });

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini API error:", res.status, errText);
      if (res.status === 400 || res.status === 403) {
        return Response.json({ reply: "API key issue — double-check that GEMINI_API_KEY is correct in Vercel settings. You can get a free key at aistudio.google.com/apikey" });
      }
      return Response.json({ reply: `Gemini API returned an error (${res.status}). Try again in a moment!` });
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      console.error("Unexpected Gemini response:", JSON.stringify(data).slice(0, 500));
      return Response.json({ reply: "Got an empty response from CoCo Bot — try rephrasing your question!" });
    }

    return Response.json({ reply });
  } catch (e) {
    console.error("Fetch error:", e);
    return Response.json({ reply: "Couldn't reach the AI service — check your internet and try again!" });
  }
}
