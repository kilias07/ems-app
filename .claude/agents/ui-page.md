# Agent: Scaffold TanStack Router Page with Loader + Query

## Purpose
Create a new frontend page with a loader and TanStack Query data fetching.

## File Location
Pages live in `apps/user-application/src/routes/`:
- Member pages: `app/_authed/<page-name>.tsx`
- Admin pages: `app/_authed/admin/<page-name>.tsx`
- Public pages: `<page-name>.tsx`

## Template

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/router";
import { useSuspenseQuery } from "@tanstack/react-query";
// Import shadcn/ui components from @/components/ui/

export const Route = createFileRoute("/app/_authed/<page-name>")({
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.<router>.<procedure>.queryOptions(<input>),
    );
  },
  component: PageComponent,
});

function PageComponent() {
  const { data } = useSuspenseQuery(
    trpc.<router>.<procedure>.queryOptions(<input>),
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Page Title</h1>
      {/* content */}
    </div>
  );
}
```

## After Creating a Route
The `routeTree.gen.ts` is auto-regenerated when you run `pnpm dev` in `apps/user-application`.
If you need it updated immediately, manually add the route to `src/routeTree.gen.ts` following the existing pattern.

## Available UI Components
- `@/components/ui/card` — Card, CardHeader, CardTitle, CardContent
- `@/components/ui/table` — Table, TableHead, TableRow, TableCell etc.
- `@/components/ui/button` — Button
- `@/components/ui/input` — Input
- `@/components/ui/badge` — Badge
- `@/components/ui/select` — Select, SelectTrigger, SelectContent, SelectItem
- `@/components/ui/tabs` — Tabs, TabsList, TabsTrigger, TabsContent
- `@/components/ui/dialog` — Dialog, DialogContent, DialogHeader, DialogTitle
- `@/components/ui/avatar` — Avatar, AvatarImage, AvatarFallback
- `@tabler/icons-react` — Icon components
- `sonner` — toast() for notifications
