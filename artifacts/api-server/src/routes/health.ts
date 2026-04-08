import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();
const SERVER_START = Date.now(); // cambia ad ogni deploy/riavvio

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

// Usato dal frontend per rilevare nuove versioni
router.get("/version", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({ v: SERVER_START });
});

export default router;
