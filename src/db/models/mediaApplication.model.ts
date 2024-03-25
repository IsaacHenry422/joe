import mongoose, { Document, Model } from "mongoose";

// Define the interface for the Media Application document
export interface IMediaApplication extends Document {
  // define others here
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Media Application schema
const MediaApplicationSchema = new mongoose.Schema<IMediaApplication>(
  {
    //define others here
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Define the MediaApplication model
const MediaApplicationModel: Model<IMediaApplication> =
  mongoose.model<IMediaApplication>("MediaApplication", MediaApplicationSchema);

export default MediaApplicationModel;
