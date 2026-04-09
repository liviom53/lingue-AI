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
app.use("/api", router);

if (process.env.NODE_ENV === "production") {
  const serverDir = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(serverDir, "../../..");
  const linguaDir = path.join(root, "artifacts/lingua-ai/dist/public");
  const diarioDir = path.join(root, "artifacts/diario-pescatore/dist/public");

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

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl.startsWith("/lingua-ai")) {
      return linguaProxy(req, res, next);
    }
    return diarioProxy(req, res, next);
  });
}

export default app;
