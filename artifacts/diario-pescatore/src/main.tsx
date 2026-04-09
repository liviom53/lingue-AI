import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

if (import.meta.env.DEV && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((r) => r.unregister());
  });
  caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
}

createRoot(document.getElementById("root")!).render(<App />);
