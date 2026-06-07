export const isE2E =
  process.env.E2E === "true" ||
  process.env.CI === "true" ||
  process.env.VITE_IS_E2E === "true";
