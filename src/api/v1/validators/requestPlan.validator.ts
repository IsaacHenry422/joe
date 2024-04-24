/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { validateRequestBody } from "../../../utils/zodHelpers";
export const createRequestPlanValidator = (payload: any) => {
  const schema = z.object({
    name: z.string({ required_error: "Name is required." }),
    phoneNumber: z.string({ required_error: "Phone number is required." }),
    email: z.string({ required_error: "Email is required." }).email({
      message: "Invalid email format.",
    }),
    companyName: z.string({ required_error: "Company name is required." }),
    companyAddress: z.string({
      required_error: "Company address is required.",
    }),
    state: z.string({ required_error: "State is required." }),
    derivedCustomerAction: z.string({
      required_error: "Derived customer action is required.",
    }),
    intendedTargetAudience: z.string({
      required_error: "Intended target audience is required.",
    }),
    intendedDeliverable: z.string({
      required_error: "Intended deliverable is required.",
    }),
    keyCampaignTiming: z.string({
      required_error: "Key campaign timing is required.",
    }),
    campaignObjectives: z.string({
      required_error: "Campaign objectives is required.",
    }),
    scopeOfIntendedCampaign: z.string({
      required_error: "Scope of intended campaign is required.",
    }),
  });

  return validateRequestBody(schema, payload);
};

export const updateRequestPlanValidator = (payload: any) => {
  const schema = z.object({
    name: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().email({ message: "Invalid email format." }).optional(),
    companyName: z.string().optional(),
    companyAddress: z.string().optional(),
    state: z.string().optional(),
    derivedCustomerAction: z.string().optional(),
    intendedTargetAudience: z.string().optional(),
    intendedDeliverable: z.string().optional(),
    keyCampaignTiming: z.string().optional(),
    campaignObjectives: z.string().optional(),
    scopeOfIntendedCampaign: z.string().optional(),
  });

  return validateRequestBody(schema, payload);
};
