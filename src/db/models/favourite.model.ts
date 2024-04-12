import mongoose, { Document, Model } from "mongoose";

// Define the interface for the favorite model
export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  mediaId?: mongoose.Types.ObjectId;
  printId?: mongoose.Types.ObjectId;
}

// Define the schema for the favorite model
const FavoriteSchema = new mongoose.Schema<IFavorite>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the user schema
      required: true,
    },
    mediaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "billboardMediaApplication",
      required: true,
    },
    printId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "printMediaApplication", // Reference to the user schema
      required: true,
    },
  },
  { timestamps: true }
);

const FavoriteModel: Model<IFavorite> = mongoose.model<IFavorite>(
  "Favorite",
  FavoriteSchema
);

export default FavoriteModel;
