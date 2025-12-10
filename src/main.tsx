import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/layout/ErrorBoundary";
import { registerServiceWorker } from "./lib/pwa-utils";
import "./index.css";

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

// Performance monitoring happens after React is initialized
const initPerformanceMonitoring = async () => {
  try {
    const { performanceMonitor } = await import('./lib/performance-monitor');
    performanceMonitor.mark('app-init-complete');
  } catch (e) {
    console.warn('Performance monitoring not available:', e);
  }
};

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Initialize performance monitoring after render
initPerformanceMonitoring();
