import { initDatabase } from "@repo/data-ops/database";
import { App } from "./hono/app";
import { runWeeklySummary } from "./jobs/weekly-summary";

export default {
  fetch(request, env, ctx) {
    initDatabase(env.DB);
    return App.fetch(request, env, ctx);
  },

  async scheduled(_event, env, ctx) {
    initDatabase(env.DB);
    ctx.waitUntil(runWeeklySummary(env));
  },
} satisfies ExportedHandler<ServiceBindings>;
