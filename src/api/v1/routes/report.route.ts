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
  "/billboards",
  // auth({ accountType: ["admin"] }),
  reportController.billboardReport
);

orderRouter.get(
  "/prints",
  // auth({ accountType: ["admin"] }),
  reportController.printReport
);

orderRouter.get(
  "/transactions",
  auth({ accountType: ["admin"] }),
  reportController.transactionReport
);

orderRouter.get(
  "/user/statistics",
  auth({ accountType: ["user"] }),
  reportController.getUserStatistics
);

export default orderRouter;
