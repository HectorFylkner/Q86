import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@libsql/client"],
  // The bootstrap reads these at runtime on serverless hosts: the SQL
  // migration files and the committed question bank.
  outputFileTracingIncludes: {
    "/**": ["./drizzle/**", "./scripts/seed-bank.json"],
  },
};

export default nextConfig;
