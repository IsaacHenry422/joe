import mongoose, { Document, Model } from "mongoose";

// Define the interface for the order document
export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  orderCustomId: string;
  amount: {
    subTotal: number;
    vat: number;
    delivery: number;
    totalAmount: number;
  };
  paymentStatus: string;
  paymentMethod: string;
  paymentType: string;
  orderItem: {
    orderSubRef: string;
    orderType: "Billboard" | "Print";
    quantity: number;
    price: number;
    subtotal: number;
    orderStatus: string;

    billboardId?: mongoose.Types.ObjectId;
    duration?: {
      startDate?: Date;
      endDate?: Date;
      totalDuration?: number;
    };
    route?: string;

    printId?: mongoose.Types.ObjectId;
    deliveryMethod?: "Delivery" | "Home delivery" | "Pickup";
    deliveryAddress?: string;
    height?: string;
    width?: string;
    finishingDetails?: object;
    additionalPrintDesc?: string;
    designFile?: string;

    // billboard property to the order interface
    billboard?: {
      _id: mongoose.Types.ObjectId;
      mediaCustomId: string;
      vaad_id: string;
      listingTitle: string;
      price: number;
      pictures: Array<object>;
      description?: string;
      address?: string;
    };
    // print property to the order interface
    print?: {
      _id: mongoose.Types.ObjectId;
      mediaCustomId: string;
      name: string;
      price: number;
      pictures: Array<object>;
      description?: string;
      features?: Array<string>;
    };
  }[];
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  // customer property to the order interface
  customer: {
    _id: mongoose.Types.ObjectId;
    userCustomId: string;
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber?: string;
  };
}

// Define the order schema
const OrderSchema = new mongoose.Schema<IOrder>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the user schema
      required: true,
    },
    orderCustomId: {
      type: String,
      required: true,
      unique: true,
    },

    amount: {
      subTotal: {
        type: Number,
        required: true,
      },
      vat: {
        type: Number,
        required: true,
      },
      delivery: {
        type: Number,
        required: true,
      },
      totalAmount: {
        type: Number,
        required: true,
      },
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Failed", "Success"],
      required: true,
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Paystack"],
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["Pay Now", "Pay Later"],
      required: true,
    },

    orderItem: [
      {
        orderSubRef: {
          type: String,
          required: true,
        },
        orderType: {
          type: String,
          required: true,
          enum: ["Billboard", "Print"],
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        subtotal: {
          type: Number,
          required: true,
        },
        orderStatus: {
          type: String,
          enum: [
            "Pending",
            "Expired",
            "Cancelled",

            //billboard
            "Awaiting Confirmation",
            "In progress",
            "Completed",
            //print
            "Awaiting Shipment",
            "Shipped",
            "Out for Delivery",
            "Delivered",
          ],
          default: "Pending",
        },

        //billboard
        billboardId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "billboardMediaApplication",
        },
        duration: {
          startDate: {
            type: Date,
          },
          endDate: {
            type: Date,
          },
          totalDuration: {
            type: Number,
          },
        },
        route: {
          type: String,
        },

        //print
        printId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "printMediaApplication",
        },
        deliveryMethod: {
          type: String,
          enum: ["Delivery", "Home delivery", "Pickup"],
        },
        deliveryAddress: {
          type: String,
        },
        height: {
          type: String,
        },
        width: {
          type: String,
        },
        finishingDetails: {
          eyelets: Boolean,
          pocketTB: Boolean,
          pocketLR: Boolean,
          none: Boolean,
        },
        additionalPrintDesc: {
          type: String,
        },
        designFile: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

// Define the order model
const OrderModel: Model<IOrder> = mongoose.model<IOrder>("Order", OrderSchema);

export default OrderModel;
