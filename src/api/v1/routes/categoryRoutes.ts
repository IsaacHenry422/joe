 // Current code is 100% okay as-is
import express from 'express';
import { getCategories, getProductsByCategory } from '../controllers/categoryController';

const router = express.Router();

router.get('/', getCategories);
router.get('/:slug/products', getProductsByCategory);

export default router;