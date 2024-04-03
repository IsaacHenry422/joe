import mongoose, { Document, Model } from "mongoose";

// Define the interface for the blog model
export interface IBlog extends Document {
  billboardType: string;
  billboardImage?: string;
  billboardTitle: string;
  billboardBody: string;
}

// Define the schema for the blog model
const BlogSchema = new mongoose.Schema<IBlog>(
  {
    billboardType: { type: String, required: true },
    billboardImage: {
      type: String,
      default:
        "https://res.cloudinary.com/duzrrmfci/image/upload/v1703842924/logo.jpg",
    },
    billboardTitle: { type: String, required: true },
    billboardBody: { type: String, required: true },
  },
  { timestamps: true }
);

const BlogModel: Model<IBlog> = mongoose.model<IBlog>("Blog", BlogSchema);

export default BlogModel;
