import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { VitePWA } from "vite-plugin-pwa";

const port = Number(process.env.PORT ?? "19529");
const basePath = process.env.BASE_PATH ?? "/lingua-ai/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",          // Chiede conferma all'utente prima di aggiornare
      injectRegister: "auto",
      base: basePath,
      scope: basePath,
      workbox: {
        // Asset statici (JS, CSS, immagini): Stale-While-Revalidate
        // → serve dalla cache subito, aggiorna in background
        runtimeCaching: [
          {
            urlPattern: /\/lingua-ai\/(src|node_modules|@vite|@react-refresh|@fs)\/.*/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "lingua-ai-dev-assets",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            // API interne: Network-first → prova la rete, fallback su cache
            urlPattern: /\/api\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "lingua-ai-api",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
            },
          },
          {
            // Font Google: Cache-first (cambiano di rado)
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "lingua-ai-fonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
        // Pulisce automaticamente le vecchie cache quando il SW si aggiorna
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
      manifest: {
        name: "Lingue & AI",
        short_name: "Lingue & AI",
        description: "Impara una lingua con l'AI",
        start_url: basePath,
        scope: basePath,
        lang: "it",
        display: "standalone",
        orientation: "portrait",
        background_color: "#0f172a",
        theme_color: "#0f172a",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? [
          runtimeErrorOverlay(),
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
