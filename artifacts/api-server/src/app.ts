import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

if (process.env.NODE_ENV === "production") {
  // process.cwd() is always the workspace root when started via:
  // node --enable-source-maps artifacts/api-server/dist/index.mjs
  const workspaceRoot = process.cwd();
  const linguaAiDist = path.resolve(workspaceRoot, "artifacts/lingua-ai/dist/public");
  const diarioDist = path.resolve(workspaceRoot, "artifacts/diario-pescatore/dist/public");

  logger.info({ workspaceRoot, linguaAiDist, diarioDist }, "Static file paths");

  // Serve lingua-ai static assets under /lingua-ai
  app.use("/lingua-ai", express.static(linguaAiDist));
  // SPA fallback for lingua-ai — any route under /lingua-ai gets index.html
  app.use("/lingua-ai", (_req, res) =>
    res.sendFile(path.join(linguaAiDist, "index.html")),
  );

  // Serve diario-pescatore static assets at root
  app.use(express.static(diarioDist));
  // SPA fallback for diario — all remaining routes get index.html
  app.use((_req, res) =>
    res.sendFile(path.join(diarioDist, "index.html")),
  );
}

export default app;
