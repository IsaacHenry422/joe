import express from "express";
import orderController from "../controllers/order.controller";
import { auth } from "../../middlewares/authMiddleware";

const orderRouter = express.Router();

// Create a new order
orderRouter.post(
  "/create/paynowpaystack",
  auth({ accountType: ["user"] }),
  orderController.payNowOrderwithPaystack
);

orderRouter.post(
  "/create/paylater",
  auth({ accountType: ["user"] }),
  orderController.payLaterOrder
);

orderRouter.get(
  "/generate/:orderId",
  auth({ accountType: ["user"] }),
  orderController.generatePaymentLinkForOrderwithPaystack
);

orderRouter.get(
  "/admin",
  auth({ accountType: ["admin"] }),
  orderController.GetAllOrdersAdmin
);

export default orderRouter;
