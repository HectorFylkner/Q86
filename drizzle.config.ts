import { defineConfig } from "drizzle-kit";

// Local default: the SQLite file under ./data. With TURSO_DATABASE_URL
// set, `pnpm db:push` targets the hosted database instead (used once
// when setting up a Vercel deployment — see DEPLOY.md).
const remoteUrl = process.env.TURSO_DATABASE_URL;

export default defineConfig(
  remoteUrl
    ? {
        dialect: "turso",
        schema: "./lib/db/schema.ts",
        out: "./drizzle",
        dbCredentials: {
          url: remoteUrl,
          authToken: process.env.TURSO_AUTH_TOKEN,
        },
      }
    : {
        dialect: "sqlite",
        schema: "./lib/db/schema.ts",
        out: "./drizzle",
        dbCredentials: {
          url: "file:./data/q86.db",
        },
      },
);
