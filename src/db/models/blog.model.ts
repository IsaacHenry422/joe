// Import necessary modules and dependencies
import mongoose, { Schema, Document } from "mongoose";

// Define the interface for the blog model
interface IBlog extends Document {
  billboardType: string;
  billboardImage?: string;
  billboardTitle: string;
  billboardBody: string;
}

// Define the schema for the blog model
const BlogSchema: Schema = new Schema(
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

// Create and export the blog model
const BlogModel = mongoose.model<IBlog>("Blog", BlogSchema);

export default BlogModel;
