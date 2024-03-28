import express from "express";
import applicationMediaController from "../controllers/mediaApplication.controller";
import { auth } from "../../middlewares/authMiddleware";
// import mediaApplicationController from "../controllers/mediaApplication.controller";
// import upload from "../../middlewares/multerMiddleware";

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
// mediaApplicationRouter.post(
//   "/upload-images",
//   auth({ accountType: ["admin"] }),
//   upload.array("images", 3),
//   mediaApplicationController.uploadMediaImages
// );

export default mediaApplicationRouter;
