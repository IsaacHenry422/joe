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
} from "../../../services/file.service";
import { toInteger } from "lodash";

type QueryParams = {
  startDate?: Date;
  endDate?: Date;
  limit?: string;
  page?: string;
};

interface Picture {
  url: string;
}

interface Filter {
  createdAt?: object;
  $or?: Array<object>;
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

    const prototype = new printPrototype({
      ...data,
      createdByAdmin,
    });
    await prototype.save();
    res.created(prototype);
  }
  async getPrototypes(req: Request, res: Response) {
    const prototypes = await printPrototype.find({});
    res.ok(prototypes);
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
    const prototype = await printPrototype.findOneAndDelete({
      _id: prototypeId,
    });
    if (!prototype)
      throw new ResourceNotFound("prototype not found", "RESOURCE_NOT_FOUND");
    res.noContent();
  }

  async createPrintMedia(req: Request, res: Response) {
    const adminId = req.loggedInAccount._id;

    const { error, data } = validators.createPrintMediaApplicationValidator(
      req.body
    );
    if (error) throw new BadRequest(error.message, error.code);

    const {prototypeId} = data;
    const prototypeExist = await printPrototype.findOne({_id:prototypeId});
    if(!prototypeExist) throw new ResourceNotFound("prototype not found","RESOURCE_NOT_FOUND");

    const admin = await Admin.findById(adminId);
    const createdByAdmin = admin?.adminCustomId;
    console.log(data);

    const printMedia = new PrintMedia({
      ...data,
      createdByAdmin,
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
      filter.$or = orConditions;
    }

    // Query the database with the constructed filter
    const products = await PrintMedia.find(filter)
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
    const picArray: object[] = [];
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
        picArray.push({
          url,
          id: uuidv4(),
        });
      })
    );
    console.log(picArray);
    
    await PrintMedia.findOneAndUpdate(
      { _id: productId },
      { pictures: picArray },
      { new: true, runValidators: true }
    );

    res.ok({
      message: "Product images uploaded successfully.",
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
    let randomSkip: number;

    // Construct the filter based on query parameters
    const filter: Filter = {};
    if (startDate && endDate) {
      filter.createdAt = { $gte: startDate, $lte: endDate };
    }
    const orConditions = await helper.filter(queryParams);
    if (orConditions.length > 0) {
      filter.$or = orConditions;
    }
    const count = await PrintMedia.countDocuments();
    if (!queryParams.limit || toInteger(queryParams.limit) < 8) {
      randomSkip = Math.floor(Math.random() * toInteger(count));
    } else {
      randomSkip = limit * (page - 1);
    }
    console.log(randomSkip);

    const randomProducts = await PrintMedia.find(filter)
      .limit(limit)
      .skip(randomSkip);

    res.ok(
      {
        products: randomProducts,
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
      filter.$or = orConditions;
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

    // Send the search results in the response
    res.ok({ searchResults });
  }
}

export default new applicationMediaController();
