import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import fs from "fs";
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

// Detect workspace root — it differs between dev (cwd=artifacts/api-server)
// and production (cwd=workspace root).
function findWorkspaceRoot(): string {
  for (const candidate of [
    process.cwd(),
    path.resolve(process.cwd(), "..", ".."),
  ]) {
    if (fs.existsSync(path.join(candidate, "artifacts/lingua-ai"))) {
      return candidate;
    }
  }
  return process.cwd();
}

const workspaceRoot = findWorkspaceRoot();
const linguaAiDist = path.resolve(workspaceRoot, "artifacts/lingua-ai/dist/public");
const diarioDist = path.resolve(workspaceRoot, "artifacts/diario-pescatore/dist/public");

logger.info(
  { workspaceRoot, linguaAiDist, diarioDist,
    linguaAiExists: fs.existsSync(linguaAiDist),
    diarioExists: fs.existsSync(diarioDist) },
  "Static file paths",
);

// Serve lingua-ai under /lingua-ai
app.use("/lingua-ai", express.static(linguaAiDist));
app.use("/lingua-ai", (_req, res) =>
  res.sendFile(path.join(linguaAiDist, "index.html")),
);

// Serve diario-pescatore at root (after lingua-ai so /lingua-ai takes priority)
app.use(express.static(diarioDist));
app.use((_req, res) =>
  res.sendFile(path.join(diarioDist, "index.html")),
);

export default app;
