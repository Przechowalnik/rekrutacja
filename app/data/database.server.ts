import fs from "node:fs";

import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";

import { PrismaClient } from "../../generated/prisma/client";
import { isE2E } from "./isE2E.server";

const isDevelopmentOrTests = () => {
  if (isE2E) {
    return true;
  }
  const localEnvironment = (process.env.LOCAL_ENV ?? "").toLowerCase();
  return localEnvironment === "dev" || localEnvironment === "test";
};

function ensureSupabaseCaOrThrow() {
  if (isDevelopmentOrTests()) {
    return null;
  }

  const crt = process.env.SUPABASE_CA_CRT;
  if (!crt) {
    throw new Error("SUPABASE_CA_CRT is missing in Production (Vercel env).");
  }

  const certPath = "/tmp/supabase-ca.crt";

  const normalized = crt.includes(String.raw`\n`)
    ? crt.replaceAll(String.raw`\n`, "\n")
    : crt;
  fs.writeFileSync(certPath, normalized, "utf8");

  return certPath;
}

const certPath = ensureSupabaseCaOrThrow();

const baseUrl = process.env.DATABASE_URL;
if (!baseUrl && !isDevelopmentOrTests()) {
  throw new Error("DATABASE_URL is missing.");
}

// Build connection string with appropriate SSL settings
const connectionString = (() => {
  if (!baseUrl) {
    return "postgresql://localhost:5432/dummy";
  }

  const url = new URL(baseUrl);

  if (isE2E) {
    url.searchParams.set("sslmode", "no-verify");
    return url.toString();
  }

  if (!isDevelopmentOrTests()) {
    if (!certPath) {
      throw new Error("SUPABASE_CA_CRT is missing in Production.");
    }

    url.searchParams.set("sslmode", "verify-full");

    url.searchParams.set("sslrootcert", certPath);
  }

  return url.toString();
})();

const adapter = new PrismaPg({ connectionString });

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const database =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter }).$extends(withAccelerate());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = database;
}

function gracefulShutdown() {
  void database.$disconnect();
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

export { database };
