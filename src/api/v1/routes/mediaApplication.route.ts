import express from "express";
import applicationMediaController from "../controllers/mediaApplication.controller";
import { auth } from "../../middlewares/authMiddleware";
import upload from "../../middlewares/multerMiddleware";

const mediaApplicationRouter = express.Router();

// Create a new media Application
mediaApplicationRouter.post(
  "/admin",
  auth({ accountType: ["admin"] }),
  applicationMediaController.createMediaApplication
);

//  uplaod media Application pictures
mediaApplicationRouter.patch(
  "/admin/upload-images/:productId",
  auth({ accountType: ["admin"] }),
  upload.array("images", 3),
  applicationMediaController.uploadMediaImages
);

// get all media Application
mediaApplicationRouter.get(
  "/admin",
  auth({ accountType: ["admin"] }),
  applicationMediaController.getGeneralMediaApplications
);

// update a media mediaApplication
mediaApplicationRouter.patch(
  "/admin/:productId",
  auth({ accountType: ["admin"] }),
  applicationMediaController.updateMediaApplication
);

// delete mediaApplication
mediaApplicationRouter.delete(
  "/admin/:productId",
  auth({ accountType: ["admin"] }),
  applicationMediaController.deleteMediaApplication
);

// Get general media applications
mediaApplicationRouter.get(
  "/", applicationMediaController.getMediaApplicationsLandingPage
);

// search mediaApplication by keyword
mediaApplicationRouter.get(
  "/search",
  applicationMediaController.searchMediaApplicationByKeyword
);

// Get a media application
mediaApplicationRouter.get(
  "/one/:productId", applicationMediaController.getMediaApplication
);

export default mediaApplicationRouter;
