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

// Guard: never register service workers in iframes or preview hosts
const isInIframe = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();
const isPreviewHost =
  window.location.hostname.includes('id-preview--') ||
  window.location.hostname.includes('lovableproject.com') ||
  window.location.hostname.includes('lovable.app');

if (isPreviewHost || isInIframe) {
  // Unregister any existing service workers that may cause blank screens
  navigator.serviceWorker?.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister());
  });
} else if (import.meta.env.PROD) {
  registerServiceWorker({
    onSuccess: () => console.log('Service Worker registered successfully'),
    onUpdate: () => console.log('New service worker available'),
  });
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <PerformanceOptimizer>
        <App />
      </PerformanceOptimizer>
    </ErrorBoundary>
  </React.StrictMode>
);

// Mark app initialization complete
performanceMonitor.mark('app-init-complete');
performanceMonitor.measure('app-init-duration', 'app-init-start', 'app-init-complete');
