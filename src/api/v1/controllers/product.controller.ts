import { Request, Response } from "express";
import { BadRequest, ResourceNotFound } from "../../../errors/httpErrors";
import Product from "../../../db/models/product.model"; // Changed from ProductBooking
import {
  createProductValidator,
  updateProductValidator,
} from "../validators/product.validator";
import {
  getLimit,
  getPage,
  getStartDate,
  getEndDate,
} from "../../../utils/dataFilters";
// import { uploadToCloudinary } from "../../../services/file.service"; // For image handling

type QueryParams = {
  startDate?: Date;
  endDate?: Date;
  limit?: string;
  page?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  sortBy?: string; // Added sorting capability
  sortOrder?: string; // 'asc' or 'desc'
};

class ProductController {
  // async createProduct(req: Request, res: Response) {
  //   // Validate product data
  //   const { error, data } = createProductValidator(req.body);
  //   if (error) {
  //     throw new BadRequest(error.message, error.code);
  //   }

  //   // Handle image uploads
  //   if (req.files?.length) {
  //     const uploadResults = await Promise.all(
  //       (req.files as Express.Multer.File[]).map(file => 
  //         uploadToCloudinary(file.path)
  //     ))
  //     data.images = uploadResults.map(result => result.secure_url);
  //   }

  //   // Generate SKU if not provided
  //   if (!data.sku) {
  //     data.sku = this.generateSKU(data.name);
  //   }

  //   const newProduct = await Product.create(data);

  //   res.created({
  //     product: newProduct,
  //     message: "Product successfully created.",
  //   });
  // }

  // async updateProduct(req: Request, res: Response) {
  //   const { productId } = req.params;

  //   const { error, data } = updateProductValidator(req.body);
  //   if (error) {
  //     throw new BadRequest(error.message, error.code);
  //   }

  //   // Handle image updates
  //   if (req.files?.length) {
  //     const uploadResults = await Promise.all(
  //       (req.files as Express.Multer.File[]).map(file => 
  //         uploadToCloudinary(file.path)
  //       )
  //     );
  //     data.images = [...(data.images || []), ...uploadResults.map(result => result.secure_url)];
  //   }

  //   const updatedProduct = await Product.findByIdAndUpdate(
  //     productId,
  //     { $set: data },
  //     { new: true }
  //   );

  //   if (!updatedProduct) {
  //     throw new ResourceNotFound(
  //       `Product with ID ${productId} not found.`,
  //       "RESOURCE_NOT_FOUND"
  //     );
  //   }

  //   res.ok({
  //     product: updatedProduct,
  //     message: "Product updated successfully.",
  //   });
  // }

  async getProducts(req: Request, res: Response) {
    const queryParams: QueryParams = req.query;
    const startDate = getStartDate(queryParams.startDate);
    const endDate = getEndDate(queryParams.endDate);
    const limit = getLimit(queryParams.limit);
    const page = getPage(queryParams.page);
    
    // Build filter query
    const filter: any = {
      createdAt: { $gte: startDate, $lte: endDate },
      isActive: true
    };

    // Add filters
    if (queryParams.category) {
      filter.categories = queryParams.category;
    }

    if (queryParams.minPrice || queryParams.maxPrice) {
      filter.price = {};
      if (queryParams.minPrice) filter.price.$gte = Number(queryParams.minPrice);
      if (queryParams.maxPrice) filter.price.$lte = Number(queryParams.maxPrice);
    }

    if (queryParams.search) {
      filter.$or = [
        { name: { $regex: queryParams.search, $options: 'i' } },
        { description: { $regex: queryParams.search, $options: 'i' } },
        { sku: { $regex: queryParams.search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort: any = {};
    if (queryParams.sortBy) {
      sort[queryParams.sortBy] = queryParams.sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1; // Default sort
    }

    const query = Product.find(filter)
      .sort(sort)
      .limit(limit)
      .skip(limit * (page - 1));

    const totalProducts = Product.countDocuments(filter);

    const [products, totalCount] = await Promise.all([
      query.exec(),
      totalProducts.exec(),
    ]);

    res.ok(
      { total: totalCount, products },
      { 
        page, 
        limit, 
        startDate, 
        endDate,
        ...queryParams // Include all query params in response metadata
      }
    );
  }

  async getProductById(req: Request, res: Response) {
    const { productId } = req.params;
    if (!productId) {
      throw new BadRequest("Product ID is missing.", "MISSING_REQUIRED_FIELD");
    }

    const product = await Product.findById(productId)
      .populate('reviews.user', 'name email avatar')
      .populate('similarProducts', 'name price images rating');

    if (!product) {
      throw new ResourceNotFound(
        `Product with ID ${productId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.ok(product);
  }

  async deleteProduct(req: Request, res: Response) {
    const { productId } = req.params;
    if (!productId) {
      throw new BadRequest("Product ID is missing.", "MISSING_REQUIRED_FIELD");
    }

    // Soft delete
    const deletedProduct = await Product.findByIdAndUpdate(
      productId,
      { isActive: false },
      { new: true }
    );
    
    if (!deletedProduct) {
      throw new ResourceNotFound(
        `Product with ID ${productId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.ok({
      message: "Product deactivated successfully.",
      product: deletedProduct
    });
  }

  // Helper method to generate SKU
  private generateSKU(productName: string): string {
    const prefix = productName
      .substring(0, 3)
      .toUpperCase()
      .replace(/\s+/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${randomNum}`;
  }

  // Additional e-commerce methods
  async getFeaturedProducts(req: Request, res: Response) {
    const limit = getLimit(req.query.limit?.toString()) || 10;
    
    const featuredProducts = await Product.find({ 
      isFeatured: true,
      isActive: true 
    })
      .limit(limit)
      .sort({ createdAt: -1 });

    res.ok(featuredProducts);
  }

  async getProductCategories(req: Request, res: Response) {
    const categories = await Product.distinct('categories');
    res.ok(categories);
  }

  async getRelatedProducts(req: Request, res: Response) {
    const { productId } = req.params;
    const limit = getLimit(req.query.limit?.toString()) || 4;

    const product = await Product.findById(productId);
    if (!product) {
      throw new ResourceNotFound("Product not found", "RESOURCE_NOT_FOUND");
    }

    const relatedProducts = await Product.find({
      categories: { $in: product.categories },
      _id: { $ne: product._id },
      isActive: true
    })
      .limit(limit)
      .select('name price images rating');

    res.ok(relatedProducts);
  }
}

export default new ProductController();