import { Request, Response } from "express";
import Favorite from "../../../db/models/favourite.model";
import billboardMediaApplication from "../../../db/models/mediaApplication.model";
import PrintMedia from "../../../db/models/printMedia.model";
import { ResourceNotFound, BadRequest } from "../../../errors/httpErrors";

class FavoriteController {
  async createFavorite(req: Request, res: Response) {
    const userId = req.loggedInAccount._id;
    const { mediaId, printId } = req.params;

    // Check if the media or print exists
    const mediaExists = await billboardMediaApplication.findById(mediaId);
    const printExists = await PrintMedia.findById(printId);

    if ((!mediaExists && !printExists) || (mediaExists && printExists)) {
      throw new BadRequest(
        "Please provide either mediaId or printId, not both.",
        "MISSING_REQUIRED_FIELD"
      );
    }

    // Create the favorite based on the provided input
    let favorite;
    if (mediaExists) {
      favorite = new Favorite({
        userId,
        mediaId: mediaExists._id,
      });
    } else if (printExists) {
      favorite = new Favorite({
        userId,
        printId: printExists._id,
      });
    }

    // Save the favorite if it's valid
    if (favorite) {
      const savedFavorite = await favorite.save();
      res.created({ favorite: savedFavorite });
    }
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
