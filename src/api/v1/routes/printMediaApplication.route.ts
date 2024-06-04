import express from "express";
import printMediaController from "../controllers/printMediaApplication.controller";
import { auth } from "../../middlewares/authMiddleware";
import upload from "../../middlewares/multerMiddleware";

const mediaApplicationRouter = express.Router();

// Create a new print prototype
mediaApplicationRouter.post(
  "/admin/prototype",
  auth({ accountType: ["admin"] }),
  printMediaController.createPrototype
);

// get all prototypes admin
mediaApplicationRouter.get(
  "/admin/prototype",
  auth({ accountType: ["admin"] }),
  printMediaController.AdmingetPrototypes
);

// get prototype
mediaApplicationRouter.get(
  "/admin/prototype/one/:prototypeId",
  auth({ accountType: ["admin"] }),
  printMediaController.getPrototype
);

// update prototype by id
mediaApplicationRouter.patch(
  "/admin/prototype/:prototypeId",
  auth({ accountType: ["admin"] }),
  printMediaController.updatePrototype
);

// delete prototype
mediaApplicationRouter.delete(
  "/admin/prototype/:prototypeId",
  auth({ accountType: ["admin"] }),
  printMediaController.deletePrototype
);

// get all prototypes
mediaApplicationRouter.get("/prototype", printMediaController.getPrototypes);

// Create a new print media
mediaApplicationRouter.post(
  "/admin",
  auth({ accountType: ["admin"] }),
  printMediaController.createPrintMedia
);

//  upload print media pictures
mediaApplicationRouter.patch(
  "/admin/upload-images/:productId",
  auth({ accountType: ["admin"] }),
  upload.array("images", 3),
  printMediaController.uploadPrintMediaImages
);

// delete print media image
mediaApplicationRouter.patch(
  "/admin/one/delete-image",
  auth({ accountType: ["admin"] }),
  printMediaController.deletePrintMediaImage
);

// get all print media
mediaApplicationRouter.get(
  "/admin",
  auth({ accountType: ["admin"] }),
  printMediaController.getGeneralPrintMediaApplications
);

// update a media print media
mediaApplicationRouter.patch(
  "/admin/:productId",
  auth({ accountType: ["admin"] }),
  printMediaController.updatePrintMedia
);

// delete print media
mediaApplicationRouter.delete(
  "/admin/:productId",
  auth({ accountType: ["admin"] }),
  printMediaController.deletePrintMedia
);

// Get print media landing page
mediaApplicationRouter.get("/", printMediaController.getPrintMediaLandingPage);

// search print media by keyword
mediaApplicationRouter.get(
  "/search",
  printMediaController.searchPrintMediaByKeyword
);

// Get a print media
mediaApplicationRouter.get(
  "/one/:mediaCustomId",
  printMediaController.getPrintMedia
);

mediaApplicationRouter.patch(
  "/favorite/:productId",
  auth({ accountType: ["user"] }),
  printMediaController.updatePrintMediaFavoriteCount
);

// all media applications and sort them by the highest favorite count
mediaApplicationRouter.get(
  "/highest-fovourites",
  auth({ accountType: ["admin"] }),
  printMediaController.getPrintMediaByHighestFavorites
);

export default mediaApplicationRouter;
