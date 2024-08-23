/* eslint-disable no-constant-condition */
import { Request, Response } from "express";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
dotenv.config();

import { BadRequest, ResourceNotFound } from "../../../errors/httpErrors";
import billboardMediaApplication from "../../../db/models/billboardMedia.model"; // IMediaApplication,
import Admin from "../../../db/models/admin.model"; // Admin,
import helper from "../../../utils/mediaApplicationsHelper";

import * as validators from "../validators/billboardMediaApplication.validator";

import {
  getLimit,
  getPage,
  getStartDate,
  getEndDate,
} from "../../../utils/dataFilters";
import { promises as fsPromises } from "fs";
import path from "path";
import {
  uploadPicture,
  deleteImagesFromStorage,
  deleteImage,
  reduceImageSize,
} from "../../../services/file.service";
import { shuffle } from "lodash";

type QueryParams = {
  startDate?: Date;
  endDate?: Date;
  limit?: string;
  page?: string;
  numberOfProducts?: number;
};

interface Picture {
  url: string;
  id: string;
}

interface Filter {
  createdAt?: object;
  $and?: Array<object>;
}

const awsBaseUrl = process.env.AWS_BASEURL;

class applicationMediaController {
  // // Create a new media application
  async createMediaApplication(req: Request, res: Response) {
    const adminId = req.loggedInAccount._id;

    const { error, data } = validators.createMediaApplicationValidator(
      req.body
    );
    if (error) throw new BadRequest(error.message, error.code);
    const { mediaType } = data;
    if (mediaType === "BRT Bus") {
      if (!data.route || !data.brtType || !data.amountAvailable) {
        throw new BadRequest(
          "please provide route, brt type and amount available",
          "INVALID_REQUEST_PARAMETERS"
        );
      }
      if (
        data.googleStreetlink ||
        data.landmark ||
        data.listingTitle ||
        data.address
      ) {
        throw new BadRequest(
          "Brt buses cannot have googleStreetlink, landmark, listing title or address",
          "INVALID_REQUEST_PARAMETERS"
        );
      }
    } else {
      if (data.route || data.brtType || data.amountAvailable) {
        throw new BadRequest(
          `${mediaType} cannot have route, brt type or amount available`,
          "INVALID_REQUEST_PARAMETERS"
        );
      }
      if (
        !data.googleStreetlink ||
        !data.landmark ||
        !data.listingTitle ||
        !data.address
      ) {
        throw new BadRequest(
          `${mediaType} require google street link, landmark, listing title, and address`,
          "INVALID_REQUEST_PARAMETERS"
        );
      }
    }
    function generateShortUUID() {
      // Generate UUID v4
      const uuid = uuidv4();

      // Remove hyphens and extract the first 8 characters to create a shorter UUID
      const shortUUID = `vad${uuid.replace(/-/g, "").substring(0, 15)}`;

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

  async getGeneralMediaApplications(req: Request, res: Response) {
    const queryParams: QueryParams = req.query;
    const startDate = getStartDate(queryParams.startDate);
    const endDate = getEndDate(queryParams.endDate);
    const limit = getLimit(queryParams.limit);
    const page = getPage(queryParams.page);

    // Construct the filter based on query parameters
    const filter: Filter = {};
    if (queryParams.startDate && queryParams.endDate) {
      filter.createdAt = { $gte: startDate, $lte: endDate };
    }
    const orConditions = await helper.filter(queryParams);
    if (orConditions.length > 0) {
      filter.$and = orConditions;
    }

    // Query the database with the constructed filter
    const products = await billboardMediaApplication
      .find(filter)
      .sort({ createdAt: 1 })
      .limit(limit)
      .skip(limit * (page - 1));
    const allProducts = await billboardMediaApplication.countDocuments(filter);
    const totalPages = Math.ceil(allProducts/limit);
    // Send the response
    res.ok(
      {
        products,
        totalProducts: allProducts,
        totalPages: totalPages,
      },
      { page, limit, startDate, endDate }
    );
  }

  async uploadMediaImages(req: Request, res: Response) {
    const { productId } = req.params;
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
    const product = await billboardMediaApplication.findOne({ _id: productId });
    if (!product)
      throw new ResourceNotFound(
        `Product with custom id ${productId} does not exist`,
        "RESOURCE_NOT_FOUND"
      );
    await Promise.all(
      uploadedImages.map(async (uploadedFile) => {
        const productPictureExtension = path.extname(uploadedFile.originalname);
        const resizedImagePath = await reduceImageSize(uploadedFile.path);
        const productPictureKey = await uploadPicture(
          resizedImagePath,
          "billboard-images",
          productPictureExtension
        );
        await fsPromises.unlink(resizedImagePath);
        const url = `${awsBaseUrl}/${productPictureKey}`;
        product.pictures.push({
          url,
          id: uuidv4(),
        });
        await product.save();
      })
    );
    res.ok({
      message: "Product images uploaded successfully.",
      imageUrls: product.pictures,
    });
  }

  async updateMediaApplication(req: Request, res: Response) {
    const { productId } = req.params;
    const {
      mediaType,
      status,
      listingTitle,
      description,
      brtType,
      route,
      address,
      state,
      cityLga,
      landmark,
      price,
      googleStreetlink,
      dimension,
      nextAvailable,
      amountAvailable,
      vaad_id,
    } = req.body;
    if (!productId)
      throw new BadRequest(
        "please provide product custom id",
        "MISSING_REQUIRED_FIELD"
      );
    if (
      !mediaType &&
      !status &&
      !listingTitle &&
      !description &&
      !brtType &&
      !route &&
      !address &&
      !state &&
      !cityLga &&
      !landmark &&
      !price &&
      !googleStreetlink &&
      !dimension &&
      !nextAvailable &&
      !amountAvailable &&
      !vaad_id
    ) {
      throw new BadRequest(
        "pleasse provided at least one field to update",
        "MISSING_REQUIRED_FIELD"
      );
    }
    const updateFields = {
      mediaType,
      status,
      listingTitle,
      description,
      brtType,
      route,
      address,
      state,
      cityLga,
      landmark,
      price,
      googleStreetlink,
      dimension,
      nextAvailable,
      amountAvailable,
      vaad_id,
    };
    const product = await billboardMediaApplication.findOneAndUpdate(
      { _id: productId },
      updateFields,
      { new: true, runValidators: true }
    );
    if (!product)
      throw new ResourceNotFound(
        `product with id:${productId} not found`,
        "RESOURCE_NOT_FOUND"
      );
    res.ok({
      message: "product details updated successfully",
      data: product,
    });
  }
  async deleteMediaApplication(req: Request, res: Response) {
    const { productId } = req.params;
    if (!productId)
      throw new BadRequest(
        "please provide product custom id",
        "MISSING_REQUIRED_FIELD"
      );
    const product = await billboardMediaApplication.findOne({ _id: productId });
    if (!product)
      throw new ResourceNotFound(
        `product with id:${productId} not found`,
        "RESOURCE_NOT_FOUND"
      );
    const pictureUrls: string[] = [];

    for (const picture of product.pictures as Picture[]) {
      if (picture && picture.url) {
        pictureUrls.push(picture.url);
      }
    }
    console.log(pictureUrls);

    await deleteImagesFromStorage(pictureUrls);
    await billboardMediaApplication.findOneAndDelete({ _id: productId });
    res.noContent();
  }
  async deleteMediaApplicationImage(req: Request, res: Response) {
    const { productId, imageId } = req.body;
    if (!productId)
      throw new BadRequest(
        "please provide product custom id",
        "MISSING_REQUIRED_FIELD"
      );
    const product = await billboardMediaApplication.findOne({ _id: productId });
    if (!product)
      throw new ResourceNotFound(
        `product with id:${productId} not found`,
        "RESOURCE_NOT_FOUND"
      );
    let pictureUrl;
    let index = 0;
    let pictureIndex = -1;

    // Find the picture and its index in the pictures array
    for (const picture of product.pictures as Picture[]) {
      pictureIndex++;
      if (picture && picture.id === imageId) {
        pictureUrl = picture.url;
        index = pictureIndex;
      }
    }

    if (!pictureUrl)
      throw new ResourceNotFound(
        `Product with id: ${productId} does not have any image with the id provided`,
        "RESOURCE_NOT_FOUND"
      );

    // Delete the image from the storage
    await deleteImage(pictureUrl);

    // Remove the picture object from the pictures array
    product.pictures.splice(index, 1);

    // Save the updated product back to the database
    await product.save();

    res.ok({
      message: "Product image deleted successfully.",
      imageUrls: product.pictures,
    });
  }
  async getMediaApplication(req: Request, res: Response) {
    const { mediaCustomId } = req.params;
    if (!mediaCustomId)
      throw new BadRequest(
        "please provide product custom id",
        "MISSING_REQUIRED_FIELD"
      );
    const product = await billboardMediaApplication.findOne({ mediaCustomId });
    if (!product)
      throw new ResourceNotFound(
        `product with id:${mediaCustomId} not found`,
        "RESOURCE_NOT_FOUND"
      );
    res.ok({
      message: "product details fetched successfully",
      data: product,
    });
  }

  async getMediaApplicationsLandingPage(req: Request, res: Response) {
    const queryParams: QueryParams = req.query;
    const startDate = getStartDate(queryParams.startDate);
    const endDate = getEndDate(queryParams.endDate);
    const limit = getLimit(queryParams.limit);
    let page = getPage(queryParams.page);

    // Construct the filter based on query parameters
    const filter: Filter = {};
    if (queryParams.startDate && queryParams.endDate) {
      filter.createdAt = { $gte: startDate, $lte: endDate };
    }
    const orConditions = await helper.filter(queryParams);
    if (orConditions.length > 0) {
      filter.$and = orConditions;
    }
    let randomProducts;
    const allProducts = await billboardMediaApplication.countDocuments(filter);
    const totalPages = Math.ceil(allProducts/limit);
    if (limit < 5) {
      const products = await billboardMediaApplication.find(filter);
      randomProducts = shuffle(products).slice(0, limit);
    } else {
      if (limit * (page - 1) > allProducts) {
        page = 1;
      }
      randomProducts = await billboardMediaApplication
        .find(filter)
        .limit(limit)
        .skip(limit * (page - 1))
        .sort({ createdAt: -1 });
    }
    res.ok(
      {
        products: randomProducts,
        totalProducts: allProducts,
        totalPages:totalPages,
      },
      { page, limit, startDate, endDate }
    );
  }

  async searchMediaApplicationByKeyword(req: Request, res: Response) {
    const queryParams: QueryParams = req.query;
    const limit = getLimit(queryParams.limit);
    const page = getPage(queryParams.page);

    // Construct the filter based on query parameters
    const filter: Filter = {};
    const orConditions = await helper.filter(queryParams);
    if (orConditions.length > 0) {
      filter.$and = orConditions;
    }
    console.log(filter);

    // Extract keyword from request query
    const keyword: string = req.query.keyword as string;

    // Perform text search query
    const searchResults = await billboardMediaApplication
      .find(
        { $text: { $search: keyword }, ...filter },
        { score: { $meta: "textScore" } } // Include score for ranking
      )
      .sort({ score: { $meta: "textScore" } })
      .limit(limit)
      .skip(limit * (page - 1)); // Sort by relevance score
    const allProducts = await billboardMediaApplication.countDocuments();
    const totalPages = Math.ceil(allProducts/limit);
    // Send the search results in the response
    res.ok({ searchResults, totalProducts: allProducts, totalPages:totalPages, }, { limit, page });
  }

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
  // Update the favoriteCount field for a specific media application
  async updateFavoriteCount(req: Request, res: Response) {
    const { productId } = req.params; // Get the product ID from request params

    // Find the media application by ID
    const product = await billboardMediaApplication.findById(productId);

    // Check if the product exists
    if (!product) {
      throw new ResourceNotFound(
        `Product with ID ${productId} not found`,
        "RESOURCE_NOT_FOUND"
      );
    }

    // Update the favoriteCount field by increasing it by 1
    product.favoriteCount += 1;

    // Save the updated product
    await product.save();

    // Send a success response with the updated product
    res.ok({
      message: "Favorite count updated successfully",
      data: product,
    });
  }

  async getMediaByHighestFavorites(req: Request, res: Response) {
    const queryParams: QueryParams = req.query;
    const startDate = getStartDate(queryParams.startDate);
    const endDate = getEndDate(queryParams.endDate);
    const limit = getLimit(queryParams.limit);
    const page = getPage(queryParams.page);

    // Query all media applications and sort them by the highest favorite count
    const mediaByFavorites = await billboardMediaApplication
      .find({
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .sort({ favoriteCount: -1 })
      .limit(limit)
      .skip(limit * (page - 1));

    // Send the response with the sorted media applications
    res.ok({
      message: "Print Media applications sorted by highest favorites count",
      data: mediaByFavorites,
    });
  }
}

export default new applicationMediaController();
