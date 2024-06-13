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
  "/admin/all",
  auth({ accountType: ["admin"] }),
  orderController.getAllOrdersAdmin
);
orderRouter.get(
  "/admin/one/:orderId",
  auth({ accountType: ["admin"] }),
  orderController.GetOrderByIdAdmin
);

orderRouter.get(
  "/admin/custom/:orderCustomId",
  auth({ accountType: ["admin"] }),
  orderController.GetOrderByCustomAdmin
);

orderRouter.get(
  "/user/unpaid",
  auth({ accountType: ["user"] }),
  orderController.getLatestUnpaidOrder
);

orderRouter.get(
  "/user/all",
  auth({ accountType: ["user"] }),
  orderController.getAllOrdersUser
);

orderRouter.get(
  "/user/one/:orderId",
  auth({ accountType: ["user"] }),
  orderController.getOrderByIdUser
);

//update
orderRouter.patch(
  "/:orderId/details",
  auth({ accountType: ["admin"] }),
  orderController.updateOrderdetailsById
);

orderRouter.patch(
  "/suborder",
  auth({ accountType: ["admin"] }),
  orderController.updateSubOrderById
);

//delete
orderRouter.delete(
  "/:orderId",
  auth({ accountType: ["admin"], adminType: ["Super-Admin"] }),
  orderController.deleteOrderById
);

export default orderRouter;
