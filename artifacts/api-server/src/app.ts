import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, "../../..");

const linguaAiDir = path.join(workspaceRoot, "artifacts/lingua-ai/dist/public");
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

const diaroPescatoreDir = path.join(workspaceRoot, "artifacts/diario-pescatore/dist/public");
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
