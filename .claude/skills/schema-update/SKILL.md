---
name: schema-update
description: Guide through Supabase schema changes safely — migration SQL, RLS policies, trigger updates, and rollback steps.
disable-model-invocation: true
---

# Schema Update — $ARGUMENTS

This project uses Supabase (PostgreSQL) with Row Level Security (RLS) and database triggers. Follow this checklist for any schema change:

## Steps

1. **Write the migration SQL** — new table/column/index changes go in a new `.sql` file (e.g., `migrate_<description>.sql`). Do NOT modify `schema.sql` directly for incremental changes; `schema.sql` is the full baseline.

2. **RLS policies** — every new table needs RLS enabled and at least one policy:
   ```sql
   ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "<table>_user_policy" ON <table>
     USING (auth.uid() = user_id);
   ```

3. **Triggers** — if balances or derived fields need updating, write a trigger function + attach it (see `handle_transaction_balance()` in `schema.sql` as a reference pattern).

4. **Update TypeScript types** — if `src/lib/supabase.ts` has manual types, update them to match the new schema.

5. **Test the migration** — apply to the dev Supabase project first. Verify RLS blocks access cross-user.

6. **Rollback** — write the inverse `DROP`/`ALTER` statements at the bottom of the migration file as comments so they're easy to find.

## Key existing tables
- `profiles` — linked to `auth.users`, created automatically via `on_auth_user_created` trigger
- `accounts` — user financial accounts; balances updated by `on_transaction_change` trigger
- `categories` — mix of global defaults and user-specific; filter by `user_id IS NULL` for globals
- `transactions` — core records; inserting/updating/deleting here fires balance triggers
