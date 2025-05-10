import mongoose, { Document, Model } from "mongoose";

type AccountType = "Admin" | "User" | "Seller";
type authMethod = "Form" | "Google";

export interface ISeller extends Document {
  fullname: string;
  email: string;
  customId: string;

  authType: {
    password?: string;
    googleUuid?: string;
  };
  authMethod: authMethod;
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
}

const SellerSchema = new mongoose.Schema<ISeller>(
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
      enum: ["Admin", "User", "Seller"],
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
  },
  { timestamps: true }
);

const SellerModel: Model<ISeller> = mongoose.model<ISeller>("Seller", SellerSchema);

export default SellerModel;
