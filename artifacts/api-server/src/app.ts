import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

if (process.env.NODE_ENV === "production") {
  const serverDir = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(serverDir, "../../..");
  const linguaDir = path.join(root, "artifacts/lingua-ai/dist/public");
  const diarioDir = path.join(root, "artifacts/diario-pescatore/dist/public");

  app.use("/lingua-ai", express.static(linguaDir, { index: "index.html" }));
  app.get("/lingua-ai/*splat", (_req: Request, res: Response) =>
    res.sendFile(path.join(linguaDir, "index.html")),
  );
  app.use(express.static(diarioDir, { index: "index.html" }));
  app.get("*splat", (_req: Request, res: Response) =>
    res.sendFile(path.join(diarioDir, "index.html")),
  );
} else {
  function devProxy(targetPort: number) {
    return (req: Request, res: Response) => {
      const options: http.RequestOptions = {
        hostname: "127.0.0.1",
        port: targetPort,
        path: req.originalUrl,
        method: req.method,
        headers: { ...req.headers, host: `localhost:${targetPort}` },
      };
      const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers as Record<string, string>);
        proxyRes.pipe(res);
      });
      proxyReq.on("error", () => res.status(502).send("Dev server not ready"));
      req.pipe(proxyReq);
    };
  }

  app.use("/lingua-ai", devProxy(19529));
  app.use("/", devProxy(22883));
}

export default app;
