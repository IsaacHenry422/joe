/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { validateRequestBody } from "../../../utils/zodHelpers";

// eslint-disable-next-line
export const createUserValidator = (payload: any) => {
  const schema = z.object({
    firstname: z.string({
      required_error: "First name is required.",
    }),
    lastname: z.string({
      required_error: "Last name is required.",
    }),
    email: z
      .string({
        required_error: "Email is required.",
        invalid_type_error: "Please provide a valid email.",
      })
      .email("Please provide a valid email address")
      .toLowerCase(),
    password: z
      .string({
        required_error: "Password is required.",
      })
      .min(8, "Password must be minimum of 8 characters."),
  });

  return validateRequestBody(schema, payload);
};

// eslint-disable-next-line
export const loginValidator = (payload: any) => {
  const schema = z.object({
    email: z
      .string({
        required_error: "Email is required.",
        invalid_type_error: "Please provide a valid email.",
      })
      .email("Please provide a valid email address")
      .toLowerCase(),
    password: z
      .string({
        required_error: "Password is required.",
      })
      .min(8, "Password must be minimum of 8 characters."),
  });

  return validateRequestBody(schema, payload);
};

// eslint-disable-next-line
export const createAdminValidator = (payload: any) => {
  const schema = z.object({
    firstname: z.string({
      required_error: "username is required.",
    }),
    lastname: z.string({
      required_error: "username is required.",
    }),
    email: z
      .string({
        required_error: "email is required.",
        invalid_type_error: "Please provide a valid email",
      })
      .email("Please provide a valid email address")
      .toLowerCase(),
    password: z
      .string({
        required_error: "email is required",
      })
      .min(8, "Password must be minimum of 8 characters."),
    adminType: z.enum(["Super-Admin", "Sub-Admin"], {
      required_error: "Admin Type is required.",
    }),
  });

  return validateRequestBody(schema, payload);
};

// eslint-disable-next-line
export const adminValidator = (payload: any) => {
  const schema = z.object({
    email: z
      .string({
        required_error: "Email is required.",
        invalid_type_error: "Please provide a valid email.",
      })
      .email("Please provide a valid email address")
      .toLowerCase(),
    password: z
      .string({
        required_error: "Password is required.",
      })
      .min(8, "Password must be minimum of 8 characters."),
  });

  return validateRequestBody(schema, payload);
};

export const oauthValidator = (payload: any) => {
  const schema = z.object({
    code: z.string({
      required_error: "code is required.",
    }),
  });

  return validateRequestBody(schema, payload);
};

export const resetTokenValidator = (payload: any) => {
  const schema = z.object({
    email: z
      .string({
        required_error: "Email is required.",
        invalid_type_error: "Please provide a valid email.",
      })
      .email("Please provide a valid email address")
      .toLowerCase(),
  });

  return validateRequestBody(schema, payload);
};

export const verifyTokenValidator = (payload: any) => {
  const schema = z.object({
    otp: z.string({
      required_error: "Otp is required.",
    }),
  });

  return validateRequestBody(schema, payload);
};

export const verifyUserOtpAndChangePasswordValidator = (payload: any) => {
  const schema = z.object({
    otp: z.string({
      required_error: "Otp is required.",
    }),
    newPassword: z.string({
      required_error: "new Password is required.",
    }),
  });

  return validateRequestBody(schema, payload);
};

export const tokenValidator = (payload: any) => {
  const schema = z.object({
    refreshToken: z.string({
      required_error: "Refresh Token is required.",
    }),
    accountType: z.enum(["User", "Admin"], {
      required_error: "Account Type is required.",
    }),
  });

  return validateRequestBody(schema, payload);
};

//profile
export const updateUserValidator = (payload: any) => {
  const schema = z.object({
    firstname: z.string().optional(),
    lastname: z.string().optional(),
    phoneNumber: z.string().optional(),
    dateOfBirth: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    finishTourGuide: z.boolean().optional(),
  });

  return validateRequestBody(schema, payload);
};

export const updateAdminValidator = (payload: any) => {
  const schema = z.object({
    firstname: z.string().optional(),
    lastname: z.string().optional(),
    phoneNumber: z.string().optional(),
    role: z.string().optional(),
  });

  return validateRequestBody(schema, payload);
};

export const changePasswordValidator = (payload: any) => {
  const schema = z.object({
    oldPassword: z.string({
      required_error: "new Password is required.",
    }),
    newPassword: z.string({
      required_error: "new Password is required.",
    }),
  });

  return validateRequestBody(schema, payload);
};

export const blockUserValidator = (payload: any) => {
  const schema = z.object({
    userId: z.string({
      required_error: "User id is required.",
    }),
    blockDecision: z.boolean({
      required_error: "Block decision is required.",
    }),
  });

  return validateRequestBody(schema, payload);
};

export const blockAdminValidator = (payload: any) => {
  const schema = z.object({
    adminId: z.string({
      required_error: "Admin id is required.",
    }),
    blockDecision: z.boolean({
      required_error: "Block decision is required.",
    }),
  });

  return validateRequestBody(schema, payload);
};
