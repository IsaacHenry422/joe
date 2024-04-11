import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPrototype extends Document {
  name: string;
  description: string;
  createdByAdmin: string;
}

const prototypeSchema = new Schema<IPrototype>(
  {
    name: {
      type:String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    createdByAdmin: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const prototypeModel: Model<IPrototype> = mongoose.model<IPrototype>(
  "Prototype",
  prototypeSchema
);

export default prototypeModel;
