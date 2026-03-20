# Agent: Full-Stack Feature (Schema → API → UI)

## Purpose
Build a complete feature end-to-end: schema change, backend query, tRPC procedure, frontend page.

## Checklist

### 1. Schema (if new table/column)
- Edit `packages/data-ops/src/db/ems-schema.ts`
- Run `cd packages/data-ops && pnpm generate`
- Apply migration: `wrangler d1 migrations apply DB --local --config apps/user-application/wrangler.jsonc`

### 2. Backend Query
- Add function(s) to `packages/data-ops/src/queries/<relevant>.ts`
- Import `getDb()` from `../db/database`
- Import tables from `../db/ems-schema`

### 3. tRPC Procedure
- Add to the relevant router in `apps/user-application/worker/trpc/routers/`
- Use `t.procedure` or `adminProcedure`
- Validate all inputs with Zod
- Key rules: corrected_points computed server-side, dates as YYYY-MM-DD strings

### 4. Frontend Route
- Create `apps/user-application/src/routes/app/_authed/[feature].tsx`
- Add `loader` with `prefetchQuery` calls
- Component uses `useSuspenseQuery` / `useMutation`
- Use shadcn/ui components, `sonner` for toasts

### 5. Navigation (if needed)
- Add link to `apps/user-application/src/components/common/nav-main.tsx`

### 6. Route Tree
- `routeTree.gen.ts` auto-regenerates on `pnpm dev` — or manually update it

## Reference Files
- Schema: `packages/data-ops/src/db/ems-schema.ts`
- Auth: `packages/data-ops/src/auth.ts`
- tRPC context: `apps/user-application/worker/trpc/context.ts`
- tRPC instance + adminProcedure: `apps/user-application/worker/trpc/trpc-instance.ts`
- Router root: `apps/user-application/worker/trpc/router.ts`
