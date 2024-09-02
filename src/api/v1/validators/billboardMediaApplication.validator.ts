/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { validateRequestBody } from "../../../utils/zodHelpers";

// Define the validation schema for creating a MediaApplication
export const createMediaApplicationValidator = (payload: any) => {
  const schema = z.object({
    description: z.string({
      required_error: "Product Description is required.",
    }),
    mediaType: z.enum(["Static Billboard","Led Billboard","BRT Bus","Lampost"],{
      required_error: "Producy media type is required.",
    }),
    status: z.enum(["Available","Unavailbale"]).default("Available"),
    state: z.string({
      required_error: "state is required.",
    }),
    dimension: z.string({
      required_error: "Product dimension is required.",
    }),
    price: z.number({
      required_error: "Product price is required.",
    }), 
    cityLga: z.string({
      required_error: "Product city / lga is required"
    }),
    nextAvailable: z.string({
      required_error: "Product next available date is required"
    }),
    
    address: z.string().optional(),
    googleStreetlink: z.string().optional(),
    listingTitle: z.string().optional(),
    landmark: z.string().optional(),
    
    brtType: z.string().optional(),
    brtName: z.string().optional(),
    route: z.string().optional(),
    amountAvailable: z.string().optional(),
    
    createdByAdmin: z.string().optional(),
    vaad_id: z.string().optional(),
    mediaCustomId: z.string().optional(),
  });
  return validateRequestBody(schema, payload);
};

// Define the validation schema for updating a MediaApplication
export const updateMediaApplicationValidator = (payload: any) => {
  const schema = z.object({
    productName: z.string().optional(),
    productDescription: z.string().optional(),
    productAmountInStock: z.number().optional(),
    productCategory: z.string().optional(),
    productPrice: z.number().optional(),
    productKeyFeatures: z.string().optional(),
    productSize: z.array(z.string()).optional(),
    productColors: z.array(z.string()).optional(),
    productKeySpecifications: z.string().optional(),
    productImages: z.array(z.string()).optional(),
    productAdditionalInformation: z.string().optional(),
    productDiscountCode: z.string().optional(),
    productDiscountPercentage: z.number().optional(),
    isAvailable: z.boolean().optional(),
  });

  return validateRequestBody(schema, payload);
};

// Define the validation schema for updating a MediaApplication
export const deleteMediaApplicationValidator = (payload: any) => {
  const schema = z.object({
    productId: z.string({
      required_error: "Product id is required.",
    }),
    imageId: z.string({
      required_error: "image id to be deleted is required.",
    }),
  });

  return validateRequestBody(schema, payload);
};
