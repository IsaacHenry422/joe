import { s3Client, s3Bucket } from "../config/s3.config";
import { randomUUID } from "crypto";
import {
  PutObjectCommand,
  DeleteObjectCommand,
  // ObjectCannedACL,
} from "@aws-sdk/client-s3";

import fs from "fs/promises";
import url from "url";
import sharp from "sharp";

async function uploadPicture(
  file: string,
  folderName: string,
  fileExtension: string
): Promise<string> {
  // Determine Content-Type based on file extension
  const contentType = fileExtension === ".jpg" ? "image/jpeg" : "image/png";

  const bucketParams = {
    Bucket: s3Bucket,
    Key: folderName + "/" + randomUUID() + fileExtension,
    // Set the Content-Type metadata
    ContentType: contentType,
    Body: await fs.readFile(file),
  };

  await s3Client.send(new PutObjectCommand(bucketParams));
  return bucketParams.Key;
}
// To use uploadPicture for example:
// const path = require("path");
// const fileExtension = path.extname(file.originalname);

// const uploadedKey = await uploadPicture(req.file.path, folderName, fileExtension);
// await fs.unlink(req.file.path);
// console.log("Uploaded key:", uploadedKey);

async function deleteImage(key: string): Promise<void> {
  const parsedUrl = url.parse(key);
  const objectKey = parsedUrl.pathname?.substring(1);

  const bucketParams = {
    Bucket: s3Bucket,
    Key: objectKey,
  };
  try {
    await s3Client.send(new DeleteObjectCommand(bucketParams));
    console.log("Image  deleted from S3.");
  } catch (error) {
    console.error(`Failed to delete image  from S3: ${error}`);
  }
}
// To use deleteImage for example:
// const imageKey = "path/to/image.jpg";
// await deleteImage(imageKey);
// console.log("Image deleted successfully.");

// Define the function to delete images from S3 (replace with your implementation)
async function deleteImagesFromStorage(imageUrls: string[]) {
  for (const imageUrl of imageUrls) {
    // Parse the URL to get the pathname, which represents the object key
    const parsedUrl = url.parse(imageUrl);
    const objectKey = parsedUrl.pathname?.substring(1); // Remove the leading slash
    if (objectKey) {
      const bucketParams = {
        Bucket: s3Bucket,
        Key: objectKey,
      };

      try {
        await s3Client.send(new DeleteObjectCommand(bucketParams));
        console.log(`Image '${objectKey}' deleted from S3.`);
      } catch (error) {
        console.error(
          `Failed to delete image '${objectKey}' from S3: ${error}`
        );
      }
    } else {
      console.error(`Invalid image URL: ${imageUrl}`);
    }
  }
}

async function reduceImageSize(filePath: string): Promise<string> {
  const resizedImagePath = `${filePath}-resized`;

  await sharp(filePath)
    .resize({ width: 1000, height: 1000 })
    .toFile(resizedImagePath);

  return resizedImagePath;
}

export { uploadPicture, deleteImage, deleteImagesFromStorage, reduceImageSize };
