import express from "express";

import controller from "../controllers";
import sharedRouter from "../../shared/routes";
import authRouter from "./auth.route";
import userRouter from "./user.route";
import adminRouter from "./admin.route";
import mediaApplicationRouter from "./mediaApplication.route";
import printMediaApplicationRouter from "./printMediaApplication.route";
import orderRouter from "./order.route";
import webhookRouter from "./webhook.route";
import invoiceRouter from "./invoice.route";
import blogRouter from "./blog.route";
import transactionRouter from "./transaction.route";
import reportRouter from "./report.route";
import notificationRouter from "./notification.route";
import favouriteRouter from "./favourites.route";

const router = express.Router();

// Welcome endpoint
router.get("/", controller.welcomeHandler);
router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/admins", adminRouter);
router.use("/mediaApplications", mediaApplicationRouter);
router.use("/printMediaApplication", printMediaApplicationRouter);
router.use("/orders", orderRouter);
router.use("/invoice", invoiceRouter);
router.use("/blogs", blogRouter);
router.use("/webhooks", webhookRouter);
router.use("/transactions", transactionRouter);
router.use("/reports", reportRouter);
router.use("/notifications", notificationRouter);
router.use("/favourites", favouriteRouter);

router.use("/", sharedRouter);

export default router;
