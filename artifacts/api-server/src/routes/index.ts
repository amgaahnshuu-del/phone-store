import { Router, type IRouter } from "express";
import healthRouter from "./health";
import phonesRouter from "./phones";
import categoriesRouter from "./categories";
import cartRouter from "./cart";
import authRouter from "./auth";
import ordersRouter from "./orders";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(phonesRouter);
router.use(categoriesRouter);
router.use(cartRouter);
router.use(authRouter);
router.use(ordersRouter);
router.use(adminRouter);

export default router;
