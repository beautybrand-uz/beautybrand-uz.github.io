-- Админка beautybrand.uz: заказы и права администратора.
-- Выполнить ПОСЛЕ reviews.sql: Supabase → SQL Editor → вставить файл → Run.
--
-- Как дать себе доступ в админку:
--   1. Supabase → Authentication → Users → Add user → Create new user (почта + пароль, «Auto Confirm User»).
--   2. Выполнить в SQL Editor (подставьте свою почту):
--        insert into public.admins (user_id)
--        select id from auth.users where email = 'ваша@почта';
--   3. Открыть сайт /admin и войти с этой почтой и паролем.

-- ——— кто администратор ———
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "admins: self read" on public.admins;
create policy "admins: self read" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- ——— отзывы: админ видит все и меняет статус ———
drop policy if exists "reviews: admin read all" on public.reviews;
create policy "reviews: admin read all" on public.reviews
  for select to authenticated using (public.is_admin());

drop policy if exists "reviews: admin moderate" on public.reviews;
create policy "reviews: admin moderate" on public.reviews
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "reviews: admin delete" on public.reviews;
create policy "reviews: admin delete" on public.reviews
  for delete to authenticated using (public.is_admin());

grant update, delete on public.reviews to authenticated;

-- ——— заказы из корзины ———
create table if not exists public.orders (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) between 1 and 80),
  phone       text not null check (char_length(phone) between 5 and 30),
  method      text not null,                    -- id магазина (c5, c1) или 'delivery'
  address     text check (char_length(address) <= 300),
  comment     text check (char_length(comment) <= 1000),
  items       jsonb not null,                   -- [{slug, name, variant, qty, price}]
  total       bigint not null check (total >= 0),
  lang        text not null default 'ru' check (lang in ('ru', 'uz')),
  status      text not null default 'new'
              check (status in ('new', 'confirmed', 'ready', 'done', 'cancelled')),
  note        text check (char_length(note) <= 1000)  -- заметка менеджера
);
create index if not exists orders_created on public.orders (created_at desc);
alter table public.orders enable row level security;

-- посетитель может только создать заказ со статусом «новый»; читать заказы не может
drop policy if exists "orders: submit" on public.orders;
create policy "orders: submit" on public.orders
  for insert to anon, authenticated
  with check (status = 'new' and note is null);

drop policy if exists "orders: admin read" on public.orders;
create policy "orders: admin read" on public.orders
  for select to authenticated using (public.is_admin());

drop policy if exists "orders: admin update" on public.orders;
create policy "orders: admin update" on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

grant insert on public.orders to anon, authenticated;
grant select, update on public.orders to authenticated;
