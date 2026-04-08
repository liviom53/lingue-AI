import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();
const SERVER_START = Date.now();

// Versione generata automaticamente dalla data/ora del deploy — nessuna modifica manuale necessaria
const _d = new Date(SERVER_START);
export const APP_VERSION =
  `${_d.getFullYear()}.` +
  `${String(_d.getMonth() + 1).padStart(2, '0')}.` +
  `${String(_d.getDate()).padStart(2, '0')}` +
  `.${String(_d.getHours()).padStart(2, '0')}${String(_d.getMinutes()).padStart(2, '0')}`;

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
