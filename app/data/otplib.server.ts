import { authenticator } from "otplib";

authenticator.options = {
  step: 30,
  window: [1, 0],
};

// eslint-disable-next-line unicorn/prefer-export-from
export { authenticator as authenticatorOtpConfig };
