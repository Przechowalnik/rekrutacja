module.exports = {
  "**/*.(md|json)": () => [`npm run prettier:fix --write`],
  "**/*.(ts|tsx)": () => "tsc --noEmit",
  "**/*.(ts|tsx|js)": () => [
    `npm run lint:fix --fix`,
    `npm run prettier:fix --write`,
    `npm run prettier`,
    "npm run check-cspell",
  ],
};
