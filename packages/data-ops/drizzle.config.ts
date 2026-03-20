import type { Config } from "drizzle-kit";

const config: Config = {
  schema: "./src/db/ems-schema.ts",
  out: "./src/drizzle-out",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
  tablesFilter: ["member_profile", "training_session"],
};

export default config satisfies Config;
