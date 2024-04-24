import mongoose, { Document, Model } from "mongoose";

// Define the interface for the booking model
export interface IBooking extends Document {
  name: string;
  phoneNumber: string;
  email: string;
  companyName: string;
  productOfInterest: string;
  selectIntendedAdvertState: string;
  selectIntendedAdvertCity: string;
  budget: number;
  availableTiming: string;
  meetingMode: string;
}

// Define the schema for the booking model
const BookingSchema = new mongoose.Schema<IBooking>(
  {
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    companyName: { type: String, required: true },
    productOfInterest: { type: String, required: true },
    selectIntendedAdvertState: { type: String, required: true },
    selectIntendedAdvertCity: { type: String, required: true },
    budget: { type: Number, required: true },
    availableTiming: { type: String, required: true },
    meetingMode: { type: String, required: true },
  },
  { timestamps: true }
);

const BookingModel: Model<IBooking> = mongoose.model<IBooking>(
  "Booking",
  BookingSchema
);

export default BookingModel;
