// import { Router } from 'express';
// import { body, param } from 'express-validator';
// // Update the import path if the file is named 'auth.middleware.ts' or located elsewhere
// import { authenticate } from '../middlewares/auth.middleware';
// import { validate } from '../middlewares/validation.middleware';
// import {
//   addItemToCart,
//   getUserCart,
//   updateCartItem,
//   removeCartItem
// } from '../controllers/cartController';
// import validateCart from '../../validators/cart.validator';
// const router = Router();

// router.use(authenticate);

// router.post('/items', validate([
//     body('productId').isMongoId(),
//     body('quantity').isInt({ min: 1 })
// ]), addItemToCart);

// router.get('/', getUserCart);

// router.put('/items/:cartItemId', validate([
//     param('cartItemId').isMongoId(),
//     body('quantity').isInt({ min: 1 })
// ]), updateCartItem);

// router.delete('/items/:cartItemId', validate([
//     param('cartItemId').isMongoId()
// ]), removeCartItem);

//  export default router;import { Router } from 'express';


// import { Router } from 'express';
// import { body, param } from 'express-validator';
// import { auth} from '../../middlewares/authMiddleware'; // Middleware is in src/api/middlewares
// import { validate } from '../../middlewares/validationMiddleware'; // Middleware is in src/api/middlewares
// import {
//   addToCart, // Use the correct exported name
//   getUserCart,
//   updateCartItem,
//   removeCartItem
// }from '../controllers/cart.controller'; // Controllers are in src/api/controllers
// import { validateCart } from '../validators/cart.validator'; // Validators are in src/api/v1/validators

// const router = Router();

// router.use(auth);

// router.post('/items', validate([
//   body('productId').isMongoId(),
//   body('quantity').isInt({ min: 1 })
// ]), addItemToCart);

// router.get('/', getUserCart);

// router.put('/items/:cartItemId', validate([
//   param('cartItemId').isMongoId(),
//   body('quantity').isInt({ min: 1 })
// ]), updateCartItem);

// router.delete('/items/:cartItemId', validate([
//   param('cartItemId').isMongoId()
// ]), removeCartItem);

// export default router;import { Router } from 'express'; import { Router } from 'express';
import { Router } from 'express';
import { body, param } from 'express-validator';
import { auth } from '../../middlewares/authMiddleware';
import { validate } from '../../middlewares/validationMiddleware';
import {
  addToCart,
  getCart,
  removeFromCart // Using the actual exported name
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
]), addToCart); // Reusing addToCart for simplicity, adjust if you have a dedicated update logic

router.delete('/items/:cartItemId', validateRemoveFromCart, validate([
  param('cartItemId').isMongoId()
]), removeFromCart);

export default router;