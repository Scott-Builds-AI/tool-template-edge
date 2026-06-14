-- =============================================================================
-- Starter D1 migration. Apply via wrangler:
--   npx wrangler d1 execute <YOUR_DB_NAME> --file=migrations/0001_init.sql --remote
--
-- The deploy.yml GitHub Action runs this automatically on every push to main.
--
-- KEY CONVENTION: every table has a `user_id` NOT NULL column. The SDK's
-- `scopedQuery / scopedInsert / scopedExec` helpers refuse to operate on
-- queries that don't filter by user_id — this column is non-negotiable.
-- =============================================================================

create table if not exists demo_items (
  id           text          primary key,
  user_id      text          not null,
  label        text          not null,
  created_at   integer       not null
);

create index if not exists demo_items_user_id_idx on demo_items(user_id);
