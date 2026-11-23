-- Товары, добавленные через админку (раздел «Добавить товар»), и хранилище их фото.
-- Выполнить ПОСЛЕ admin.sql: Supabase → SQL Editor → вставить файл → Run.

create table if not exists public.shop_products (
  slug            text primary key check (slug ~ '^[a-z0-9-]{2,120}$'),
  created_at      timestamptz not null default now(),
  brand           text not null check (char_length(brand) between 1 and 80),
  name            text not null check (char_length(name) between 1 and 160),
  category        text not null check (category in ('makeup','skin','hair','fragrance','body','tools','sets')),
  price           bigint not null default 0 check (price >= 0),          -- сум; для «флакона под заказ» 0
  old_price       bigint check (old_price is null or old_price > 0),       -- цена до скидки
  variants        jsonb,                                                   -- [{label, price}]
  usd             jsonb,                                                   -- [{label, usd}] — флаконы под заказ
  bottle          text check (char_length(bottle) <= 120),
  description_ru  text not null default '' check (char_length(description_ru) <= 2000),
  description_uz  text not null default '' check (char_length(description_uz) <= 2000),
  images          text[] not null default '{}',
  boutique        boolean not null default false,                          -- Maison De Mari
  published       boolean not null default true
);
alter table public.shop_products enable row level security;

drop policy if exists "shop_products: read published" on public.shop_products;
create policy "shop_products: read published" on public.shop_products
  for select to anon, authenticated using (published or public.is_admin());

drop policy if exists "shop_products: admin write" on public.shop_products;
create policy "shop_products: admin write" on public.shop_products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.shop_products to anon, authenticated;
grant insert, update, delete on public.shop_products to authenticated;

-- кто добавил и кто последней редактировал товар (имя из таблицы admins)
alter table public.shop_products add column if not exists created_by text;
alter table public.shop_products add column if not exists updated_by text;
alter table public.shop_products add column if not exists updated_at timestamptz;
create or replace function public.shop_products_staff() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := public.my_name();
  else
    new.created_by := old.created_by;
  end if;
  new.updated_by := public.my_name();
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists shop_products_staff on public.shop_products;
create trigger shop_products_staff before insert or update on public.shop_products
  for each row execute function public.shop_products_staff();

-- ——— хранилище фото: читать могут все, загружать и удалять — только админ ———
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product-images: admin write" on storage.objects;
create policy "product-images: admin write" on storage.objects
  for all to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());
