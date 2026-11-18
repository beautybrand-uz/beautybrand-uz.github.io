-- Отзывы покупателей для beautybrand.uz
-- Выполнить один раз: Supabase → SQL Editor → вставить этот файл → Run.
--
-- Как это работает:
--   * посетитель сайта может только ДОБАВИТЬ отзыв, и он сохраняется со статусом 'pending' (на проверке);
--   * на сайте видны только отзывы со статусом 'approved';
--   * проверка: Supabase → Table Editor → reviews → поменять status на 'approved' или 'rejected'
--     (позже это будет делать админка сайта).

create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  product     text not null check (char_length(product) between 1 and 120), -- slug товара
  name        text not null check (char_length(name) between 1 and 60),
  rating      smallint not null check (rating between 1 and 5),
  text        text not null check (char_length(text) between 3 and 1500),
  lang        text not null default 'ru' check (lang in ('ru', 'uz')),
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected'))
);

create index if not exists reviews_product_approved
  on public.reviews (product, created_at desc)
  where status = 'approved';

alter table public.reviews enable row level security;

-- читать можно только одобренные
drop policy if exists "reviews: read approved" on public.reviews;
create policy "reviews: read approved" on public.reviews
  for select to anon, authenticated
  using (status = 'approved');

-- добавлять можно только как «на проверке»; одобрить с сайта нельзя
drop policy if exists "reviews: submit pending" on public.reviews;
create policy "reviews: submit pending" on public.reviews
  for insert to anon, authenticated
  with check (status = 'pending');

grant select, insert on public.reviews to anon, authenticated;
