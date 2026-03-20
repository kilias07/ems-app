# EMS Studio App — Project Guide

## Overview
Member management and leaderboard app for an EMS (Electrical Muscle Stimulation) sport studio.
Members attend sessions logged by trainers; they compete on a leaderboard based on accumulated corrected points.

## Monorepo Structure
```
ems-app/
  apps/
    user-application/    # React 19 + TanStack Router frontend + Cloudflare Worker (tRPC + auth)
    data-service/        # Stub Cloudflare Worker (future mobile API)
  packages/
    data-ops/            # Shared Drizzle schema, Better Auth config, query helpers
```

## Tech Stack
- **Frontend**: React 19, TanStack Router (file-based), TanStack Query, shadcn/ui, Tailwind CSS v4
- **Backend**: Cloudflare Worker, tRPC v11, Better Auth v1.3.4 (Google OAuth)
- **Database**: Cloudflare D1 (SQLite), Drizzle ORM
- **Package manager**: pnpm workspaces
- **Bundler**: Vite + @cloudflare/vite-plugin

## Key Commands
```bash
# From apps/user-application:
pnpm dev                    # start frontend + worker dev server
pnpm build                  # build for production
pnpm cf-typegen             # regenerate worker-configuration.d.ts

# From packages/data-ops:
pnpm generate               # drizzle-kit generate (create migration SQL)

# Apply migration locally:
wrangler d1 migrations apply DB --local --config apps/user-application/wrangler.jsonc

# Promote first user to admin (run from repo root):
wrangler d1 execute DB --command "UPDATE member_profile SET role='admin' WHERE id='<your-user-id>'" --local --config apps/user-application/wrangler.jsonc
```

## Scoring System
- Each session has raw EMS points and a suit size
- `corrected_points = raw_points × SUIT_MULTIPLIERS[suit_size]`
- Suit multipliers (see `packages/data-ops/src/utils/suit-multipliers.ts`):
  - R0=1.2, R1=1.2, RW2=1.1, R2=1.0, R3=0.9, R4=0.8, R5=0.7
- **Always compute corrected_points before insert, never trust client-supplied values**
- Leaderboard = `SUM(corrected_points)` per member, optionally filtered by date

## Database Schema
File: `packages/data-ops/src/db/ems-schema.ts`
- `member_profile`: id (= Better Auth userId), nickname (unique), role, isActive, profileComplete, avatarUrl, joinedAt
- `training_session`: id (nanoid), memberId (FK), sessionDate (YYYY-MM-DD), suitSize, rawPoints, correctedPoints, createdBy, createdAt, notes

Auth tables are in `packages/data-ops/src/drizzle-out/auth-schema.ts` — managed by Better Auth, do not modify.

## Package Exports (data-ops)
```
@repo/data-ops/database          → getDb(), initDatabase()
@repo/data-ops/auth              → getAuth(), createBetterAuth()
@repo/data-ops/queries/members   → member CRUD
@repo/data-ops/queries/sessions  → session CRUD + stats
@repo/data-ops/queries/leaderboard → leaderboard aggregation
@repo/data-ops/utils/suit-multipliers → SUIT_MULTIPLIERS, SUIT_SIZES
```

## tRPC Router Structure
```
appRouter
  .profile.getMyProfile          → own profile (userId, role, nickname, profileComplete, avatarUrl)
  .profile.updateNickname        → set nickname + profileComplete=1
  .sessions.getMySessions        → paginated session history
  .sessions.getMyStats           → totals + weekly/monthly counts
  .sessions.getWeeklyHistory     → 8-week bar chart data
  .leaderboard.getLeaderboard    → ranked list (all/monthly/weekly)
  .leaderboard.getMyRank         → own rank
  .admin.*                       → adminProcedure (throws FORBIDDEN if role≠admin)
```

## Auth Flow
1. User signs in with Google → Better Auth creates `user` row + `member_profile` row (via databaseHooks)
2. `_authed` layout `beforeLoad` → fetches profile via tRPC → redirects to `/app/setup-profile` if `profileComplete=0`
3. User sets nickname on `/app/setup-profile` → `profileComplete=1` → redirected to dashboard
4. Admin: set `role='admin'` directly in D1 via Wrangler CLI

## Routes
```
/                               Landing page
/app/setup-profile              Nickname setup (no _authed layout)
/app/                           My Dashboard (inside _authed)
/app/my-sessions                My session history
/app/leaderboard                Leaderboard (all/monthly/weekly tabs)
/app/admin/                     Admin overview
/app/admin/log-session          Log a session
/app/admin/members              Member management
/app/admin/import               Bulk CSV import
```

## Key Conventions
- Dates stored as `text` in `YYYY-MM-DD` format, never timestamps for session data
- `id` in `training_session` uses `nanoid()` from the `nanoid` package
- `adminProcedure` in `trpc-instance.ts` — always use for admin routes
- `corrected_points` is always computed on the server before insert
- `profile_complete=0` means the user hasn't set a nickname yet
- Stub members created via `admin.createMember` have no Better Auth user — they can only be logged sessions, they cannot log in

## DO NOTs
- No Stripe — removed entirely
- No WebSockets / Durable Objects — data-service is a stub
- No self-reporting (members cannot log their own sessions)
- No client-supplied corrected_points values

## Data Migration (historical data)
1. Create stub `member_profile` rows for ~40 historical nicknames via admin UI or `admin.createMember`
2. Use `/app/admin/import` to paste spreadsheet CSV and map nicks to members
3. Confirm bulk insert
4. Verify leaderboard totals match the spreadsheet
