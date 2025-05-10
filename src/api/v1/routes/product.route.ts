import express from "express";
import productController from "../controllers/product.controller";
import { auth } from "../../middlewares/authMiddleware";
import upload from "../../middlewares/multerMiddleware"; // For image uploads

const productRouter = express.Router();

// Product CRUD Routes
productRouter.get(
  "/",
  productController.getProducts // Public access
);

productRouter.get(
  "/featured",
  productController.getFeaturedProducts // Public access
);

productRouter.get(
  "/categories",
  productController.getProductCategories // Public access
);

productRouter.get(
  "/:productId",
  productController.getProductById // Public access
);

productRouter.get(
  "/:productId/related",
  productController.getRelatedProducts // Public access
);

// Admin-only routes
// productRouter.post(
//   "/create",
//   auth({ accountType: ["admin"] }), // Only admin can create
//   upload.array('images', 5), // Allow up to 5 images
//   productController.createProduct
// );

// productRouter.patch(
//   "/update/:productId",
//   auth({ accountType: ["admin"] }), // Only admin can update
//   upload.array('images', 5), // Allow additional images
//   productController.updateProduct
// );

productRouter.delete(
  "/delete/:productId",
  auth({ accountType: ["admin"] }), // Only admin can delete
  productController.deleteProduct
);

// Inventory management routes
// productRouter.patch(
//   "/inventory/:productId",
//   auth({ accountType: ["admin"] }),
//   productController.updateInventory
// );

export default productRouter;