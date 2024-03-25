import express from "express";
// import mediaApplicationController from "../controllers/mediaApplication.controller";
// import { auth } from "../../middlewares/authMiddleware";
// import upload from "../../middlewares/multerMiddleware";

const mediaApplicationRouter = express.Router();

// Create a new mediaApplication
// mediaApplicationRouter.post(
//   "/",
//   auth({ accountType: ["admin"] }),
//   mediaApplicationController.createMediaApplication
// );

// picture uplaod
// mediaApplicationRouter.post(
//   "/upload-images",
//   auth({ accountType: ["admin"] }),
//   upload.array("images", 3),
//   mediaApplicationController.uploadMediaImages
// );

export default mediaApplicationRouter;
