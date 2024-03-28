import mongoose, { Document, Model } from "mongoose";

// Define the interface for the Media Application document
export interface IBillboardMediaApplication extends Document {
  // define others here
  mediaType: "Static" | "Led Billboard"| "BRT Buses" | "Lampost Billboard",
  status: "Available" | "Unavailable",
  mediaCustomId: String,
  listingTitle: String,
  description: String,
  brtType: String,
  route: String,
  address: String,
  state: String,
  cityLga: String,
  landmark: String,
  price: String,
  googleStreetlink: String,
  pictures: String,
  dimension: String,
  nextAvailable: Date,
  createdByAdmin: String,
  amountAvailable: String,

  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Media Application schema
const billboardMediaApplicationSchema = new mongoose.Schema<IBillboardMediaApplication>(
  {
    mediaType: {
      type: String,
      enum: ["Static", "Led Billboard", "BRT Buses", "Lampost Billboard"],
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Available", "Unavailable"]
    },
    mediaCustomId: {
      type: String,
      required: true
    },
    listingTitle: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    nextAvailable: {
      type: Date,
      required: true
    },
    pictures: {
      type:[String],
      required:true,
    },
    brtType: String,
    route: String,
    address: String,
    state: String,
    cityLga: String,
    landmark: String,
    price: String,
    googleStreetlink: String,
    dimension: String,
    amountAvailable: String,
    //define others here
    createdByAdmin: {
      type: String,
      required: true
    },
    deletedAt: {
      type: Date,
      default: null,
    }, 
  }
);

// Define the MediaApplication model
const billboardMediaApplicationModel: Model<IBillboardMediaApplication> =
  mongoose.model<IBillboardMediaApplication>("billboardMediaApplication", billboardMediaApplicationSchema);

export default billboardMediaApplicationModel;
