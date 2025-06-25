import express from "express";
import controller from "../controllers";
import sharedRouter from "../../shared/routes";

// Import all route files
import authRouter from "./auth.route";
import userRouter from "./user.route";
import adminRouter from "./admin.route";
//import orderRouter from "./order.route";
// import webhookRouter from "./webhook.route";
import blogRouter from "./blog.route";
import transactionRouter from "./transaction.route";
import notificationRouter from "./notification.route";
import contactRouter from "./contactus.route";
import locationRouter from "./location.route";

// E-commerce specific routes
import productRouter from "./product.route";
 import cartRouter from "./cart.routes";
// import wishlistRouter from "./wishlist.route";
// import reviewRouter from "./review.route";
 import categoryRouter from "./categoryRoutes";
// import couponRouter from "./coupon.route";
// import shippingRouter from "./shipping.route";

const router = express.Router();

// Welcome endpoint
router.get("/", controller.welcomeHandler);

// Core routes
router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/admins", adminRouter);
router.use("/shared", sharedRouter);

// E-commerce routes
router.use("/products", productRouter);
router.use("/cart", cartRouter);
// router.use("/wishlist", wishlistRouter);
// router.use("/reviews", reviewRouter);
router.use("/categories", categoryRouter);

// router.use("/coupons", couponRouter);
// router.use("/shipping", shippingRouter);

// Business operation routes
// router.use("/orders", orderRouter);
router.use("/transactions", transactionRouter);
router.use("/notifications", notificationRouter);
// router.use("/webhooks", webhookRouter);

// Miscellaneous routes
router.use("/blogs", blogRouter);
router.use("/contact-us", contactRouter);
router.use("/locations", locationRouter);

export default router;