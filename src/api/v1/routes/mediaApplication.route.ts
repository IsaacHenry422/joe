import express from "express";
import applicationMediaController from "../controllers/mediaApplication.controller";
import { auth } from "../../middlewares/authMiddleware";
import upload from "../../middlewares/multerMiddleware";

const mediaApplicationRouter = express.Router();

// Create a new mediaApplication
mediaApplicationRouter.post(
  "/",
  auth({ accountType: ["admin"] }),
  applicationMediaController.createMediaApplication
);

// Get general media applications
mediaApplicationRouter.get(
  "/", applicationMediaController.getGeneralMediaApplications
);

// picture uplaod
mediaApplicationRouter.patch(
  "/upload-images/:mediaCustomId",
  auth({ accountType: ["admin"] }),
  upload.array("images", 3),
  applicationMediaController.uploadMediaImages
);

export default mediaApplicationRouter;
