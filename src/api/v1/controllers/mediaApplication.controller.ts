/* eslint-disable no-constant-condition */
import { Request, Response } from "express";
import slugify from "slugify";
import dotenv from "dotenv";
import { v4 as uuidv4 } from 'uuid';
dotenv.config();

import { BadRequest, ResourceNotFound } from "../../../errors/httpErrors";
import billboardMediaApplication from "../../../db/models/mediaApplication.model"; // IMediaApplication,
import Admin from "../../../db/models/admin.model"; // Admin,

import * as validators from "../validators/mediaApplication.validator";

import {
  getLimit,
  getPage,
  getStartDate,
  getEndDate,
} from "../../../utils/dataFilters";
import mongoose from "mongoose";
import { promises as fsPromises } from "fs";
import path from "path";
import {
  uploadPicture,
  deleteImage,
  deleteImagesFromStorage,
  reduceImageSize,
} from "../../../services/file.service";

type QueryParams = {
  startDate?: Date;
  endDate?: Date;
  limit?: string;
  page?: string;
  brtType?: string;
  mediaType?: string;
  status?: string;
  listingTitle?: String,
  route?: String,
  state?: String,
  cityLga?: String,
  landmark?: String,
  price?: String,
  dimension?: String,
  nextAvailable?: Date,
  amountAvailable?: String,
  minPrice?: string;
  maxPrice?: string;
};

const awsBaseUrl = process.env.AWS_BASEURL;

class applicationMediaController {
  // // Create a new media application
  async createMediaApplication(req: Request, res: Response) {
    const adminId = req.loggedInAccount._id;

    const { error, data } = validators.createMediaApplicationValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);
    const { mediaType } = data;
    if (mediaType === "BRT Buses") {
      if (!data.route || !data.brtType || !data.amountAvailable) {
        throw new BadRequest("please provide route, brt type and amount available", "INVALID_REQUEST_PARAMETERS");
      }
      if (data.googleStreetlink || data.landmark || data.listingTitle || data.address) {
        throw new BadRequest("Brt buses cannot have googleStreetlink, landmark, listing title or address", "INVALID_REQUEST_PARAMETERS");
      }
    } else {
      if (data.route || data.brtType || data.amountAvailable) {
        throw new BadRequest(`${mediaType} cannot have route, brt type or amount available`, "INVALID_REQUEST_PARAMETERS");
      }
      if (!data.googleStreetlink || !data.landmark || !data.listingTitle || !data.address) {
        throw new BadRequest(`${mediaType} require google street link, landmark, listing title, and address`, "INVALID_REQUEST_PARAMETERS");
      }
    }
    function generateShortUUID() {
      // Generate UUID v4
      const uuid = uuidv4();

      // Remove hyphens and extract the first 8 characters to create a shorter UUID
      const shortUUID = uuid.replace(/-/g, '').substring(0, 10);

      return shortUUID;
    }

