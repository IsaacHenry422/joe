import mongoose, { Document, Model, Schema, Types } from "mongoose";
import slugify from "slugify";
 import type { ICategory } from './category';

// Interface for Product Images
interface IProductImage {
  url: string;
  altText?: string;
  isPrimary?: boolean;
}

// Interface for Product Attributes
interface IProductAttributes {
  [key: string]: string | number;
}

// Interface for Product Ratings
interface IProductRating {
  userId: Types.ObjectId;
  value: number;
  review?: string;
  createdAt: Date;
}

// Main Product Interface
export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  discountedPrice?: number;
  sku: string;
  stock: number;
  categories: Types.ObjectId[] | ICategory[];
  images: IProductImage[];
  attributes: IProductAttributes;
  ratings?: IProductRating[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  averageRating: number;
}

// Product Schema
const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
      max: [1000000, "Price cannot exceed 1,000,000"],
    },
    discountedPrice: {
      type: Number,
      validate: {
        validator: function (this: IProduct, value: number) {
          return value < this.price;
        },
        message: "Discounted price must be less than regular price",
      },
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "At least one category is required"],
        validate: {
          validator: async function (ids: Types.ObjectId[]) {
            const count = await mongoose.models.Category.countDocuments({
              _id: { $in: ids },
            });
            return count === ids.length;
          },
          message: "One or more categories do not exist",
        },
      },
    ],
    images: [
      {
        url: { type: String, required: true },
        altText: { type: String },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    attributes: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ratings: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        value: {
          type: Number,
          required: true,
          min: [1, "Rating must be at least 1"],
          max: [5, "Rating cannot exceed 5"],
        },
        review: { type: String, maxlength: 500 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
ProductSchema.index({ name: "text", description: "text" });
ProductSchema.index({ categories: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ slug: 1 });

// Virtual for average rating
ProductSchema.virtual("averageRating").get(function (this: IProduct) {
  if (!this.ratings || this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, rating) => acc + rating.value, 0);
  return sum / this.ratings.length;
});

// Virtual for populated category details
ProductSchema.virtual("categoryDetails", {
  ref: "Category",
  localField: "categories",
  foreignField: "_id",
  justOne: false,
});

// Pre-save hooks
ProductSchema.pre<IProduct>("save", function (next) {
  // Generate slug if not exists or name changed
  if (!this.slug || this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

  // Generate SKU if not provided
  if (!this.sku) {
    const prefix = this.name.substring(0, 3).toUpperCase().replace(/\s+/g, "");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.sku = `${prefix}-${randomNum}`;
  }

  next();
});

// Always populate categories when querying
ProductSchema.pre(/^find/, function (this: mongoose.Query<any, any>, next) {
  this.populate({
    path: "categories",
    select: "name slug -_id", // Only include name and slug, exclude _id
  });
  next();
});

const Product: Model<IProduct> = mongoose.model<IProduct>("Product", ProductSchema);

export default Product;