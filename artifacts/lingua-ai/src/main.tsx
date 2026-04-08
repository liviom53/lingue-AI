import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// In sviluppo, rimuovi automaticamente i service worker installati
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.unregister());
  });
}

createRoot(document.getElementById("root")!).render(<App />);
