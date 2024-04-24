import mongoose, { Document, Model } from "mongoose";

// Define the interface for the requestPlan model
export interface IRequestPlan extends Document {
  name: string;
  phoneNumber: string;
  email: string;
  companyName: string;
  companyAddress: string;
  state: string;
  derivedCustomerAction: string;
  intendedTargetAudience: string;
  intendedDeliverable: string;
  keyCampaignTiming: string;
  campaignObjectives: string;
  scopeOfIntendedCampaign: string;
}

// Define the schema for the requestPlan model
const RequestPlanSchema = new mongoose.Schema<IRequestPlan>(
  {
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    companyName: { type: String, required: true },
    companyAddress: { type: String, required: true },
    state: { type: String, required: true },
    derivedCustomerAction: { type: String, required: true },
    intendedTargetAudience: { type: String, required: true },
    intendedDeliverable: { type: String, required: true },
    keyCampaignTiming: { type: String, required: true },
    campaignObjectives: { type: String, required: true },
    scopeOfIntendedCampaign: { type: String, required: true },
  },
  { timestamps: true }
);

const RequestPlanModel: Model<IRequestPlan> = mongoose.model<IRequestPlan>(
  "RequestPlan",
  RequestPlanSchema
);

export default RequestPlanModel;
