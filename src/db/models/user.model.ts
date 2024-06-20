import mongoose, { Document, Model } from "mongoose";

type AccountType = "Admin" | "User";

type authMethod = "Form" | "Google";

export interface IUser extends Document {
  firstname: string;
  lastname: string;
  email: string;
  userCustomId: string;

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

const UserSchema = new mongoose.Schema<IUser>(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    userCustomId: {
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
      enum: ["Admin", "User"],
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

const UserModel: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default UserModel;
