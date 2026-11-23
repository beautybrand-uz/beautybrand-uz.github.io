-- Сколько раз заказывали каждый товар — для строки «Заказали N раз» и значка «Хит продаж» на сайте.
-- Выполните после supabase/admin.sql (нужна таблица orders).
--
-- Покупатели не видят сами заказы (имена, телефоны, адреса закрыты политиками RLS).
-- Эта функция отдаёт наружу только итог: товар → число заказов и штук. Отменённые не считаются.

create or replace function public.product_sales()
returns table (slug text, orders bigint, qty bigint)
language sql
stable
security definer
set search_path = public
as $$
  select i ->> 'slug' as slug,
         count(distinct o.id) as orders,
         coalesce(sum((i ->> 'qty')::int), 0) as qty
  from public.orders o
  cross join lateral jsonb_array_elements(o.items) as i
  where o.status <> 'cancelled'
    and i ? 'slug'
  group by 1
$$;

revoke all on function public.product_sales() from public;
grant execute on function public.product_sales() to anon, authenticated;
