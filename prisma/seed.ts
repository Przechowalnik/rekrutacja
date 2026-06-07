/* eslint-disable unicorn/no-process-exit */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";
import { seedBlogPosts } from "./seeds/blogPosts";
import { seedCities } from "./seeds/cities";

const adapter = new PrismaPg({
  connectionString: process?.env?.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await seedCities(prisma);
  await seedBlogPosts(prisma);
}

await main()
  .catch(error => {
    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
