/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { validateRequestBody } from "../../../utils/zodHelpers";

export const createFavouritesValidator = (payload: any) => {
  const schema = z.object({
    id: z.string({ required_error: "id is required." }),
    type: z.enum(["media", "print"], {
      required_error: "type is required.",
    }),
  });

  return validateRequestBody(schema, payload);
};
