import mongoose, { Schema, Document, Types } from 'mongoose';

// Cart item interface
export interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
  priceAtAdd?: number; // Store price at time of adding to cart (optional)
  addedAt?: Date;
}

// Cart interface
export interface ICart extends Document {
  user: Types.ObjectId;
  items: ICartItem[];
  status: 'active' | 'ordered' | 'abandoned';
  updatedAt: Date;
  createdAt: Date;
}

// Cart item schema
const cartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    priceAtAdd: { type: Number },
    addedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

// Cart schema
const cartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: { type: [cartItemSchema], default: [] },
    status: { type: String, enum: ['active', 'ordered', 'abandoned'], default: 'active' }
  },
  { timestamps: true }
);

// Optional: Add a method to calculate total price
cartSchema.methods.getTotal = function () {
  return this.items.reduce((sum: number, item: ICartItem) => {
    return sum + (item.priceAtAdd || 0) * item.quantity;
  }, 0);
};

export const Cart = mongoose.model<ICart>('Cart', cartSchema);