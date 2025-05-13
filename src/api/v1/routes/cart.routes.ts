import { Router } from 'express';
import { authenticate } from '../middleware/authenticationMiddleware';
import { validate } from '../middleware/validationMiddleware';
import {
  addItemToCart,
  getUserCart,
  updateCartItem,
  removeCartItem
} from '../controllers/cartController';

const router = Router();

router.use(authenticate);

router.post('/items', validate([
    body('productId').isMongoId(),
    body('quantity').isInt({ min: 1 })
]), addItemToCart);

router.get('/', getUserCart);

router.put('/items/:cartItemId', validate([
    param('cartItemId').isMongoId(),
    body('quantity').isInt({ min: 1 })
]), updateCartItem);

router.delete('/items/:cartItemId', validate([
    param('cartItemId').isMongoId()
]), removeCartItem);

export default router;