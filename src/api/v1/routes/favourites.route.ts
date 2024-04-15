import express from "express";
import controller from "../controllers/favourites.controller";
import { auth } from "../../middlewares/authMiddleware";

const favouriteRouter = express.Router();

// Get all favourites route
// favouriteRouter.get(
//   "/",
//   auth({ accountType: ["admin"] }),
//   controller.getFavourites
// );

// Get a specific favourite by ID route
favouriteRouter.get(
  "/user",
  auth({ accountType: ["admin", "user"] }),
  controller.getFavoritesByUserId
);

// Create a new favourite route
favouriteRouter.post(
  "/create/:id",
  auth({ accountType: ["admin", "user"] }),
  controller.createFavorite
);

// Delete a favourite by ID route
favouriteRouter.delete(
  "/:favouriteId",
  auth({ accountType: ["user", "admin"] }),
  controller.deleteFavorite
);

export default favouriteRouter;
