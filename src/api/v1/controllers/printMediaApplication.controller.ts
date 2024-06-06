/* eslint-disable no-constant-condition */
import { Request, Response } from "express";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
dotenv.config();

import { BadRequest, ResourceNotFound } from "../../../errors/httpErrors";
import PrintMedia from "../../../db/models/printMedia.model"; // IMediaApplication,
import printPrototype from "../../../db/models/printPrototype.model"; // IMediaApplication,
import Admin from "../../../db/models/admin.model"; // Admin,
import helper from "../../../utils/printMediaHelpers";

import * as validators from "../validators/printMediaApplication.validator";

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
  reduceImageSize,
  deleteImage,
} from "../../../services/file.service";
import { shuffle } from "lodash";

type QueryParams = {
  startDate?: Date;
  endDate?: Date;
  limit?: string;
  page?: string;
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
  async createPrototype(req: Request, res: Response) {
    const adminId = req.loggedInAccount._id;

    const { error, data } = validators.createPrintPrototype(req.body);
    if (error) throw new BadRequest(error.message, error.code);

    const admin = await Admin.findById(adminId);
    const createdByAdmin = admin?.adminCustomId;

    const prototypeExist = await printPrototype.find({ name: data.name });
    if (!prototypeExist)
      throw new BadRequest(
        "prototype already exists",
        "INVALID_REQUEST_PARAMETERS"
      );
    const prototype = new printPrototype({
      ...data,
      createdByAdmin,
    });
    await prototype.save();
    res.created(prototype);
  }
  async AdmingetPrototypes(req: Request, res: Response) {
    const prototypes = await printPrototype.find();
    const totalPrototypes = await printPrototype.countDocuments();
    res.ok(prototypes, { totalPrototypes: totalPrototypes });
  }

  async getPrototypes(req: Request, res: Response) {
    const prototypes = await printPrototype.find(
      {},
      { name: 1, _id: 1, description: 1 }
    );
    const totalPrototypes = await printPrototype.countDocuments();
    res.ok(prototypes, { totalPrototypes: totalPrototypes });
  }

  async getPrototype(req: Request, res: Response) {
    const { prototypeId } = req.params;
    if (!prototypeId)
      throw new BadRequest(
        "please provide prototype id",
        "MISSING_REQUIRED_FIELD"
      );
    const prototype = await printPrototype.findOne({ _id: prototypeId });
    if (!prototype)
      throw new ResourceNotFound("prototype not found", "RESOURCE_NOT_FOUND");
    res.ok(prototype);
  }

  async updatePrototype(req: Request, res: Response) {
    const { prototypeId } = req.params;
    if (!prototypeId)
      throw new BadRequest(
        "please provide prototype id",
        "MISSING_REQUIRED_FIELD"
      );
    const { error, data } = validators.updatePrintPrototype(req.body);
    if (error) throw new BadRequest(error.message, error.code);

    const prototype = await printPrototype.findOneAndUpdate(
      { _id: prototypeId },
      data,
      { runValidators: true, new: true }
    );
    if (!prototype)
      throw new ResourceNotFound("prototype not found", "RESOURCE_NOT_FOUND");
    res.ok(prototype);
  }
  async deletePrototype(req: Request, res: Response) {
    const { prototypeId } = req.params;
    if (!prototypeId)
      throw new BadRequest(
        "please provide prototype id",
        "MISSING_REQUIRED_FIELD"
      );
    const printMediaExist = await PrintMedia.find({ prototypeId });
    console.log(printMediaExist);

    if (printMediaExist.length >= 1)
      throw new BadRequest(
        "cannot delete prototype that have printmedia attached to it",
        "INVALID_REQUEST_PARAMETERS"
      );
    const prototype = await printPrototype.findOneAndDelete({
      _id: prototypeId,
    });
    if (!prototype)
      throw new ResourceNotFound("prototype not found", "RESOURCE_NOT_FOUND");
    res.ok({
      message: `prototype with id: ${prototypeId} successfully deleted`,
    });
  }

  async createPrintMedia(req: Request, res: Response) {
    const adminId = req.loggedInAccount._id;

    const { error, data } = validators.createPrintMediaApplicationValidator(
      req.body
    );
    if (error) throw new BadRequest(error.message, error.code);

    const { prototypeId } = data;
    const prototypeExist = await printPrototype.findOne({ _id: prototypeId });
    if (!prototypeExist)
      throw new ResourceNotFound("prototype not found", "RESOURCE_NOT_FOUND");

    function generateShortUUID() {
      // Generate UUID v4
      const uuid = uuidv4();

      // Remove hyphens and extract the first 8 characters to create a shorter UUID
      const shortUUID = `vad${uuid.replace(/-/g, "").substring(0, 15)}`;

      return shortUUID;
    }
    const prototypeName = prototypeExist.name;
    const mediaCustomId = generateShortUUID();
    const admin = await Admin.findById(adminId);
    const createdByAdmin = admin?.adminCustomId;
    console.log(data);

    const printMedia = new PrintMedia({
      ...data,
      prototypeName,
      createdByAdmin,
      mediaCustomId,
    });
    await printMedia.save();
    res.created(printMedia);
  }

  async getGeneralPrintMediaApplications(req: Request, res: Response) {
    const queryParams: QueryParams = req.query;
    const startDate = getStartDate(queryParams.startDate);
    const endDate = getEndDate(queryParams.endDate);
    const limit = getLimit(queryParams.limit);
    const page = getPage(queryParams.page);

    // Construct the filter based on query parameters
    const filter: Filter = {};
    if (startDate && endDate) {
      filter.createdAt = { $gte: startDate, $lte: endDate };
    }
    const orConditions = await helper.filter(queryParams);
    if (orConditions.length > 0) {
      filter.$and = orConditions;
    }

    // Query the database with the constructed filter
    const products = await PrintMedia.find(filter)
      .sort({ createdAt: 1 })
      .limit(limit)
      .skip(limit * (page - 1));
    const allProducts = await PrintMedia.countDocuments(filter);
    // Send the response
    res.ok(
      {
        products,
        totalProducts: allProducts,
      },
      { page, limit, startDate, endDate }
    );
  }

  async uploadPrintMediaImages(req: Request, res: Response) {
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
    const product = await PrintMedia.findOne({ _id: productId });
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
          "printMedia-images",
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
  async deletePrintMediaImage(req: Request, res: Response) {
    const { productId, imageId } = req.body;
    if (!productId)
      throw new BadRequest(
        "please provide product custom id",
        "MISSING_REQUIRED_FIELD"
      );
    const product = await PrintMedia.findOne({ _id: productId });
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
  async updatePrintMedia(req: Request, res: Response) {
    const { productId } = req.params;
    const { error, data } = validators.updatePrintMediaApplicationValidator(
      req.body
    );
    if (error) throw new BadRequest(error.message, error.code);
    if (!productId)
      throw new BadRequest(
        "please provide product custom id",
        "MISSING_REQUIRED_FIELD"
      );
    if (
      !data.description &&
      !data.features &&
      !data.name &&
      !data.price &&
      !data.prototypeId &&
      !data.finishingDetails
    )
      throw new BadRequest(
        "please provide at least one field to update",
        "MISSING_REQUIRED_FIELD"
      );

    const product = await PrintMedia.findOneAndUpdate(
      { _id: productId },
      data,
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

  async deletePrintMedia(req: Request, res: Response) {
    const { productId } = req.params;
    if (!productId)
      throw new BadRequest(
        "please provide product custom id",
        "MISSING_REQUIRED_FIELD"
      );
    const product = await PrintMedia.findOne({ _id: productId });
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
    await PrintMedia.findOneAndDelete({ _id: productId });
    res.noContent();
  }

  async getPrintMedia(req: Request, res: Response) {
    const { mediaCustomId } = req.params;
    if (!mediaCustomId)
      throw new BadRequest(
        "please provide product custom id",
        "MISSING_REQUIRED_FIELD"
      );
    const product = await PrintMedia.findOne({ mediaCustomId });
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

  async getPrintMediaLandingPage(req: Request, res: Response) {
    const queryParams: QueryParams = req.query;
    const startDate = getStartDate(queryParams.startDate);
    const endDate = getEndDate(queryParams.endDate);
    const limit = getLimit(queryParams.limit);
    const page = getPage(queryParams.page);

    // Construct the filter based on query parameters
    const filter: Filter = {};
    if (startDate && endDate) {
      filter.createdAt = { $gte: startDate, $lte: endDate };
    }
    const orConditions = await helper.filter(queryParams);
    if (orConditions.length > 0) {
      filter.$and = orConditions;
    }
    let randomProducts;
    const allProducts = await PrintMedia.countDocuments(filter);
    if (queryParams.limit && parseInt(queryParams.limit) < 5) {
      randomProducts = shuffle(
        await PrintMedia.find(filter)
          .limit(limit)
          .skip( Math.floor(Math.random() * allProducts))
      );
    } else {
      randomProducts = await PrintMedia.find(filter)
        .limit(limit)
        .skip(limit * (page - 1))
        .sort({ createdAt: -1 });
    }
    res.ok(
      {
        products: randomProducts,
        totalProducts: allProducts,
      },
      { page, limit, startDate, endDate }
    );
  }

  async searchPrintMediaByKeyword(req: Request, res: Response) {
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
    const searchResults = await PrintMedia.find(
      { $text: { $search: keyword }, ...filter },
      { score: { $meta: "textScore" } } // Include score for ranking
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(limit)
      .skip(limit * (page - 1)); // Sort by relevance score
    const allProducts = await PrintMedia.countDocuments();

    // Send the search results in the response
    res.ok({ searchResults, totalProducts: allProducts }, { page, limit });
  }

  async updatePrintMediaFavoriteCount(req: Request, res: Response) {
    const { productId } = req.params; // Get the product ID from request params

    // Find the media application by ID
    const print = await PrintMedia.findById(productId);

    // Check if the product exists
    if (!print) {
      throw new ResourceNotFound(
        `Product with ID ${productId} not found`,
        "RESOURCE_NOT_FOUND"
      );
    }

    // Update the favoriteCount field by increasing it by 1
    print.favoriteCount += 1;

    // Save the updated product
    await print.save();

    // Send a success response with the updated product
    res.ok({
      message: "Favorite count updated successfully",
      data: print,
    });
  }

  async getPrintMediaByHighestFavorites(req: Request, res: Response) {
    const queryParams: QueryParams = req.query;
    const startDate = getStartDate(queryParams.startDate);
    const endDate = getEndDate(queryParams.endDate);
    const limit = getLimit(queryParams.limit);
    const page = getPage(queryParams.page);

    // Query all print media applications and sort them by the highest favorite count
    const mediaByFavorites = await PrintMedia.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .sort({ favoriteCount: -1 })
      .limit(limit)
      .skip(limit * (page - 1));

    // Send the response with the sorted media applications
    res.ok({
      message: "Media applications sorted by highest favorites count",
      data: mediaByFavorites,
    });
  }
}

export default new applicationMediaController();
