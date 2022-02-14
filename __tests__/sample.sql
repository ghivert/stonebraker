-- name: create_migrations_table
create table caravel_migrations (version text primary key);

-- name: is_migrations_table_existing
select exists (
  select table_name
  from information_schema.tables
  where table_name = 'caravel_migrations'
);

-- name: get_all_migrations
select * from caravel_migrations order by version;

-- name: select_by_id
-- keys: id
select * from caravel_migrations where id = $id;

-- name: select_by_id_and_name
-- keys: id, name
select * from caravel_migrations where id = $id and name = $name;
