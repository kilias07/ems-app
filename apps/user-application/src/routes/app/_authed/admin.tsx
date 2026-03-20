import {
  Outlet,
  createFileRoute,
  redirect,
  isRedirect,
} from "@tanstack/react-router";

export const Route = createFileRoute("/app/_authed/admin")({
  beforeLoad: async ({ context }) => {
    try {
      const profile = await context.queryClient.fetchQuery(
        context.trpc.profile.getMyProfile.queryOptions(),
      );
      if (profile.role !== "admin") {
        throw redirect({ to: "/app" });
      }
    } catch (err) {
      if (isRedirect(err)) throw err;
      throw redirect({ to: "/app" });
    }
  },
  component: () => <Outlet />,
});
