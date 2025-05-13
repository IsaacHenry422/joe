 import { Request, Response } from 'express';
// Update the import path below to the correct location of your Category model
// Update the path below to the correct location and filename of your Category model
import { Category } from '../models/Category'; // Adjusted to match the likely filename 'category.ts'
import { Product } from '../models/Product'; // Adjusted import path to match correct casing/filename
//import { Types } from 'mongoose';

// Interface should be declared in your Category model file
// Not needed here if already in models/Category.ts

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.aggregate([
      { $match: { isMainCategory: true } },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "parent",
          as: "subcategories"
        }
      },
      // Optional: Add sorting
      { $sort: { name: 1 } }
    ]);

    // Cache control header for better performance
    res.set('Cache-Control', 'public, max-age=3600'); // 1 hour cache
    res.json(categories);
  } catch (error: unknown) { // Better than any
    const err = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: err });
  }
};

export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    // Add pagination and filtering options
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const [products, total] = await Promise.all([
      Product.find({ category: category._id })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments({ category: category._id })
    ]);
    
    res.json({ 
      category,
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: err });
  }
};