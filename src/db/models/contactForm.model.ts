import mongoose, { Document, Model } from "mongoose";

// Define the interface for the contact model
export interface IContact extends Document {
  name: string;
  phoneNumber: string;
  email: string;
  message: string;
}

// Define the schema for the contact model
const ContactSchema = new mongoose.Schema<IContact>(
  {
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const ContactModel: Model<IContact> = mongoose.model<IContact>(
  "Contact",
  ContactSchema
);

export default ContactModel;
