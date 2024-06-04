import express from "express";
import controller from "../controllers/favorites.controller";
import { auth } from "../../middlewares/authMiddleware";

const favoriteRouter = express.Router();

//Get all user favorites by Admin
favoriteRouter.get(
  "/admin/:userId",
  auth({ accountType: ["admin"] }),
  controller.getUserFavoritesByAdmin
);

// Get a specific favorite by ID route
favoriteRouter.get(
  "/user",
  auth({ accountType: ["admin", "user"] }),
  controller.getFavoritesByUserId
);

// Create a new favorite route
favoriteRouter.post(
  "/create",
  auth({ accountType: ["admin", "user"] }),
  controller.createFavorite
);

// Delete a favorite by ID route
favoriteRouter.delete(
  "/:favoriteId",
  auth({ accountType: ["user", "admin"] }),
  controller.deleteFavorite
);

export default favoriteRouter;
