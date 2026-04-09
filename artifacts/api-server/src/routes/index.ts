import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiRouter from "./ai";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/ai", aiRouter);
router.use("/stats", statsRouter);

export default router;
