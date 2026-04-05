import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
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

// In production the bundle is at artifacts/api-server/dist/index.mjs
// so going up 4 levels from the file reaches the workspace root.
// In dev (pnpm run dev from artifacts/api-server/) the bundle is at
// artifacts/api-server/dist/index.mjs relative to CWD, which is also
// /home/runner/workspace/artifacts/api-server/dist/index.mjs in absolute terms.
// import.meta.url is always the absolute URL of the compiled file, so
// 4 path.dirname calls always reach the workspace root regardless of CWD.
const thisFile = fileURLToPath(import.meta.url); // …/artifacts/api-server/dist/index.mjs
const distDir = path.dirname(thisFile);           // …/artifacts/api-server/dist
const apiServerDir = path.dirname(distDir);       // …/artifacts/api-server
const artifactsDir = path.dirname(apiServerDir);  // …/artifacts
const workspaceRoot = path.dirname(artifactsDir); // …/ (workspace root)

const linguaAiDir = path.join(workspaceRoot, "artifacts/lingua-ai/dist/public");
const diaroPescatoreDir = path.join(workspaceRoot, "artifacts/diario-pescatore/dist/public");

logger.info(
  {
    workspaceRoot,
    linguaAiExists: fs.existsSync(linguaAiDir),
    diaroPescatoreExists: fs.existsSync(diaroPescatoreDir),
  },
  "Static dirs startup check",
);

app.use("/lingua-ai", express.static(linguaAiDir, {
  setHeaders(res, filePath) {
    if (filePath.endsWith(".html")) {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    } else {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
  },
}));
app.get("/lingua-ai", (_req: Request, res: Response) => res.redirect("/lingua-ai/"));
app.use("/lingua-ai", (_req: Request, res: Response) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.sendFile(path.join(linguaAiDir, "index.html"));
});

app.use("/", express.static(diaroPescatoreDir, {
  setHeaders(res, filePath) {
    if (filePath.endsWith(".html")) {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    } else {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
  },
}));
app.use((_req: Request, res: Response) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.sendFile(path.join(diaroPescatoreDir, "index.html"));
});

export default app;
