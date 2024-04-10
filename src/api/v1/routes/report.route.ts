import express from "express";
import reportController from "../controllers/report.controller";
import { auth } from "../../middlewares/authMiddleware";

const orderRouter = express.Router();

orderRouter.get(
  "/orders",
  auth({ accountType: ["admin"] }),
  reportController.orderReport
);

orderRouter.get(
  "/transactions",
  auth({ accountType: ["admin"] }),
  reportController.transactionReport
);

orderRouter.get(
  "/orders/conversion",
  auth({ accountType: ["admin"] }),
  reportController.orderConversion
);

export default orderRouter;
