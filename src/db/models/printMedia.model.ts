import mongoose, { Document, Model } from "mongoose";

// Define the interface for the Media Application document
export interface IPrintMediaApplication extends Document {
  // define others here
  name: string;
  description: string;
  price: string;
  picture: string;
  features: Array<string>;
  prototype: mongoose.Schema.Types.ObjectId;
  createdByAdmin: string;
}

// Define the Media Application schema
const printMediaSchema =
  new mongoose.Schema<IPrintMediaApplication>({
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      required: true,
    },
    prototype: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Prototype"
    },
    createdByAdmin: {
      type: String,
      required: true,
    },
    features:[String],
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
