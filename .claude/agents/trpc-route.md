# Agent: Add tRPC Procedure End-to-End

## Purpose
Add a new tRPC procedure from query/mutation through to frontend usage.

## Steps

### 1. Add Query Helper (if needed)
Add a function to the relevant file in `packages/data-ops/src/queries/`.
Use `getDb()` from `../db/database` and tables from `../db/ems-schema`.

### 2. Add tRPC Procedure
In the relevant router file under `apps/user-application/worker/trpc/routers/`:
- Use `t.procedure` for authenticated user procedures
- Use `adminProcedure` (imported from `../trpc-instance`) for admin-only procedures
- Validate input with Zod
- Call the query helper

### 3. Register (if new router file)
Import and add to `apps/user-application/worker/trpc/router.ts`.

### 4. Use on Frontend
In a route component:
```tsx
// In loader:
await context.queryClient.prefetchQuery(
  context.trpc.routerName.procedureName.queryOptions(input),
);

// In component:
import { trpc } from "@/router";
import { useSuspenseQuery, useMutation } from "@tanstack/react-query";

const { data } = useSuspenseQuery(trpc.routerName.procedureName.queryOptions(input));
const mutation = useMutation(trpc.routerName.procedureName.mutationOptions({ onSuccess: ... }));
```

## Key Rules
- `corrected_points` must always be computed server-side: `raw_points × SUIT_MULTIPLIERS[suit_size]`
- Admin procedures must use `adminProcedure`, not `t.procedure`
- Dates in YYYY-MM-DD string format
