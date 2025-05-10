import mongoose, { Document, Model, Schema } from "mongoose";

// Define the interface for the Product model
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  sku: string;
  stock: number;
  categories: string[];
  images: ProductImage[];
  attributes: ProductAttributes;
  ratings?: ProductRating[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductImage {
  url: string;
  altText?: string;
  isPrimary?: boolean;
}

interface ProductAttributes {
  [key: string]: string | number; // e.g., { color: 'red', size: 'XL', weight: 500 }
}

interface ProductRating {
  userId: mongoose.Types.ObjectId;
  value: number;
  review?: string;
  createdAt: Date;
}

// Define the schema for the Product model
const ProductSchema = new Schema<IProduct>(
  {
    name: { 
      type: String, 
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
      max: [1000000, 'Price cannot exceed 1,000,000']
    },
    discountedPrice: {
      type: Number,
      validate: {
        validator: function(this: IProduct, value: number) {
          return value < this.price;
        },
        message: 'Discounted price must be less than regular price'
      }
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    categories: [{
      type: String,
      required: [true, 'At least one category is required']
    }],
    images: [{
      url: { type: String, required: true },
      altText: { type: String },
      isPrimary: { type: Boolean, default: false }
    }],
    attributes: {
      type: Schema.Types.Mixed,
      default: {}
    },
    ratings: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      value: { 
        type: Number, 
        required: true,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
      },
      review: { type: String, maxlength: 500 },
      createdAt: { type: Date, default: Date.now }
    }],
    isFeatured: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ categories: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ isActive: 1 });

// Virtual for average rating
ProductSchema.virtual('averageRating').get(function(this: IProduct) {
  if (!this.ratings || this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, rating) => acc + rating.value, 0);
  return sum / this.ratings.length;
});

// Pre-save hook for SKU generation
ProductSchema.pre<IProduct>('save', function(next) {
  if (!this.sku) {
    // Generate a simple SKU if not provided
    const prefix = this.name.substring(0, 3).toUpperCase().replace(/\s+/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.sku = `${prefix}-${randomNum}`;
  }
  next();
});

const ProductModel: Model<IProduct> = mongoose.model<IProduct>(
  "Product",
  ProductSchema
);

export default ProductModel;