# Agent: DB Migration Workflow

## Purpose
Add or modify database tables and apply the migration locally.

## Steps

### 1. Edit Schema
Modify `packages/data-ops/src/db/ems-schema.ts` using Drizzle ORM sqlite-core syntax.

### 2. Generate Migration SQL
```bash
cd packages/data-ops
pnpm generate
```
This reads `drizzle.config.ts` (schema: `./src/db/ems-schema.ts`, tablesFilter: `["member_profile", "training_session"]`) and produces a new `.sql` file in `./src/drizzle-out/`.

### 3. Apply Locally
```bash
# From repo root:
wrangler d1 migrations apply DB --local --config apps/user-application/wrangler.jsonc
```

### 4. Update Query Files
If you added columns, update the relevant query functions in `packages/data-ops/src/queries/`.

### 5. Rebuild data-ops (if needed for type checking)
```bash
cd packages/data-ops
pnpm build
```

## Notes
- The `tablesFilter` in `drizzle.config.ts` ensures only EMS tables are managed (auth tables are untouched)
- Auth tables (`user`, `session`, `account`, `verification`) are in `auth-schema.ts` — never touch them manually
- For remote D1 (production), set `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_DATABASE_ID`, `CLOUDFLARE_D1_TOKEN` env vars, then `pnpm migrate`
