 // src/api/v1/controllers/landing.controller.ts
import { Request, Response } from 'express';
// Update the path below if your product model is located elsewhere
import Product from '../../../db/models/product'; // Adjust the path based on your structure

export const getProductsByCategory = async (req: Request, res: Response) => {
  const { categoryName } = req.params;

  try {
    const products = await Product.find({ category: categoryName });

    if (!products.length) {
      return res.status(404).json({ message: 'No products found in this category.' });
    }

    return res.status(200).json({ category: categoryName, products });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error });
  }
};
