// src/api/v1/routes/landing.route.ts
import express from 'express';
import { getProductsByCategory } from '../controllers/landing.controller';
import { param } from 'express-validator';
import { validate } from '../../middlewares/validationMiddleware';

const router = express.Router();

router.get(
  '/categories/:categoryName',
  validate([
    param('categoryName').notEmpty().withMessage('Category name is required'),
  ]),
  getProductsByCategory
);

export default router;
