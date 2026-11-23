-- Сотрудницы админки: даёт доступ трём аккаунтам и подписывает их именами.
-- Выполнить ПОСЛЕДНИМ, после reviews.sql → admin.sql → products.sql → sales.sql,
-- и после того, как в Supabase → Authentication → Users созданы аккаунты с этими почтами.
-- Почты и имена должны совпадать с shop/src/components/admin/staff.tsx.

insert into public.admins (user_id, name)
select u.id, s.name
from (values
  ('malika@beautybrand.uz', 'Малика'),
  ('dilnoza@beautybrand.uz', 'Дилноза'),
  ('sevara@beautybrand.uz', 'Севара')
) as s (email, name)
join auth.users u on lower(u.email) = s.email
on conflict (user_id) do update set name = excluded.name;

-- проверка: должно вывести три строки с именами
select a.name, u.email
from public.admins a
join auth.users u on u.id = a.user_id
order by a.name;
