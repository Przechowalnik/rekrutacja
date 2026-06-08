import dayjs from "dayjs";
import JSCookies from "js-cookie";
import type { PropsWithChildren } from "react";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { cookiesKey } from "~/constants/cookies";

type T_StoredConsent = {
  analytics: boolean;
};

export type T_CookieConsent = {
  analyticsConsent: boolean;
  closeSettings: () => void;
  hasDecision: boolean;
  isReady: boolean;
  isSettingsOpen: boolean;
  openSettings: () => void;
  saveConsent: (consent: T_StoredConsent) => void;
};

const COOKIE_EXPIRES_DAYS = 365;

export const CookieConsentContext = createContext<T_CookieConsent>({
  analyticsConsent: false,
  closeSettings: () => {},
  hasDecision: false,
  isReady: false,
  isSettingsOpen: false,
  openSettings: () => {},
  saveConsent: () => {},
});

const readStoredConsent = (): null | T_StoredConsent => {
  const raw = JSCookies.get(cookiesKey.consent);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<T_StoredConsent>;
    return { analytics: Boolean(parsed?.analytics) };
  } catch {
    return null;
  }
};

export const CookieConsentProvider = ({ children }: PropsWithChildren) => {
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [hasDecision, setHasDecision] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const stored = readStoredConsent();
    if (stored) {
      setAnalyticsConsent(stored.analytics);
      setHasDecision(true);
    }
    setIsReady(true);
  }, []);

  const saveConsent = useCallback((consent: T_StoredConsent) => {
    const isLocalhost = globalThis.location?.hostname === "localhost";
    JSCookies.set(cookiesKey.consent, JSON.stringify(consent), {
      expires: dayjs().add(COOKIE_EXPIRES_DAYS, "day").toDate(),
      path: "/",
      sameSite: "Lax",
      secure: !isLocalhost,
    });
    setAnalyticsConsent(consent.analytics);
    setHasDecision(true);
    setIsSettingsOpen(false);
  }, []);

  const openSettings = useCallback(() => setIsSettingsOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  const contextValues = useMemo(
    () => ({
      analyticsConsent,
      closeSettings,
      hasDecision,
      isReady,
      isSettingsOpen,
      openSettings,
      saveConsent,
    }),
    [
      analyticsConsent,
      closeSettings,
      hasDecision,
      isReady,
      isSettingsOpen,
      openSettings,
      saveConsent,
    ],
  );

  return (
    <CookieConsentContext.Provider value={contextValues}>
      {children}
    </CookieConsentContext.Provider>
  );
};
