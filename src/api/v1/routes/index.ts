import express from "express";

import controller from "../controllers";
import sharedRouter from "../../shared/routes";
import authRouter from "./auth.route";
import userRouter from "./user.route";
import adminRouter from "./admin.route";
import mediaApplicationRouter from "./mediaApplication.route";
import orderRouter from "./order.route";
import webhookRouter from "./webhook.route";
import transactionRouter from "./transaction.route";
import reportRouter from "./report.route";

const router = express.Router();

// Welcome endpoint
router.get("/", controller.welcomeHandler);
router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/admins", adminRouter);
router.use("/mediaApplications", mediaApplicationRouter);
router.use("/orders", orderRouter);
router.use("/webhooks", webhookRouter);
router.use("/transactions", transactionRouter);
router.use("/reports", reportRouter);

router.use("/", sharedRouter);

export default router;
