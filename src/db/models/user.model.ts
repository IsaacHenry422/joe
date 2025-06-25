//  import mongoose, { Document, Model } from "mongoose";

// type AccountType = "Admin" | "User" | "Seller";
// type AuthMethod = "Form" | "Google";

// // SellerInfo interface
// export interface ISellerInfo {
//   isPremium: boolean;
//   premiumType: "monthly" | "yearly" | null;
//   salesCount: number;
// }

// // User interface extending mongoose Document
// export interface IUser extends Document {
//   fullname: string;
//   email: string;
//   customId: string;

//   authType: {
//     password?: string;
//     googleUuid?: string;
//   };
//   authMethod: AuthMethod;
//   accountType: AccountType;
//   profilePicture?: string;

//   isVerified: boolean;
//   emailConfirmation?: {
//     emailConfirmationToken?: string;
//     emailConfirmationTokenExpiresAt?: Date;
//   };
//   phoneNumber?: string;
//   dateOfBirth?: string;
//   country?: string;
//   city?: string;
//   address?: string;

//   isAdmin: boolean;
//   finishTourGuide: boolean;
//   passwordRecovery?: {
//     passwordRecoveryOtp?: string;
//     passwordRecoveryOtpExpiresAt?: Date;
//   };
//   refreshToken?: string;
//   deletedAt?: boolean;

//   sellerInfo?: ISellerInfo;
// }

// // Define the SellerInfo sub-schema
// const SellerInfoSchema = new mongoose.Schema<ISellerInfo>(
//   {
//     isPremium: { type: Boolean, default: false },
//     premiumType: { type: String, enum: ["monthly", "yearly", null], default: null },
//     salesCount: { type: Number, default: 0 },
//   },
//   { _id: false }
// );

// // Define the main User schema
// const UserSchema = new mongoose.Schema<IUser>(
//   {
//     fullname: {
//       type: String,
//       required: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     customId: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     authType: {
//       password: {
//         type: String,
//       },
//       googleUuid: {
//         type: String,
//       },
//     },
//     authMethod: {
//       type: String,
//       required: true,
//       enum: ["Form", "Google"],
//     },
//     accountType: {
//       type: String,
//       required: true,
//       enum: ["Admin", "User", "Seller"],
//     },
//     profilePicture: {
//       type: String,
//       default:
//         "https://res.cloudinary.com/duzrrmfci/image/upload/v1703842924/logo.jpg",
//     },
//     isVerified: {
//       type: Boolean,
//       required: true,
//     },
//     emailConfirmation: {
//       emailConfirmationToken: {
//         type: String,
//       },
//       emailConfirmationTokenExpiresAt: {
//         type: Date,
//       },
//     },
//     phoneNumber: {
//       type: String,
//     },
//     dateOfBirth: {
//       type: String,
//     },
//     country: {
//       type: String,
//     },
//     city: {
//       type: String,
//     },
//     address: {
//       type: String,
//     },
//     isAdmin: {
//       type: Boolean,
//       default: false,
//     },
//     finishTourGuide: {
//       type: Boolean,
//       default: false,
//     },
//     passwordRecovery: {
//       passwordRecoveryOtp: {
//         type: String,
//       },
//       passwordRecoveryOtpExpiresAt: {
//         type: Date,
//       },
//     },
//     refreshToken: {
//       type: String,
//     },
//     deletedAt: {
//       type: Boolean,
//     },

//     // Embed sellerInfo sub-schema (optional)
//     sellerInfo: { type: SellerInfoSchema, default: undefined },
//   },
//   { timestamps: true }
// );

// const UserModel: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

// export default UserModel;
import mongoose, { Document, Model } from "mongoose";

type AccountType = "Admin" | "User" | "Seller" | "Premium";
type AuthMethod = "Form" | "Google";

// SellerInfo interface
export interface ISellerInfo {
  isPremium: boolean;
  premiumType: "monthly" | "yearly" | null;
  salesCount: number;
}

// User interface extending mongoose Document
export interface IUser extends Document {
  fullname: string;
  email: string;
  customId: string;

  authType: {
    password?: string;
    googleUuid?: string;
  };
  authMethod: AuthMethod;
  accountType: AccountType;
  profilePicture?: string;

  isVerified: boolean;
  emailConfirmation?: {
    emailConfirmationToken?: string;
    emailConfirmationTokenExpiresAt?: Date;
  };
  phoneNumber?: string;
  dateOfBirth?: string;
  country?: string;
  city?: string;
  address?: string;

  isAdmin: boolean;
  finishTourGuide: boolean;
  passwordRecovery?: {
    passwordRecoveryOtp?: string;
    passwordRecoveryOtpExpiresAt?: Date;
  };
  refreshToken?: string;
  deletedAt?: boolean;

  sellerInfo?: ISellerInfo;

  createdAt?: Date;    // Add timestamps to interface
  updatedAt?: Date;
}

// Define the SellerInfo sub-schema
const SellerInfoSchema = new mongoose.Schema<ISellerInfo>(
  {
    isPremium: { type: Boolean, default: false },
    premiumType: { type: String, enum: ["monthly", "yearly", null], default: null },
    salesCount: { type: Number, default: 0 },
  },
  { _id: false }
);

// Define the main User schema
const UserSchema = new mongoose.Schema<IUser>(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    customId: {
      type: String,
      required: true,
      unique: true,
    },
    authType: {
      password: {
        type: String,
      },
      googleUuid: {
        type: String,
      },
    },
    authMethod: {
      type: String,
      required: true,
      enum: ["Form", "Google"],
    },
    accountType: {
      type: String,
      required: true,
      enum: ["Admin", "User", "Seller", "Premium"],  // Include "Premium"
    },
    profilePicture: {
      type: String,
      default:
        "https://res.cloudinary.com/duzrrmfci/image/upload/v1703842924/logo.jpg",
    },
    isVerified: {
      type: Boolean,
      required: true,
    },
    emailConfirmation: {
      emailConfirmationToken: {
        type: String,
      },
      emailConfirmationTokenExpiresAt: {
        type: Date,
      },
    },
    phoneNumber: {
      type: String,
    },
    dateOfBirth: {
      type: String,
    },
    country: {
      type: String,
    },
    city: {
      type: String,
    },
    address: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    finishTourGuide: {
      type: Boolean,
      default: false,
    },
    passwordRecovery: {
      passwordRecoveryOtp: {
        type: String,
      },
      passwordRecoveryOtpExpiresAt: {
        type: Date,
      },
    },
    refreshToken: {
      type: String,
    },
    deletedAt: {
      type: Boolean,
    },

    // Embed sellerInfo sub-schema (optional)
    sellerInfo: { type: SellerInfoSchema, default: undefined },
  },
  { timestamps: true }
);

const UserModel: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default UserModel;

