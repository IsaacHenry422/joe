// import { Request, Response, NextFunction } from 'express';
// // TODO: Update the import path below to the correct location of your authenticationMiddleware file
// import { auth } from '../../middlewares/authMiddleware';
// import { Cart } from '../../../db/models/Cart.model'; // Uncomment and adjust if you have a Cart model

// // Example: Get the current user's cart
// export const getCart = [
//   auth,
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       // const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
//       // if (!cart) return res.status(404).json({ error: 'Cart not found' });
//       // res.json(cart);
//       res.json({ message: 'Get cart - implement Cart model logic here.' });
//     } catch (error) {
//       next(error);
//     }
//   }
// ];

// // Example: Add an item to the cart
// export const addToCart = [
//   auth,
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       // const { productId, quantity } = req.body;
//       // let cart = await Cart.findOne({ user: req.user._id });
//       // if (!cart) { cart = new Cart({ user: req.user._id, items: [] }); }
//       // // Add or update item logic here
//       // await cart.save();
//       // res.status(201).json(cart);
//       res.json({ message: 'Add to cart - implement Cart model logic here.' });
//     } catch (error) {
//       next(error);
//     }
//   }
// ];

// // Example: Remove an item from the cart
// export const removeFromCart = [
//   auth,
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       // const { productId } = req.body;
//       // let cart = await Cart.findOne({ user: req.user._id });
//       // // Remove item logic here
//       // await cart.save();
//       // res.json(cart);
//       res.json({ message: 'Remove from cart - implement Cart model logic here.' });
//     } catch (error) {
//       next(error);
//     }
//   }
// ];

// // Example: Clear the cart
// export const clearCart = [
//   auth,
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       // let cart = await Cart.findOne({ user: req.user._id });
//       // cart.items = [];
//       // await cart.save();
//       // res.json(cart);
//       res.json({ message: 'Clear cart - implement Cart model logic here.' });
//     } catch (error) {
//       next(error);
//     }
//   }
// ];
import { Request, Response, NextFunction } from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { Cart, ICartItem } from '../../../db/models/cart.model'; // Import ICartItem as well

// Example: Get the current user's cart
export const getCart = [
  auth(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cart = await Cart.findOne({ user: (req as any).loggedInAccount._id }).populate('items.product');
      if (!cart) {
        return res.status(200).json({ items: [], status: 'active', updatedAt: new Date(), createdAt: new Date() }); // Return an empty active cart if not found
      }
      res.json(cart);
    } catch (error) {
      next(error);
    }
  }
];

// Example: Add an item to the cart
export const addToCart = [
  auth(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId, quantity = 1 } = req.body;
      const userId = (req as any).loggedInAccount._id;
      let cart = await Cart.findOne({ user: userId });

      if (!cart) {
        cart = new Cart({ user: userId, items: [{ product: productId, quantity }] });
      } else {
        const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (existingItemIndex > -1) {
          cart.items[existingItemIndex].quantity += quantity;
        } else {
          cart.items.push({ product: productId, quantity });
        }
      }
      await cart.save();
      res.status(201).json(cart);
    } catch (error) {
      next(error);
    }
  }
];

// Example: Remove an item from the cart
export const removeFromCart = [
  auth(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.body;
      const userId = (req as any).loggedInAccount._id;
      const cart = await Cart.findOne({ user: userId });

      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      cart.items = cart.items.filter(item => item.product.toString() !== productId);
      await cart.save();
      res.json(cart);
    } catch (error) {
      next(error);
    }
  }
];

// Example: Clear the cart
export const clearCart = [
  auth(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).loggedInAccount._id;
      const cart = await Cart.findOne({ user: userId });

      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      cart.items = [];
      await cart.save();
      res.json(cart);
    } catch (error) {
      next(error);
    }
  }
];