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
      registerType: "prompt",       // SW aspetta → needRefresh diventa true → banner compare
      injectRegister: "auto",
      devOptions: { enabled: false },  // SW disabilitato in dev → modifiche sempre visibili
      base: basePath,
      scope: basePath,
      workbox: {
        // ── Precache: asset statici generati dal build (JS, CSS, HTML, icone) ────
        // VitePWA li individua automaticamente dal dist; offline funziona subito.
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff,woff2}"],

        // ── Navigazione offline: serve sempre l'app shell ────────────────────────
        // Senza questo, un reload offline restituisce 404 invece dell'app.
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api\//, /^\/__/],

        // ── Runtime caching ──────────────────────────────────────────────────────
        runtimeCaching: [
          {
            // Font Google: Cache-First (cambiano di rado, 1 anno)
            // Inter viene scaricato una volta sola e usato offline per sempre.
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "lingua-ai-fonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // API interne: Network-First → prova la rete, fallback su cache
            // Traduzione, versione, AI: online → risposta fresca; offline → ultima risposta salvata.
            urlPattern: /\/api\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "lingua-ai-api",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Tatoeba API (quiz frasi d'esempio): Network-First, cache 24h
            urlPattern: /^https:\/\/tatoeba\.org\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "lingua-ai-tatoeba",
              networkTimeoutSeconds: 6,
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // OpenRouter / DeepSeek AI: Network-Only (risposte uniche, mai cacheabili)
            urlPattern: /^https:\/\/openrouter\.ai\/.*/i,
            handler: "NetworkOnly",
          },
          {
            // Immagini esterne generiche: Stale-While-Revalidate, 30 giorni
            urlPattern: /^https:\/\/.+\.(png|jpg|jpeg|webp|svg|gif)(\?.*)?$/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "lingua-ai-images",
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],

        // Pulisce automaticamente le vecchie cache quando il SW si aggiorna
        cleanupOutdatedCaches: true,
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
