/* eslint-disable no-constant-condition */
import { Request, Response } from "express";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
dotenv.config();

import { BadRequest, ResourceNotFound } from "../../../errors/httpErrors";
import orderImages from "../../../db/models/orderImages.model";
// import Admin from "../../../db/models/admin.model";

// import * as validators from "../validators/orderImages.validator";

// import {
//   getLimit,
//   getPage,
//   getStartDate,
//   getEndDate,
// } from "../../../utils/dataFilters";
import { promises as fsPromises } from "fs";
import path from "path";
import {
  uploadPicture,
  deleteImagesFromStorage,
  deleteImage,
  reduceImageSize,
} from "../../../services/file.service";
// import { toInteger } from "lodash";

interface Picture {
  url: string;
  id: string;
}

const awsBaseUrl = process.env.AWS_BASEURL;

class orderImagesController {
  // // Create a order images application

  async uploadOrderImages(userId: string, orderId: string, req: Request) {
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
    const imageUrls: Array<Picture> = [];
    let orderImage = await orderImages.findOne({ orderId });
    if (!orderImage) {
      await Promise.all(
        uploadedImages.map(async (uploadedFile) => {
          const productPictureExtension = path.extname(
            uploadedFile.originalname
          );
          const resizedImagePath = await reduceImageSize(uploadedFile.path);
          const productPictureKey = await uploadPicture(
            resizedImagePath,
            "order-images",
            productPictureExtension
          );
          await fsPromises.unlink(resizedImagePath);
          const url = `${awsBaseUrl}/${productPictureKey}`;
          imageUrls.push({
            url,
            id: uuidv4(),
          });
        })
      );
      orderImage = new orderImages({
        orderId,
        imageUrls,
        userId,
      });
      await orderImage.save();
    } else {
      await Promise.all(
        uploadedImages.map(async (uploadedFile) => {
          const productPictureExtension = path.extname(
            uploadedFile.originalname
          );
          const resizedImagePath = await reduceImageSize(uploadedFile.path);
          const productPictureKey = await uploadPicture(
            resizedImagePath,
            "order-images",
            productPictureExtension
          );
          await fsPromises.unlink(resizedImagePath);
          const url = `${awsBaseUrl}/${productPictureKey}`;
          orderImage?.imageUrls.push({
            url,
            id: uuidv4(),
          });
          await orderImage?.save();
        })
      );
    }
    return orderImage;
  }

  //   get an order images

  async getOrderImages(req: Request, res: Response) {
    const { orderId } = req.params;
    if (!orderId)
      throw new BadRequest("please provide orderId", "MISSING_REQUIRED_FIELD");
    const orderImage = await orderImages.findOne({ orderId });
    if (!orderImage)
      throw new ResourceNotFound(
        `order with ID:${orderId} does not have an uploaded image`,
        "RESOURCE_NOT_FOUND"
      );
    res.ok({
      message: "successfully fetched order images",
      data: orderImage,
    });
  }

  //   delete order images

  async deleteOrderImage(req: Request, res: Response) {
    const { orderId, imageId } = req.body;
    if (!orderId)
      throw new BadRequest(
        "please provide product custom id",
        "MISSING_REQUIRED_FIELD"
      );
    const orderImage = await orderImages.findOne({ orderId });
    if (!orderImage)
      throw new ResourceNotFound(
        `order with id:${orderId} does not have an image`,
        "RESOURCE_NOT_FOUND"
      );
    let pictureUrl;
    let index = 0;
    let pictureIndex = -1;

    // Find the picture and its index in the pictures array
    for (const picture of orderImage.imageUrls as Picture[]) {
      pictureIndex++;
      if (picture && picture.id === imageId) {
        pictureUrl = picture.url;
        index = pictureIndex;
      }
    }

    if (!pictureUrl)
      throw new ResourceNotFound(
        `Order with id: ${orderId} does not have any image with the id provided`,
        "RESOURCE_NOT_FOUND"
      );

    // Delete the image from the storage
    await deleteImage(pictureUrl);

    // Remove the picture object from the pictures array
    orderImage.imageUrls.splice(index, 1);

    // Save the updated product back to the database
    await orderImage.save();

    res.ok({
      message: "Order image deleted successfully.",
      data: orderImage,
    });
  }

  async deleteOrderImages(req: Request, res: Response, orderId: string) {
    if (!orderId)
      throw new BadRequest("please provide orderId", "MISSING_REQUIRED_FIELD");
    const orderImage = await orderImages.findOne({ orderId });
    if (!orderImage)
      throw new ResourceNotFound(
        `order with ID:${orderId} does not have an uploaded image`,
        "RESOURCE_NOT_FOUND"
      );

    const pictureUrls: string[] = [];

    for (const picture of orderImage.imageUrls as Picture[]) {
      if (picture && picture.url) {
        pictureUrls.push(picture.url);
      }
    }
    console.log(pictureUrls);

    await deleteImagesFromStorage(pictureUrls);
    await orderImages.findOneAndDelete({ orderId });

    res.ok({
      message: "successfully deleted order images",
    });
  }
}

export default new orderImagesController();