//  import { Request, Response } from 'express';
// // Update the import path below to the correct location of your Category model
// // Update the path below to the correct location and filename of your Category model
// import { Category } from '../models/Category'; // Adjusted to match the likely filename 'category.ts'
// import { Product } from '../models/Product'; // Adjusted import path to match correct casing/filename
// //import { Types } from 'mongoose';

// // Interface should be declared in your Category model file
// // Not needed here if already in models/Category.ts

// export const getCategories = async (req: Request, res: Response) => {
//   try {
//     const categories = await Category.aggregate([
//       { $match: { isMainCategory: true } },
//       {
//         $lookup: {
//           from: "categories",
//           localField: "_id",
//           foreignField: "parent",
//           as: "subcategories"
//         }
//       },
//       // Optional: Add sorting
//       { $sort: { name: 1 } }
//     ]);

//     // Cache control header for better performance
//     res.set('Cache-Control', 'public, max-age=3600'); // 1 hour cache
//     res.json(categories);
//   } catch (error: unknown) { // Better than any
//     const err = error instanceof Error ? error.message : 'Unknown error';
//     res.status(500).json({ error: err });
//   }
// };

// export const getProductsByCategory = async (req: Request, res: Response) => {
//   try {
//     const category = await Category.findOne({ slug: req.params.slug });
    
//     if (!category) {
//       return res.status(404).json({ error: "Category not found" });
//     }
    
//     // Add pagination and filtering options
//     const { page = 1, limit = 10 } = req.query;
//     const skip = (Number(page) - 1) * Number(limit);
    
//     const [products, total] = await Promise.all([
//       Product.find({ category: category._id })
//         .skip(skip)
//         .limit(Number(limit))
//         .lean(),
//       Product.countDocuments({ category: category._id })
//     ]);
    
//     res.json({ 
//       category,
//       products,
//       pagination: {
//         total,
//         page: Number(page),
//         pages: Math.ceil(total / Number(limit)),
//         limit: Number(limit)
//       }
//     });
//   } catch (error: unknown) {
//     const err = error instanceof Error ? error.message : 'Unknown error';
//     res.status(500).json({ error: err });
//   }
// // };






// import { Request, Response, NextFunction } from 'express';
// import { Category } from '../../../db/models/category'; // Adjust path as needed
// // import { Product } from '../../../db/models/product'; // Add this import for Product model
// import Product from '../../../db/models/product'; // Use default export if Product is the default export
// // If it's a named export like IProduct, use: import { IProduct as Product } from '../../../db/models/product';
// import { ResourceNotFound, ServerError } from '../../../errors/httpErrors'; // Adjust path as needed

// export const getCategories = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const categories = await Category.aggregate([
//       { $match: { isMainCategory: true } },
//       {
//         $lookup: {
//           from: 'categories',
//           localField: '_id',
//           foreignField: 'parent',
//           as: 'subcategories',
//         },
//       },
//       { $sort: { name: 1 } },
//     ]);

//     res.set('Cache-Control', 'public, max-age=3600');
//     res.status(200).json(categories);
//   } catch (error: unknown) {
//     console.error('Error fetching main categories:', error);
//     next(new ServerError('Error fetching main categories', 'DATABASE_ERROR'));
//   }
// };

// export const getProductsByCategory = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const category = await Category.findOne({ slug: req.params.slug });

//     if (!category) {
//       return next(new ResourceNotFound('Category not found', 'RESOURCE_NOT_FOUND'));
//     }

//     const { page = '1', limit = '10' } = req.query;
//     const pageNumber = parseInt(String(page), 10);
//     const limitNumber = parseInt(String(limit), 10);
//     const skip = (pageNumber - 1) * limitNumber;

//     const [products, total] = await Promise.all([
//       Product.find({ category: category._id })
//         .skip(skip)
//         .limit(limitNumber)
//         .lean(),
//       Product.countDocuments({ category: category._id }),
//     ]);

//     res.status(200).json({
//       category,
//       products,
//       pagination: {
//         total,
//         page: pageNumber,
//         pages: Math.ceil(total / limitNumber),
//         limit: limitNumber,
//       },
//     });
//   } catch (error: unknown) {
//     console.error('Error fetching products by category:', error);
//     next(new ServerError('Error fetching products by category', 'DATABASE_ERROR'));
//   }
// };







import { Request, Response, NextFunction } from 'express';
import { Category } from '../../../db/models/category';
import Product from '../../../db/models/product';
import { ResourceNotFound, ServerError } from '../../../errors/httpErrors';

// Utility to create a slug from a name
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\s&]+/g, '-')
    .replace(/[^\w-]+/g, '');
}

// Add a new category
export const addCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, parent, isMainCategory } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const slug = slugify(name);

    const existing = await Category.findOne({ slug });
    if (existing) return res.status(409).json({ message: 'Category already exists' });

    const category = await Category.create({
      name,
      parent: parent || null,
      isMainCategory: !!isMainCategory,
      slug,
    });

    res.status(201).json({ message: 'Category created', category });
  } catch (error: unknown) {
    console.error('Error creating category:', error);
    next(new ServerError('Error creating category', 'DATABASE_ERROR'));
  }
};

// Get all main categories and their subcategories
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await Category.aggregate([
      { $match: { isMainCategory: true } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: 'parent',
          as: 'subcategories',
        },
      },
      { $sort: { name: 1 } },
    ]);

    res.set('Cache-Control', 'public, max-age=3600');
    res.status(200).json(categories);
  } catch (error: unknown) {
    console.error('Error fetching main categories:', error);
    next(new ServerError('Error fetching main categories', 'DATABASE_ERROR'));
  }
};

// Get products under a specific category
export const getProductsByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });

    if (!category) {
      return next(new ResourceNotFound('Category not found', 'RESOURCE_NOT_FOUND'));
    }

    const { page = '1', limit = '10' } = req.query;
    const pageNumber = parseInt(String(page), 10);
    const limitNumber = parseInt(String(limit), 10);
    const skip = (pageNumber - 1) * limitNumber;

    const [products, total] = await Promise.all([
      Product.find({ category: category._id })
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Product.countDocuments({ category: category._id }),
    ]);

    res.status(200).json({
      category,
      products,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / limitNumber),
        limit: limitNumber,
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching products by category:', error);
    next(new ServerError('Error fetching products by category', 'DATABASE_ERROR'));
  }
};
