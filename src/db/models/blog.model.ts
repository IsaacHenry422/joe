import mongoose, { Document, Model } from "mongoose";

// Define the interface for the blog model
export interface IBlog extends Document {
  blogType: string;
  blogImage?: string;
  blogTitle: string;
  blogBody: string;
}

// Define the schema for the blog model
const BlogSchema = new mongoose.Schema<IBlog>(
  {
    blogType: { type: String, required: true },
    blogImage: {
      type: String,
      default:
        "https://res.cloudinary.com/duzrrmfci/image/upload/v1703842924/logo.jpg",
    },
    blogTitle: { type: String, required: true },
    blogBody: { type: String, required: true },
  },
  { timestamps: true }
);

const BlogModel: Model<IBlog> = mongoose.model<IBlog>("Blog", BlogSchema);

export default BlogModel;