    const mediaCustomId = generateShortUUID();
    const admin = await Admin.findById(adminId);
    const createdByAdmin = admin?.adminCustomId;
    // const businessSlug = business?.businessSlug;
    const product = new billboardMediaApplication({
      ...data,
      createdByAdmin,
      mediaCustomId,
    });
    await product.save();
    res.created(product);
  }

  // Get all media applications - General

  async getGeneralMediaApplications(req: Request, res: Response) {
    const queryParams: QueryParams = req.query;
    const startDate = getStartDate(queryParams.startDate);
    const endDate = getEndDate(queryParams.endDate);
    const limit = getLimit(queryParams.limit);
    const page = getPage(queryParams.page);

    // Construct the filter based on query parameters
    const filter: any = {};
    if (startDate && endDate) {
      filter.createdAt = { $gte: startDate, $lte: endDate };
    }
    // Dynamic filter based on multiple characteristics
    const orConditions = [];
    if (queryParams.mediaType) {
      orConditions.push({ mediaType: queryParams.mediaType });
    }
    if (queryParams.status) {
      orConditions.push({ status: queryParams.status });
    }
    if (queryParams.brtType) {
      orConditions.push({ brtType: queryParams.brtType });
    }
    if (queryParams.amountAvailable) {
      orConditions.push({ amountAvailable: queryParams.amountAvailable });
    }
    if (queryParams.cityLga) {
      orConditions.push({ cityLga: queryParams.cityLga });
    }
    if (queryParams.dimension) {
      orConditions.push({ dimension: queryParams.dimension });
    }
    if (queryParams.landmark) {
      orConditions.push({ landmark: queryParams.landmark });
    }
    if (queryParams.listingTitle) {
      orConditions.push({ listingTitle: queryParams.listingTitle });
    }
    if (queryParams.nextAvailable) {
      orConditions.push({ nextAvailable: queryParams.nextAvailable });
    }
    if (queryParams.price) {
      orConditions.push({ price: queryParams.price });
    } else if (queryParams.minPrice && queryParams.maxPrice) {
      orConditions.push({ price: { $gte: queryParams.minPrice, $lte: queryParams.maxPrice } });
    } else if (queryParams.minPrice) {
      orConditions.push({ price: { $gte: queryParams.minPrice } });
    } else if (queryParams.maxPrice) {
      orConditions.push({ price: { $lte: queryParams.maxPrice } });
    }
    if (queryParams.route) {
      orConditions.push({ route: queryParams.route });
    }
    if (queryParams.state) {
      orConditions.push({ state: queryParams.state });
    }
    if (orConditions.length > 0) {
      filter.$or = orConditions;
    }

    // Query the database with the constructed filter
    const products = await billboardMediaApplication
      .find(filter)
      .sort({ createdAt: 1 })
      .limit(limit)
      .skip(limit * (page - 1));

    // Send the response
    res.ok(
      {
        products,
      },
      { page, limit, startDate, endDate }
    );

  }

  async uploadMediaImages(req: Request, res: Response) {
    const { mediaCustomId } = req.params;
    let uploadedImages: Express.Multer.File[] = [];
    if (!req.files) {
      throw new BadRequest("No images provided.", "MISSING_REQUIRED_FIELD");
    }
    if (Array.isArray(req.files)) {
      // If req.files is an array, assign it directly
      uploadedImages = req.files as Express.Multer.File[];
    } else {
      // If req.files is an object with fieldnames, extract the files
      uploadedImages = Object.values(
        req.files as {
          [fieldname: string]: Express.Multer.File[];
        }
      ).reduce((acc, files) => acc.concat(files), []);
    }
    if (!uploadedImages || uploadedImages.length === 0) {
      throw new BadRequest("No images provided.", "MISSING_REQUIRED_FIELD");
    }
    const product = await billboardMediaApplication.findOne({ mediaCustomId })
    if (!product) throw new BadRequest(`Product with custom id ${mediaCustomId} does not exist`, "INVALID_REQUEST_PARAMETERS");

    await Promise.all(uploadedImages.map(async (uploadedFile) => {
      const id = uuidv4();
      const productPictureExtension = path.extname(uploadedFile.originalname);
      const resizedImagePath = await reduceImageSize(uploadedFile.path);
      const productPictureKey = await uploadPicture(
        resizedImagePath,
        "billboard-images",
        productPictureExtension
      );
      await fsPromises.unlink(resizedImagePath);
      const key = `${awsBaseUrl}/${productPictureKey}`;
      console.log(key);

      const picture = {
        key:key
      };
      product.pictures.push(picture);
      console.log(product.pictures);
      
    }));
    await product.save();


    res.ok({
      message: "Product images uploaded successfully.",
      imageUrls: product.pictures,
    });
  }

  // // Get all media - Admin
  // async getProducts(req: Request, res: Response) {
  //   const queryParams: QueryParams = req.query;
  //   const startDate = getStartDate(queryParams.startDate);
  //   const endDate = getEndDate(queryParams.endDate);
  //   const limit = getLimit(queryParams.limit);
  //   const page = getPage(queryParams.page);
  //   const products = await Product.find({
  //     createdAt: { $gte: startDate, $lte: endDate },
  //   })
  //     .sort({ createdAt: 1 })
  //     .limit(limit)
  //     .skip(limit * (page - 1));
  //   const totalProducts = await Product.countDocuments(products);
  //   res.ok({ products, totalProducts }, { page, limit, startDate, endDate });
  // }
  // // Get all products - Business
  // async getProductsByBusiness(req: Request, res: Response) {
  //   const businessId = req.loggedInAccount._id;
  //   const queryParams: QueryParams = req.query;
  //   const startDate = getStartDate(queryParams.startDate);
  //   const endDate = getEndDate(queryParams.endDate);
  //   const limit = getLimit(queryParams.limit);
  //   const page = getPage(queryParams.page);
  //   // Filter products by businessId
  //   const products = await Product.find({
  //     businessId: businessId, // Filter by the specific businessId
  //     createdAt: { $gte: startDate, $lte: endDate },
  //   })
  //     .sort({ createdAt: 1 })
  //     .limit(limit)
  //     .skip(limit * (page - 1));
  //   const totalProducts = await Product.countDocuments({
  //     businessId: businessId, // Count documents with the specific businessId
  //     createdAt: { $gte: startDate, $lte: endDate },
  //   });
  //   res.ok({ products, totalProducts }, { page, limit, startDate, endDate });
  // }
  // // Search products - General
  // async searchProductsByCategory(req: Request, res: Response) {
  //   const { businessSlug } = req.params;
  //   if (!businessSlug) {
  //     throw new ResourceNotFound(
  //       "Wrong store name... The store you are looking for doesn't exist.",
  //       "RESOURCE_NOT_FOUND"
  //     );
  //   }
  //   const business = await Business.findOne({ businessSlug });
  //   if (!business) {
  //     throw new ResourceNotFound(
  //       `No products have been provided in the '${businessSlug}' store yet.`,
  //       "RESOURCE_NOT_FOUND"
  //     );
  //   }
  //   // Get the businessId of the found business
  //   const businessId = business._id;
  //   // Get the query parameters and cast them to strings
  //   const productCategory: string | undefined = String(
  //     req.query.productCategory
  //   );
  //   // Define the base cache key based on the businessId
  //   const baseCacheKey = `product_search_${businessId}`;
  //   if (productCategory) {
  //     // Search by productCategory
  //     const productCategoryCacheKey = `${baseCacheKey}_productCategory_${productCategory}`;
  //     const cachedProductCategoryResults = await redisClient.get(
  //       productCategoryCacheKey
  //     );
  //     if (cachedProductCategoryResults) {
  //       // If results are cached, return them directly
  //       const parsedResults = JSON.parse(cachedProductCategoryResults);
  //       return res.ok({
  //         searchedProducts: parsedResults,
  //         totalSearchedProducts: parsedResults.length,
  //       });
  //     }
  //     // If results are not cached, perform the search query for productCategory
  //     const productCategorySearchCriteria = {
  //       businessId, // Filter by the specific businessId
  //       productCategory: { $regex: new RegExp(productCategory, "i") },
  //     };
  //     const searchedProducts = await Product.find(
  //       productCategorySearchCriteria
  //     );
  //     // Cache the search results for productCategory with an expiration time (e.g., 1 hour)
  //     await redisClient.set(
  //       productCategoryCacheKey,
  //       JSON.stringify(searchedProducts),
  //       {
  //         EX: PRODUCT_CACHE_EXPIRATION,
  //         NX: true,
  //       }
  //     );
  //     const totalSearchedProducts = searchedProducts.length;
  //     if (totalSearchedProducts === 0) {
  //       return res.ok({
  //         message: "No products found matching the search criteria.",
  //       });
  //     }
  //     return res.ok({ searchedProducts, totalSearchedProducts });
  //   } else {
  //     // If neither productName nor productCategory is provided, return an error message
  //     return res.error(
  //       400,
  //       "Please provide a search query (productName or productCategory).",
  //       "INVALID_REQUEST_PARAMETERS"
  //     );
  //   }
  // }
  // async searchProductsByProductName(req: Request, res: Response) {
  //   const { businessSlug } = req.params;
  //   if (!businessSlug) {
  //     throw new ResourceNotFound(
  //       "Wrong store name... The store you are looking for doesn't exist.",
  //       "RESOURCE_NOT_FOUND"
  //     );
  //   }
  //   const business = await Business.findOne({ businessSlug });
  //   if (!business) {
  //     throw new ResourceNotFound(
  //       `No products have been provided in the '${businessSlug}' store yet.`,
  //       "RESOURCE_NOT_FOUND"
  //     );
  //   }
  //   // Get the businessId of the found business
  //   const businessId = business._id;
  //   // Get the query parameters and cast them to strings
  //   const productName: string | undefined = String(req.query.productName);
  //   // Define the base cache key based on the businessId
  //   const baseCacheKey = `product_search_${businessId}`;
  //   if (productName) {
  //     // Search by productName
  //     const productNameCacheKey = `${baseCacheKey}_productName_${productName}`;
  //     const cachedProductNameResults =
  //       await redisClient.get(productNameCacheKey);
  //     if (cachedProductNameResults) {
  //       // If results are cached, return them directly
  //       const parsedResults = JSON.parse(cachedProductNameResults);
  //       return res.ok({
  //         searchedProducts: parsedResults,
  //         totalSearchedProducts: parsedResults.length,
  //       });
  //     }
  //     // If results are not cached, perform the search query for productName
  //     const productNameSearchCriteria = {
  //       businessId, // Filter by the specific businessId
  //       productName: { $regex: new RegExp(productName, "i") },
  //     };
  //     const searchedProducts = await Product.find(productNameSearchCriteria);
  //     // Cache the search results for productName with an expiration time (e.g., 1 hour)
  //     await redisClient.set(
  //       productNameCacheKey,
  //       JSON.stringify(searchedProducts),
  //       {
  //         EX: PRODUCT_CACHE_EXPIRATION,
  //         NX: true,
  //       }
  //     );
  //     const totalSearchedProducts = searchedProducts.length;
  //     if (totalSearchedProducts === 0) {
  //       return res.ok({
  //         message: "No products found matching the search criteria.",
  //       });
  //     }
  //     return res.ok({ searchedProducts, totalSearchedProducts });
  //   } else {
  //     // If neither productName nor productCategory is provided, return an error message
  //     return res.error(
  //       400,
  //       "Please provide a search query (productName or productCategory).",
  //       "INVALID_REQUEST_PARAMETERS"
  //     );
  //   }
  // }
  // // Get a product by ID
  // async getProductById(req: Request, res: Response) {
  //   const { productId } = req.params;
  //   if (!productId) {
  //     throw new ResourceNotFound(
  //       "Product id is missing.",
  //       "RESOURCE_NOT_FOUND"
  //     );
  //   }
  //   const product = await Product.findById(productId);
  //   if (!product) {
  //     throw new ResourceNotFound(
  //       `Product with ID ${productId} not found.`,
  //       "RESOURCE_NOT_FOUND"
  //     );
  //   }
  //   res.ok(product);
  // }
  // // Get a product by productSlug
  // async getProductByproductSlug(req: Request, res: Response) {
  //   const { productSlug } = req.params;
  //   if (!productSlug) {
  //     throw new ResourceNotFound(
  //       "product Slug is missing.",
  //       "RESOURCE_NOT_FOUND"
  //     );
  //   }
  //   const product = await Product.findOne({ productSlug });
  //   if (!product) {
  //     throw new ResourceNotFound(
  //       `Product with ${productSlug} not found.`,
  //       "RESOURCE_NOT_FOUND"
  //     );
  //   }
  //   res.ok(product);
  // }
  // // Update a product by ID
  // async updateProduct(req: Request, res: Response) {
  //   const { productId, businessId } = req.query;
  //   if (!mongoose.Types.ObjectId.isValid(businessId as string)) {
  //     throw new BadRequest(
  //       "businessId is not a valid ObjectId",
  //       "INVALID_REQUEST_PARAMETERS"
  //     );
  //   }
  //   if (!productId || !businessId) {
  //     throw new ResourceNotFound(
  //       "Query parameters are missing",
  //       "RESOURCE_NOT_FOUND"
  //     );
  //   }
  //   const { error, data } = validators.updateProductValidator(req.body);
  //   if (error) throw new BadRequest(error.message, error.code);
  //   const product = await Product.findById(productId);
  //   let productSlug: string | null = product?.productSlug || null;
  //   let productQrCode: string | null = null;
  //   console.log(
  //     "productName !== data.productName",
  //     product?.productName,
  //     data.productName
  //   );
  //   // Check if the productName has changed
  //   if (data.productName && product?.productName !== data.productName) {
  //     // Create a unique slug for the productName
  //     const baseSlug = slugify(data.productName, { lower: true });
  //     let slugSuffix = "";
  //     // Check if the productSlug already exists and keep appending random characters until it's unique
  //     while (true) {
  //       const existingProduct = await Product.findOne({
  //         productSlug,
  //         businessId,
  //       });
  //       if (!existingProduct) {
  //         // Slug is unique, break the loop
  //         break;
  //       }
  //       // Generate a random string
  //       slugSuffix = generateRandomString();
  //       // Append the random string to the baseSlug
  //       productSlug = `${baseSlug}-${slugSuffix}`;
  //     }
  //     console.log("productSlug 1", productSlug);
  //     // Generate QR code for the updated productSlug
  //     const business = await Business.findById(businessId);
  //     const businessSlug = business?.businessSlug;
  //     const yourBaseURL = process.env.BASE_URL!;
  //     const qrCodeData = `${yourBaseURL}/shop/${businessSlug}/product/${productSlug}`;
  //     const qrCodeOptions: qrcode.QRCodeToDataURLOptions = {
  //       type: "image/png", // Set the type property to 'image/png'
  //     };
  //     productQrCode = await generateQRCode(qrCodeData, qrCodeOptions);
  //     console.log("productQrCode 1", productQrCode);
  //   }
  //   // Update the data object without assigning productSlug and productQrCode
  //   const updateData: Partial<IProduct> = {
  //     ...data,
  //     businessId: new mongoose.Types.ObjectId(businessId as string),
  //   };
  //   console.log("updateData 1", updateData);
  //   console.log("productSlug 2", productSlug);
  //   console.log("productQrCode 2", productQrCode);
  //   // Assign productSlug and productQrCode if they have values
  //   if (productSlug !== null && productQrCode !== null) {
  //     updateData.productSlug = productSlug;
  //     updateData.productQrCode = productQrCode;
  //     console.log("updateData 2", updateData);
  //   }
  //   // Perform the update operation using the updated data object
  //   const updatedProduct = await Product.findByIdAndUpdate(
  //     productId,
  //     updateData,
  //     {
  //       new: true,
  //     }
  //   );
  //   if (!updatedProduct) {
  //     throw new BadRequest(
  //       `Product with ID ${productId} not updated.`,
  //       "INVALID_REQUEST_PARAMETERS"
  //     );
  //   }
  //   res.ok(updatedProduct);
  // }


  // Upload Product Images
  // // Delete single media
  //   async deleteSingleMedia(req: Request, res: Response) {
  //     const { error, data } = validators.deleteMediaProductValidator(req.query);
  //     if (error) throw new BadRequest(error.message, error.code);
  //     const { imageId, productId } = data;
  //     // Find the product by ID
  //     const product = await Product.findById(productId);
  //     if (!product) {
  //       throw new BadRequest(
  //         `Product with ID ${productId} not found.`,
  //         "INVALID_REQUEST_PARAMETERS"
  //       );
  //     }
  //     // Find the index of the mediaImage with the given imageId
  //     const imageIndex = product.productImages.findIndex(
  //       (img: string) => img === imageId
  //     );
  //     if (imageIndex === -1) {
  //       throw new BadRequest(
  //         `Image with ${imageId} not found in product.`,
  //         "INVALID_REQUEST_PARAMETERS"
  //       );
  //     }
  //   //   // Get the image URL (or key) to delete from AWS
  //   //   const imageKey = product.productImages[imageIndex];
  //   //   // Delete the image from AWS (replace with your actual deletion logic)
  //   //   await deleteImage(imageKey);
  //   //   // Remove the mediaImage from the product's productImages array
  //   //   product.productImages.splice(imageIndex, 1);
  //   //   // Update the product record in the database
  //   //   const updateProduct = await product.save();
  //   //   if (!updateProduct) {
  //   //     throw new BadRequest(
  //   //       "Product update failed.",
  //   //       "INVALID_REQUEST_PARAMETERS"
  //   //     );
  //   //   }
  //   //   return res.ok({
  //   //     product: updateProduct,
  //   //     message: `Image with ${imageId} deleted successfully`,
  //   //   });
  //   // }
  //   // // Delete a product by ID
  //   // async deleteProduct(req: Request, res: Response) {
  //   //   const { productId } = req.params;
  //   //   if (!productId) {
  //   //     throw new ResourceNotFound(
  //   //       "Product ID is missing.",
  //   //       "RESOURCE_NOT_FOUND"
  //   //     );
  //   //   }
  //   //   const product: IProduct | null = await Product.findById(productId);
  //   //   if (!product) {
  //   //     throw new ResourceNotFound(
  //   //       `Product with ID ${productId} not found.`,
  //   //       "RESOURCE_NOT_FOUND"
  //   //     );
  //   //   }
  //   //   // Check if the product has images
  //   //   if (product.productImages && product.productImages.length > 0) {
  //   //     // Delete all images associated with the product from AWS
  //   //     await deleteImagesFromAWS(product.productImages);
  //   //   }
  //   //   // Delete the product from the database
  //   //   await Product.findByIdAndDelete(productId);
  //   //   res.noContent();
  //   // }
}

export default new applicationMediaController();
