import mongoose, { Document, Model } from "mongoose";

type AccountType = "Admin" | "User";
type AdminType = "Super-Admin" | "Sub-Admin";

export interface IAdmin extends Document {
  firstname: string;
  lastname: string;
  email: string;
  adminCustomId: string;
  password: string;
  phoneNumber: string;
  accountType: AccountType;
  adminType: AdminType;
  role?: string;

  profilePicture?: string;
  isAdmin: boolean;
  refreshToken?: string;
  deletedAt?: boolean;
}

const AdminSchema = new mongoose.Schema<IAdmin>(
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
    adminCustomId: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
    },
    accountType: {
      type: String,
      required: true,
      enum: ["Admin", "User"],
    },
    adminType: {
      type: String,
      required: true,
      enum: ["Super-Admin", "Sub-Admin"],
    },
    role: {
      type: String,
    },
    profilePicture: {
      type: String,
      default:
        "https://res.cloudinary.com/duzrrmfci/image/upload/v1703842924/logo.jpg",
    },
    isAdmin: {
      type: Boolean,
      default: false,
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

const AdminModel: Model<IAdmin> = mongoose.model<IAdmin>("Admin", AdminSchema);

export default AdminModel;
