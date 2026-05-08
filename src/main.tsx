import React from "react"; // ScrollUniversity v2.1
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/layout/ErrorBoundary";
import { PerformanceOptimizer } from "./components/performance/PerformanceOptimizer";
import { registerServiceWorker } from "./lib/pwa-utils";
import { performanceMonitor } from "./lib/performance-monitor";
import "./index.css";

// Mark app initialization start
performanceMonitor.mark('app-init-start');

const PREVIEW_CACHE_RESET_KEY = '__lovable_preview_cache_reset__';

// Guard: never register service workers in iframes or preview hosts
const isInIframe = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();
const isPreviewHost =
  window.location.hostname.includes('id-preview--') ||
  window.location.hostname.includes('lovableproject.com') ||
  window.location.hostname.includes('lovable.app');

if (isPreviewHost || isInIframe) {
  // Aggressively clear preview caches so old broken bundles cannot keep the app blank
  void (async () => {
    const registrations = 'serviceWorker' in navigator
      ? await navigator.serviceWorker.getRegistrations()
      : [];

    await Promise.all(registrations.map((registration) => registration.unregister()));

    const cacheNames = 'caches' in window ? await caches.keys() : [];
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));

    const hadStalePreviewState = registrations.length > 0 || cacheNames.length > 0;
    const hasReloadedAfterCleanup = sessionStorage.getItem(PREVIEW_CACHE_RESET_KEY) === '1';

    if (hadStalePreviewState && !hasReloadedAfterCleanup) {
      sessionStorage.setItem(PREVIEW_CACHE_RESET_KEY, '1');
      window.location.reload();
      return;
    }

    sessionStorage.removeItem(PREVIEW_CACHE_RESET_KEY);
  })();
} else if (import.meta.env.PROD) {
  registerServiceWorker({
    onSuccess: () => console.log('Service Worker registered successfully'),
    onUpdate: () => console.log('New service worker available'),
  });
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <PerformanceOptimizer>
      <App />
    </PerformanceOptimizer>
  </ErrorBoundary>
);

// Mark app initialization complete
performanceMonitor.mark('app-init-complete');
performanceMonitor.measure('app-init-duration', 'app-init-start', 'app-init-complete');
