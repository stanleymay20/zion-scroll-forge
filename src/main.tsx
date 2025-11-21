import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/layout/ErrorBoundary";
import { PerformanceOptimizer } from "./components/performance/PerformanceOptimizer";
import { registerServiceWorker } from "./lib/pwa-utils";
import { performanceMonitor } from "./lib/performance-monitor";
import "./index.css";

// Mark app initialization start
performanceMonitor.mark('app-init-start');

// Register service worker for PWA functionality
if (import.meta.env.PROD) {
  registerServiceWorker({
    onSuccess: () => {
      console.log('Service Worker registered successfully');
    },
    onUpdate: () => {
      console.log('New service worker available');
    }
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
