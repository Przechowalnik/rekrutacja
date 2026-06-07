export function usePWA() {
  // Service worker registration intentionally disabled. vite-plugin-pwa is
  // configured with selfDestroying:true — the injected SW only unregisters
  // itself and clears caches. Registering again here would re-introduce the
  // auto-reload loop users hit when returning to the site or on first visit.
}
