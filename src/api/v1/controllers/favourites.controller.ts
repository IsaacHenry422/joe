import { Request, Response } from "express";
import Favorite from "../../../db/models/favourite.model";
import billboardMediaApplication from "../../../db/models/billboardMedia.model";
import PrintMedia from "../../../db/models/printMedia.model";
import * as validators from "../validators/favourites.validator";
import { ResourceNotFound, BadRequest } from "../../../errors/httpErrors";

class FavoriteController {
  async createFavorite(req: Request, res: Response) {
    const userId = req.loggedInAccount._id;

    const { error, data } = validators.createFavouritesValidator(req.query);
    if (error) throw new BadRequest(error.message, error.code);

    const { type, id } = data;

    if (!id) {
      throw new ResourceNotFound("od is missing.", "RESOURCE_NOT_FOUND");
    }

    let favorite;

    if (!type) {
      throw new BadRequest(
        "Please provide the type of favorite (media or print).",
        "MISSING_REQUIRED_FIELD"
      );
    }

    if (type === "media") {
      const mediaExists = await billboardMediaApplication.findById(id);
      if (!mediaExists) {
        throw new ResourceNotFound("Media not found", "RESOURCE_NOT_FOUND");
      }
      favorite = new Favorite({
        userId,
        mediaId: mediaExists._id,
      });
    } else if (type === "print") {
      const printExists = await PrintMedia.findById(id);
      if (!printExists) {
        throw new ResourceNotFound("Print not found", "RESOURCE_NOT_FOUND");
      }
      favorite = new Favorite({
        userId,
        printId: printExists._id,
      });
    } else {
      throw new BadRequest(
        "Invalid favorite type. Please provide either 'media' or 'print'.",
        "INVALID_REQUEST_PARAMETERS"
      );
    }

    // Save the favorite if it's valid
    const savedFavorite = await favorite.save();
    res.created({
      favorite: savedFavorite,
      message: "Favourite created successfully.",
    });
  }

  async getFavoritesByUserId(req: Request, res: Response) {
    const userId = req.loggedInAccount._id;

    // Get all favorites for the user and populate mediaId or printId with their respective models
    const favorites = await Favorite.find({ userId })
      .populate("mediaId")
      .populate("printId");

    if (!favorites) {
      throw new ResourceNotFound(
        `user with ${userId} does not have any favourite`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.ok({
      favorites,
      message: `All favourites associated with user ${userId}`,
    });
  }

  async deleteFavorite(req: Request, res: Response) {
    const { favoriteId } = req.params;
    const userId = req.loggedInAccount._id;

    const deletedFavorite = await Favorite.findOneAndDelete({
      _id: favoriteId,
      userId,
    });

    if (!deletedFavorite) {
      throw new ResourceNotFound(
        `Favorite with ID ${favoriteId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.ok({ message: "Favorite deleted successfully" });
  }
}

export default new FavoriteController();
