import { useGoogleReCaptcha } from "@google-recaptcha/react";

const isE2E = import.meta.env.VITE_IS_E2E === "true";

export const useRecaptcha = () => {
  const googleRecaptcha = useGoogleReCaptcha();

  if (isE2E) {
    return {
      executeV3: async () => "e2e-mock-token",
    };
  }

  return googleRecaptcha;
};
