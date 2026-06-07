/* eslint-disable unicorn/no-process-exit */
/* eslint-disable unicorn/no-await-expression-member */

if (process.env.NODE_ENV === "production" || process.env.CI === "true") {
  process.exit(0);
}
const husky = (await import("husky")).default;
if (!husky) {
  console.log("husky NOT initialized!");
  process.exit(1);
}
console.log(husky(), "husky initialized!");
