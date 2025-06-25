import { Router } from "express";
import { addCategory, getCategories, getProductsByCategory } from "../controllers/categoryController";

const router = Router();

router.post("/", addCategory); // POST /api/v1/categories
router.get('/', getCategories);
router.get('/:slug/products', getProductsByCategory);

export default router;