import mongoose, { Document, Model, Schema } from "mongoose";

export interface Iimages extends Document {
  orderId: string;
  imageUrls: Array<object>;
  userId: string;
}

const orderImagesSchema = new Schema<Iimages>(
  {
    orderId: {
      type: String,
      required: true,
    },
    imageUrls: [
      {
        url: String,
        id: String,
        _id: false,
      },
    ],
    userId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const orderImagesModel: Model<Iimages> = mongoose.model<Iimages>(
  "OrderImages",
  orderImagesSchema
);

export default orderImagesModel;
