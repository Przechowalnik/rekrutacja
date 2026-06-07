module.exports = {
  extends: ["@commitlint/config-conventional"],
  plugins: ["commitlint-plugin-function-rules"],
  rules: {
    "function-rules/type-enum": [
      2,
      "always",
      parsed => {
        const headerRegex = /^(PRE-\d+ .+|fix: .+)$/;
        const isHeaderValid = parsed.header.match(headerRegex);
        if (isHeaderValid) {
          return [true];
        }
        return [false, `Commit header must match this regex: ${headerRegex}`];
      },
    ],
    "subject-empty": [0],
    "type-empty": [0],
    "type-enum": [0],
  },
};
