/* eslint-disable @typescript-eslint/no-explicit-any */
import dotenv from "dotenv";
dotenv.config();
import User, { IUser } from "../db/models/user.model";
import Admin, { IAdmin } from "../db/models/admin.model";

import jwt from "jsonwebtoken";

import { Unauthorized } from "../errors/httpErrors";

// interface AccountDetails {
//   _id: string;
// }
type AccountDetails = IUser | IAdmin;

const generateAuthToken = async (
  accountDetails: AccountDetails,
  accountType: "User" | "Admin"
) => {
  try {
    let payload, accessToken, refreshToken;

    if (accountType === "User") {
      payload = { userId: accountDetails._id };
      accessToken = jwt.sign(payload, process.env.JWT_SEC!, {
        expiresIn: "24h",
      });

      refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN!, {
        expiresIn: "7d",
      });

      await User.findOneAndUpdate(
        { _id: accountDetails._id },
        { refreshToken, updatedAt: new Date() },
        { new: true }
      );
    } else if (accountType === "Admin") {
      payload = { adminId: accountDetails._id };
      accessToken = jwt.sign(payload, process.env.JWT_SEC!, {
        expiresIn: "1h",
      });
      refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN!, {
        expiresIn: "1d",
      });

      await Admin.findOneAndUpdate(
        { _id: accountDetails._id },
        { refreshToken, updatedAt: new Date() },
        { new: true }
      );
    } else {
      throw new Error("Invalid type provided");
    }

    return { accessToken, refreshToken };
  } catch (error: any) {
    throw new Unauthorized(error.message, "INVALID_TOKEN");
  }
};

const verifyRefreshToken = async (
  refreshToken: string,
  accountType: "User" | "Admin"
) => {
  const privateKey = process.env.REFRESH_TOKEN!;

  try {
    let doc;

    if (accountType === "User") {
      doc = await User.findOne({ refreshToken });
    } else if (accountType === "Admin") {
      doc = await Admin.findOne({ refreshToken });
    } else {
      throw new Error("Invalid account type provided");
    }

    if (!doc) {
      throw new Error("Invalid refresh token");
    }

    const tokenDetails = await new Promise((resolve, reject) => {
      jwt.verify(
        refreshToken,
        privateKey,
        (err: jwt.VerifyErrors | null, tokenDetails: any) => {
          if (err) {
            reject(new Error("Invalid refresh token"));
          } else {
            resolve(tokenDetails);
          }
        }
      );
    });

    return {
      tokenDetails,
      error: false,
      message: "Valid refresh token",
    };
  } catch (error: any) {
    throw new Unauthorized(error.message, "INVALID_TOKEN");
  }
};

export { generateAuthToken, verifyRefreshToken };
