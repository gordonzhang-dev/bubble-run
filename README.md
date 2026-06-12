# Bubble Run — Group CoCo Orders

A web app for collecting bubble tea orders from friends. You share a link, they pick their drinks, and you place one order at CoCo.

## Deploy in 5 steps

### 1. Run the database setup
- Go to your Supabase dashboard → **SQL Editor** → **New query**
- Paste the contents of `supabase-setup.sql` and click **Run**
- You should see "Success. No rows returned" — that's correct

### 2. Push to GitHub
- Create a new repo at github.com/new (name it `bubble-run`, keep it public or private)
- Push this folder to it:
```bash
cd bubble-run
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bubble-run.git
git push -u origin main
```

### 3. Deploy on Vercel
- Go to vercel.com → **New Project**
- Import your `bubble-run` GitHub repo
- Before clicking Deploy, expand **Environment Variables** and add:
  - `NEXT_PUBLIC_SUPABASE_URL` = `https://gycujgbolifojauhzozz.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your anon key from .env.local)
- Click **Deploy**
- Wait ~60 seconds — you'll get a URL like `bubble-run-xyz.vercel.app`

### 4. Share the link
- Open your deployed URL
- Click **Start a new round**
- Save the **host code** shown (you need it to manage from other devices)
- Click the **Share** button to copy the link
- Send the link to your friends

### 5. That's it!
- Friends open the link, type their name, pick a drink
- You see orders roll in live on the Host dashboard
- Lock the round when you're ready to order
- Place the real order at CoCo using the "Copy for CoCo" button

## Local development (optional)
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Tech stack
- Next.js 14 + React 18
- Supabase (Postgres + Realtime)
- Tailwind CSS
- Lucide icons
