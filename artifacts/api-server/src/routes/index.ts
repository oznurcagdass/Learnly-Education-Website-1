import { Router, type IRouter } from "express";
import healthRouter from "./health";
import learningRouter from "./learning";
import authRouter from "./auth";
import resourcesRouter from "./resources";

const router: IRouter = Router();

router.use(healthRouter);
router.use(learningRouter);
router.use(authRouter);
router.use(resourcesRouter);

export default router;
