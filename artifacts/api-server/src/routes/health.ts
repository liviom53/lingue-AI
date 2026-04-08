import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();
const SERVER_START = Date.now();

// ── Versione app ─────────────────────────────────────────────────────────────
// Aggiorna questo valore ad ogni deploy (il frontend lo legge e lo mostra)
export const APP_VERSION = "1.3.0";

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

// Usato dal frontend per rilevare nuove versioni
router.get("/version", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({ v: SERVER_START, version: APP_VERSION });
});

export default router;
