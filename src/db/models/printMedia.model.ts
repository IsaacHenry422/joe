import mongoose, { Document, Model } from "mongoose";

// Define the interface for the Media Application document
export interface IPrintMediaApplication extends Document {
  // define others here
  name: string;
  description: string;
  price: number;
  pictures: Array<object>;
  features: Array<string>;
  mediaCustomId: string;
  favoriteCount: number;
  height: string;
  width: string;
  prototypeName: string;
  prototypeId: mongoose.Schema.Types.ObjectId;
  vaad_id: string;
  createdByAdmin: string;
  finishingDetails: object;
  createdAt: Date;
}

// Define the Media Application schema
const printMediaSchema = new mongoose.Schema<IPrintMediaApplication>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  favoriteCount: {
    type: Number,
    default: 0,
  },
  pictures: [
    {
      url: String,
      id: String,
      _id: false,
    },
  ],
  prototypeName: {
    type: String,
  },
  prototypeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  vaad_id: {
    type: String,
  },
  height: {
    type: String,
    required: true,
  },
  width: {
    type: String,
    required: true,
  },
  mediaCustomId: {
    type: String,
    required: true,
  },
  createdByAdmin: {
    type: String,
    required: true,
  },
  finishingDetails: {
    eyelets: Boolean,
    pocketTB: Boolean,
    pocketLR: Boolean,
    none: Boolean,
  },
  features: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

// Define compound text index on all fields
printMediaSchema.index({ "$**": "text" });

// Define the MediaApplication model
const printMediaApplicationModel: Model<IPrintMediaApplication> =
  mongoose.model<IPrintMediaApplication>(
    "printMediaApplication",
    printMediaSchema
  );

export default printMediaApplicationModel;
