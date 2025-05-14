 import { Router } from 'express';
import { body, param } from 'express-validator';
import { auth } from '../../middlewares/authMiddleware';
import { validate } from '../../middlewares/validationMiddleware';
import {
  addToCart,
  getCart,
  removeFromCart
} from '../controllers/cart.controller';
import validateAddToCart from '../validators/cart.validator';
import validateRemoveFromCart from '../validators/cart.validator';
import validateUpdateCartItem from '../validators/cart.validator';

const router = Router();

router.use(auth);

router.post('/items', validateAddToCart, validate([
  body('productId').isMongoId(),
  body('quantity').isInt({ min: 1 })
]), addToCart);

router.get('/', getCart);

router.put('/items/:cartItemId', validateUpdateCartItem, validate([
  param('cartItemId').isMongoId(),
  body('quantity').isInt({ min: 1 })
]), addToCart); // Assuming addToCart handles updates

router.delete('/items/:cartItemId', validateRemoveFromCart, validate([
  param('cartItemId').isMongoId()
]), removeFromCart);

export default router;