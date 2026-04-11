import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";
import { aiRateLimit, validateInputSize, checkOrigin } from "./middleware/security";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/ai", checkOrigin, aiRateLimit, validateInputSize);

// Cleanup page — cancella SW e cache, poi redirect a /lingua-ai/
// Servito su /api/ path così bypassa il navigateFallback dei service worker
app.get("/api/reset", (_req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!DOCTYPE html>
<html lang="it">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Aggiornamento in corso…</title>
<style>body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#0f172a;color:#e2e8f0;font-family:system-ui,sans-serif;text-align:center;padding:20px}h1{font-size:1.4rem;margin:0 0 8px}p{color:#94a3b8;font-size:.95rem;margin:0 0 20px}.spinner{width:40px;height:40px;border:4px solid #334155;border-top-color:#10b981;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:20px}@keyframes spin{to{transform:rotate(360deg)}}</style>
</head>
<body>
<div class="spinner"></div>
<h1>Pulizia cache in corso…</h1>
<p>L'app si aprirà automaticamente tra pochi secondi.</p>
<script>
(async () => {
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map(r => r.unregister()));
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
  } catch(e) {}
  window.location.replace('/lingua-ai/');
})();
</script>
</body>
</html>`);
});

app.use("/api", router);

if (process.env.NODE_ENV === "production") {
  const serverDir = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(serverDir, "../../..");
  const linguaDir        = path.join(root, "artifacts/lingua-ai/dist/public");
  const diarioDir        = path.join(root, "artifacts/diario-pescatore/dist/public");
  const diarioVideoDir   = path.join(root, "artifacts/diario-pescatore-video/dist/public");
  const diarioLandingDir = path.join(root, "artifacts/diario-pescatore-landing/dist/public");
  const linguaVideoDir   = path.join(root, "artifacts/lingua-ai-demo-video/dist/public");
  const linguaLandingDir = path.join(root, "artifacts/lingua-ai-landing/dist/public");

  // Artifact sub-paths — must come BEFORE the catch-all diario route
  app.use("/lingua-ai-demo-video", express.static(linguaVideoDir));
  app.get("/lingua-ai-demo-video/*splat", (_req, res) =>
    res.sendFile(path.join(linguaVideoDir, "index.html")),
  );
  app.use("/lingua-ai-landing", express.static(linguaLandingDir));
  app.get("/lingua-ai-landing/*splat", (_req, res) =>
    res.sendFile(path.join(linguaLandingDir, "index.html")),
  );
  app.use("/diario-pescatore-video", express.static(diarioVideoDir));
  app.get("/diario-pescatore-video/*splat", (_req, res) =>
    res.sendFile(path.join(diarioVideoDir, "index.html")),
  );
  app.use("/diario-pescatore-landing", express.static(diarioLandingDir));
  app.get("/diario-pescatore-landing/*splat", (_req, res) =>
    res.sendFile(path.join(diarioLandingDir, "index.html")),
  );

  // Main apps
  app.use("/lingua-ai", express.static(linguaDir, { index: "index.html" }));
  app.get("/lingua-ai/*splat", (_req, res) =>
    res.sendFile(path.join(linguaDir, "index.html")),
  );
  app.use(express.static(diarioDir, { index: "index.html" }));
  app.get("*splat", (_req, res) =>
    res.sendFile(path.join(diarioDir, "index.html")),
  );
} else {
  const { createProxyMiddleware } = await import("http-proxy-middleware");

  const serverDir = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(serverDir, "../../..");
  const diarioDir = path.join(root, "artifacts/diario-pescatore/dist/public");
  const linguaDir = path.join(root, "artifacts/lingua-ai/dist/public");

  // Serve SW files from dist so the browser can update the service worker in dev mode.
  // Vite dev server does not serve sw.js, so we must serve it here to break stale SW caches.
  const noCache = (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    next();
  };
  app.get("/diario-pescatore/sw.js", noCache, (_req, res) =>
    res.sendFile(path.join(diarioDir, "sw.js")),
  );
  app.get(/^\/diario-pescatore\/workbox-.*\.js$/, noCache, (req, res) =>
    res.sendFile(path.join(diarioDir, path.basename(req.path))),
  );
  app.get("/lingua-ai/sw.js", noCache, (_req, res) =>
    res.sendFile(path.join(linguaDir, "sw.js")),
  );
  app.get(/^\/lingua-ai\/workbox-.*\.js$/, noCache, (req, res) =>
    res.sendFile(path.join(linguaDir, path.basename(req.path))),
  );

  // Use app.use without path prefix so Express does NOT strip the prefix.
  // The full original path is forwarded to the Vite dev server as-is.
  const linguaProxy = createProxyMiddleware({
    target: "http://127.0.0.1:19529",
    changeOrigin: true,
    ws: true,
  });

  const diarioProxy = createProxyMiddleware({
    target: "http://127.0.0.1:22883",
    changeOrigin: true,
    ws: true,
  });

  const diarioVideoProxy = createProxyMiddleware({
    target: "http://127.0.0.1:23199",
    changeOrigin: true,
    ws: true,
  });

  const diarioLandingProxy = createProxyMiddleware({
    target: "http://127.0.0.1:23550",
    changeOrigin: true,
    ws: true,
  });

  const linguaLandingProxy = createProxyMiddleware({
    target: "http://127.0.0.1:23645",
    changeOrigin: true,
    ws: true,
  });

  const linguaVideoProxy = createProxyMiddleware({
    target: "http://127.0.0.1:23031",
    changeOrigin: true,
    ws: true,
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    const url = req.originalUrl;
    if (url.startsWith("/lingua-ai-landing")) return linguaLandingProxy(req, res, next);
    if (url.startsWith("/lingua-ai-demo-video")) return linguaVideoProxy(req, res, next);
    if (url.startsWith("/lingua-ai")) return linguaProxy(req, res, next);
    if (url.startsWith("/diario-pescatore-landing")) return diarioLandingProxy(req, res, next);
    if (url.startsWith("/diario-pescatore-video")) return diarioVideoProxy(req, res, next);
    return diarioProxy(req, res, next);
  });
}

export default app;
