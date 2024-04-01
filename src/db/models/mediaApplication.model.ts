import mongoose, { Document, Model } from "mongoose";

// Define the interface for the Media Application document
export interface IBillboardMediaApplication extends Document {
  // define others here
  mediaType: "Static" | "Led Billboard" | "BRT Buses" | "Lampost Billboard";
  status: "Available" | "Unavailable";
  mediaCustomId: string;
  listingTitle: string;
  description: string;
  brtType: string;
  route: string;
  address: string;
  state: string;
  cityLga: string;
  landmark: string;
  price: string;
  googleStreetlink: string;
  pictures: Array<object>;
  dimension: string;
  nextAvailable: Date;
  createdByAdmin: string;
  amountAvailable: string;

  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Media Application schema
const billboardMediaApplicationSchema =
  new mongoose.Schema<IBillboardMediaApplication>({
    mediaType: {
      type: String,
      enum: ["Static", "Led Billboard", "BRT Buses", "Lampost Billboard"],
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Available", "Unavailable"],
    },
    mediaCustomId: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    nextAvailable: {
      type: Date,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    cityLga: {
      type: String,
      required: true,
    },
    dimension: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    createdByAdmin: {
      type: String,
      required: true,
    },
    pictures: [
      {
        url: String,
        id: String,
        _id: false,
      },
    ],

    // brt media type fields
    brtType: String,
    route: String,
    amountAvailable: String,

    // other media type fields
    address: String,
    landmark: String,
    listingTitle: String,
    googleStreetlink: String,

    //define others here
    deletedAt: {
      type: Date,
      default: null,
    },
  });

// Define compound text index on all fields
billboardMediaApplicationSchema.index({ "$**": "text" });

// Define the MediaApplication model
const billboardMediaApplicationModel: Model<IBillboardMediaApplication> =
  mongoose.model<IBillboardMediaApplication>(
    "billboardMediaApplication",
    billboardMediaApplicationSchema
  );

export default billboardMediaApplicationModel;
