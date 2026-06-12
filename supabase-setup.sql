-- ============================================
-- BUBBLE RUN — Supabase Database Setup
-- Paste this entire file into Supabase SQL Editor and hit Run
-- ============================================

-- 1. ROUNDS TABLE (host-managed config)
create table if not exists rounds (
  id text primary key default substr(replace(gen_random_uuid()::text, '-', ''), 1, 8),
  host_code text not null default substr(replace(gen_random_uuid()::text, '-', ''), 1, 6),
  status text not null default 'open',
  pickup text default 'CoCo',
  deadline text default '',
  pay_handle text default '',
  pay_name text default '',
  pay_note text default '',
  menu jsonb not null default '[]'::jsonb,
  toppings jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 2. ORDERS TABLE (one row per drink per person)
create table if not exists orders (
  id text primary key default gen_random_uuid()::text,
  round_id text not null references rounds(id) on delete cascade,
  person text not null,
  drink_id text not null,
  size text default 'M',
  sugar text default '50%',
  ice text default 'Regular ice',
  topping_ids text[] default '{}',
  notes text default '',
  price numeric(6,2) not null default 0,
  status text default 'submitted',
  host_note text default '',
  unavailable_items text[] default '{}',
  created_at timestamptz default now()
);

-- 3. PAYMENTS TABLE (one row per person per round)
create table if not exists payments (
  round_id text not null references rounds(id) on delete cascade,
  person_key text not null,
  sent boolean default false,
  received boolean default false,
  primary key (round_id, person_key)
);

-- 4. ENABLE ROW LEVEL SECURITY (required by Supabase)
alter table rounds enable row level security;
alter table orders enable row level security;
alter table payments enable row level security;

-- 5. PERMISSIVE POLICIES (public app, no auth)
create policy "rounds_all" on rounds for all using (true) with check (true);
create policy "orders_all" on orders for all using (true) with check (true);
create policy "payments_all" on payments for all using (true) with check (true);

-- 6. ENABLE REALTIME on all tables
alter publication supabase_realtime add table rounds;
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table payments;

-- Done! You should see "Success. No rows returned" — that's correct.
