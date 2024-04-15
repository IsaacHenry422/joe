import { Request, Response } from "express";
import Favorite from "../../../db/models/favourite.model";
import billboardMediaApplication from "../../../db/models/mediaApplication.model";
import PrintMedia from "../../../db/models/printMedia.model";
import { ResourceNotFound, BadRequest } from "../../../errors/httpErrors";

class FavoriteController {
  async createFavorite(req: Request, res: Response) {
    const userId = req.loggedInAccount._id;
    const { id } = req.params;
    const { type } = req.body;

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
    res.created({ favorite: savedFavorite });
  }

  async getFavoritesByUserId(req: Request, res: Response) {
    const userId = req.loggedInAccount._id;

    // Get all favorites for the user and populate mediaId and printId with their respective models
    const favorites = await Favorite.find({ userId })
      .populate("mediaId")
      .populate("printId");

    res.ok(favorites);
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
