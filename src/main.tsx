import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

// Service-Worker-Handling:
// - PROD: registrieren fuer App-like-Offline-Erlebnis
// - DEV:  aktiv deregistrieren + Caches leeren. Sonst kann ein SW aus einem
//         frueheren PROD-Build den aktuellen Dev-Stand ueberdecken (Cache-First).
if ("serviceWorker" in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("Service-Worker konnte nicht registriert werden:", err);
      });
    });
  } else {
    // Dev: alle vorhandenen SWs abmelden + ihren Cache wegraeumen.
    // Ein einmaliger Reload danach und der User sieht den aktuellen Stand.
    navigator.serviceWorker.getRegistrations().then((regs) => {
      if (regs.length > 0) {
        Promise.all(regs.map((r) => r.unregister())).then(() => {
          if ("caches" in window) {
            caches.keys().then((keys) => {
              Promise.all(keys.map((k) => caches.delete(k))).then(() => {
                console.info("[dev] Service-Worker + Caches entfernt — bitte einmal neu laden.");
              });
            });
          }
        });
      }
    });
  }
}
