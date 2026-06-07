/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useState } from "react";

interface I_BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

export function useInstallPWA() {
  const [installPromptEvent, setInstallPromptEvent] =
    useState<I_BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // @ts-ignore
    if (globalThis?.deferredPrompt) {
      setInstallPromptEvent(
        // @ts-ignore
        globalThis.deferredPrompt as I_BeforeInstallPromptEvent,
      );
      setCanInstall(true);
    }
  }, []);

  const promptInstall = async () => {
    if (!installPromptEvent) {
      return;
    }
    installPromptEvent.prompt();
    const result = await installPromptEvent.userChoice;
    setInstallPromptEvent(null);
    setCanInstall(false);
    return result;
  };

  return { canInstall, promptInstall };
}
