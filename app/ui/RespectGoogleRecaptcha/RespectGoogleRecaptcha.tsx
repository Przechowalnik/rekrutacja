import { GoogleReCaptchaProvider } from "@google-recaptcha/react";
import type { PropsWithChildren } from "react";

const googleRecaptchaFrontend = import.meta.env.VITE_GOOGLE_RECAPTCHA_FRONTEND;
const isE2E = import.meta.env.VITE_IS_E2E === "true";

const handleRecaptchaError = async () => {
  globalThis.location.reload();
};

export const RespectGoogleRecaptcha = ({ children }: PropsWithChildren) => {
  if (isE2E) {
    return <>{children}</>;
  }

  if (!googleRecaptchaFrontend) {
    return null;
  }

  return (
    <GoogleReCaptchaProvider
      isEnterprise
      onError={handleRecaptchaError}
      siteKey={googleRecaptchaFrontend}
      type="v3"
    >
      {children}
    </GoogleReCaptchaProvider>
  );
};
