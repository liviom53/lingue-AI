import express, { type Express } from "express";
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
}

export default app;
