//  import { NextFunction, Request, Response } from "express";
// import dotenv from "dotenv";
// dotenv.config();

// import {
//   BadRequest,
//   ResourceNotFound,
//   Forbidden,
//   Unauthorized,
// } from "../../../errors/httpErrors";

// import User from "../../../db/models/user.model";
// import bcrypt from "bcrypt";
// import { promises as fsPromises } from "fs";
// import path from "path";
// import { uploadPicture } from "../../../services/file.service";
// import {
//   getLimit,
//   getPage,
//   getStartDate,
//   getEndDate,
// } from "../../../utils/dataFilters";
// import { userFields } from "../../../utils/fieldHelpers";
// import * as validators from "../validators/auth.validator";
// import { successChangedPasswordEmail } from "../../../services/email.service";

// type QueryParams = {
//   startDate?: Date;
//   endDate?: Date;
//   limit?: string;
//   page?: string;
// };

// const awsBaseUrl = process.env.AWS_BASEURL;

// class UserController {
//   // ✅ Fix: Properly defined upgradeToPremium middleware
//   async upgradeToPremium(req: Request, res: Response, next: NextFunction) {
//     try {
//       const userId = req.loggedInAccount._id;

//       const user = await User.findById(userId);
//       if (!user) {
//         throw new ResourceNotFound("User not found.", "RESOURCE_NOT_FOUND");
//       }

//       if (user.accountType === "premium") {
//         throw new BadRequest("User is already a premium member.", "BAD_REQUEST");
//       }

//       user.accountType = "premium";
//       user.updatedAt = new Date();

//       await user.save();

//       res.ok({
//         message: "Your account has been successfully upgraded to premium.",
//         user,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   async getUsers(req: Request, res: Response) {
//     const queryParams: QueryParams = req.query;
//     const startDate = getStartDate(queryParams.startDate);
//     const endDate = getEndDate(queryParams.endDate);
//     const limit = getLimit(queryParams.limit);
//     const page = getPage(queryParams.page);

//     const query = User.find({
//       createdAt: { $gte: startDate, $lte: endDate },
//     })
//       .sort({ createdAt: 1 })
//       .limit(limit)
//       .skip(limit * (page - 1));

//     const totalUsers = await User.countDocuments(query);
//     const mappedUsers = await query.select(userFields.join(" "));

//     res.ok(
//       { users: mappedUsers, totalUsers },
//       { page, limit, startDate, endDate }
//     );
//   }

//   async getUserById(req: Request, res: Response) {
//     const { userId } = req.params;
//     if (!userId) {
//       throw new ResourceNotFound("userId is missing.", "RESOURCE_NOT_FOUND");
//     }

//     const user = await User.findById(userId).select(userFields.join(" "));
//     if (!user) {
//       throw new ResourceNotFound(
//         `User with ID ${userId} not found.`,
//         "RESOURCE_NOT_FOUND"
//       );
//     }

//     res.ok(user);
//   }

//   async updateUser(req: Request, res: Response) {
//     const userId = req.loggedInAccount._id;

//     const { error, data } = validators.updateUserValidator(req.body);
//     if (error) throw new BadRequest(error.message, error.code);

//     const user = await User.findByIdAndUpdate(
//       userId,
//       { ...data, updatedAt: new Date() },
//       { new: true }
//     ).select(userFields.join(" "));

//     if (!user) {
//       throw new BadRequest(
//         `User ${user!.customId} not updated.`,
//         "INVALID_REQUEST_PARAMETERS"
//       );
//     }

//     res.ok({
//       updated: user,
//       message: "Your details are updated successfully.",
//     });
//   }

//   async blockUser(req: Request, res: Response) {
//     const { error, data } = validators.blockUserValidator(req.body);
//     if (error) throw new BadRequest(error.message, error.code);
//     const { userId, blockDecision } = data;

//     await User.findByIdAndUpdate(userId, {
//       deletedAt: blockDecision,
//       updatedAt: new Date(),
//     });

//     return res.ok({
//       message: blockDecision
//         ? "User has been blacklisted, and won't be able to login again"
//         : "Blacklist restriction removed, User access restored",
//     });
//   }

//   async formUserUpdatePassword(req: Request, res: Response) {
//     const userId = req.loggedInAccount._id;

//     const { error, data } = validators.changePasswordValidator(req.body);
//     if (error) throw new BadRequest(error.message, error.code);
//     const { oldPassword, newPassword } = data;

//     const user = await User.findById(userId);
//     if (!user)
//       throw new ResourceNotFound("User not found", "RESOURCE_NOT_FOUND");

//     if (user.authMethod !== "Form") {
//       throw new Forbidden(
//         "Cannot change password for non-form authentication method.",
//         "INSUFFICIENT_PERMISSIONS"
//       );
//     }

//     const hashedPassword = user.authType?.password;

//     if (hashedPassword !== undefined) {
//       const isPasswordValid = bcrypt.compareSync(oldPassword, hashedPassword);
//       if (!isPasswordValid) {
//         throw new Unauthorized("Invalid old password.", "INVALID_PASSWORD");
//       }
//     } else {
//       throw new Forbidden(
//         "You have no password set; please sign in with a third-party provider, e.g. Google.",
//         "ACCESS_DENIED"
//       );
//     }

//     const hash = await bcrypt.hash(newPassword, 10);
//     await User.findByIdAndUpdate(userId, {
//       "authType.password": hash,
//       updatedAt: new Date(),
//     });

//     await successChangedPasswordEmail(user.email, user.fullname);

//     return res.ok({
//       message: "Password successfully changed",
//     });
//   }

//   async updateUserDp(req: Request, res: Response) {
//     const userId = req.loggedInAccount._id;
//     const profilePicture = req.file;

//     if (!profilePicture) {
//       throw new BadRequest(
//         "No profile picture provided.",
//         "MISSING_REQUIRED_FIELD"
//       );
//     }

//     const uploadedFile = profilePicture as Express.Multer.File;

//     const profilePictureExtension = path.extname(uploadedFile.originalname);
//     const profilePictureKey = await uploadPicture(
//       uploadedFile.path,
//       "user-profile",
//       profilePictureExtension
//     );
//     await fsPromises.unlink(uploadedFile.path);

//     const key = `${awsBaseUrl}/${profilePictureKey}`;
//     const user = await User.findByIdAndUpdate(
//       userId,
//       { profilePicture: key, updatedAt: new Date() },
//       { new: true }
//     ).select(userFields.join(" "));

//     if (!user) {
//       throw new ResourceNotFound(
//         `User ${userId} not found.`,
//         "RESOURCE_NOT_FOUND"
//       );
//     }

//     res.ok({
//       updated: user,
//       message: "User picture uploaded successfully.",
//     });
//   }
// }

// // export default new UserController();
// import { NextFunction, Request, Response } from "express";
// import dotenv from "dotenv";
// dotenv.config();

// import {
//   BadRequest,
//   ResourceNotFound,
//   Forbidden,
//   Unauthorized,
// } from "../../../errors/httpErrors";

// import User from "../../../db/models/user.model";
// import bcrypt from "bcrypt";
// import { promises as fsPromises } from "fs";
// import path from "path";
// import { uploadPicture } from "../../../services/file.service";
// import {
//   getLimit,
//   getPage,
//   getStartDate,
//   getEndDate,
// } from "../../../utils/dataFilters";
// import { userFields } from "../../../utils/fieldHelpers";
// import * as validators from "../validators/auth.validator";
// import { successChangedPasswordEmail } from "../../../services/email.service";

// type QueryParams = {
//   startDate?: Date;
//   endDate?: Date;
//   limit?: string;
//   page?: string;
// };

// const awsBaseUrl = process.env.AWS_BASEURL;

// class UserController {
//   // Upgrade user to premium
//   async upgradeToPremium(req: Request, res: Response, next: NextFunction) {
//     try {
//       const userId = req.loggedInAccount._id;

//       const user = await User.findById(userId);
//       if (!user) {
//         throw new ResourceNotFound("User not found.", "RESOURCE_NOT_FOUND");
//       }

//       // Only Sellers can upgrade to premium
//       if (user.accountType !== "Seller") {
//         throw new Forbidden(
//           "Only sellers can upgrade to premium.",
//           "INSUFFICIENT_PERMISSIONS"
//         );
//       }

//       if (user.sellerInfo?.isPremium) {
//         throw new BadRequest("User is already a premium member.", BadRequest.CODE);
//       }

//       // Initialize sellerInfo if not present
//       if (!user.sellerInfo) {
//         user.sellerInfo = {
//           isPremium: true,
//           premiumType: "monthly", // or use req.body.premiumType if you want dynamic
//           salesCount: 0,
//         };
//       } else {
//         user.sellerInfo.isPremium = true;
//         user.sellerInfo.premiumType = "monthly"; // or dynamic
//       }

//       await user.save();

//       res.ok({
//         message: "Your account has been successfully upgraded to premium.",
//         user,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   async getUsers(req: Request, res: Response) {
//     const queryParams: QueryParams = req.query;
//     const startDate = getStartDate(queryParams.startDate);
//     const endDate = getEndDate(queryParams.endDate);
//     const limit = getLimit(queryParams.limit);
//     const page = getPage(queryParams.page);

//     const query = User.find({
//       createdAt: { $gte: startDate, $lte: endDate },
//     })
//       .sort({ createdAt: 1 })
//       .limit(limit)
//       .skip(limit * (page - 1));

//     const totalUsers = await User.countDocuments({
//       createdAt: { $gte: startDate, $lte: endDate },
//     });
//     const mappedUsers = await query.select(userFields.join(" "));

//     res.ok(
//       { users: mappedUsers, totalUsers },
//       { page, limit, startDate, endDate }
//     );
//   }

//   async getUserById(req: Request, res: Response) {
//     const { userId } = req.params;
//     if (!userId) {
//       throw new ResourceNotFound("userId is missing.", "RESOURCE_NOT_FOUND");
//     }

//     const user = await User.findById(userId).select(userFields.join(" "));
//     if (!user) {
//       throw new ResourceNotFound(
//         `User with ID ${userId} not found.`,
//         "RESOURCE_NOT_FOUND"
//       );
//     }

//     res.ok(user);
//   }

//   async updateUser(req: Request, res: Response) {
//     const userId = req.loggedInAccount._id;

//     const { error, data } = validators.updateUserValidator(req.body);
//     if (error) throw new BadRequest(error.message, error.code);

//     const user = await User.findByIdAndUpdate(
//       userId,
//       { ...data },
//       { new: true }
//     ).select(userFields.join(" "));

//     if (!user) {
//       throw new BadRequest(
//         `User ${userId} not updated.`,
//         "INVALID_REQUEST_PARAMETERS"
//       );
//     }

//     res.ok({
//       updated: user,
//       message: "Your details are updated successfully.",
//     });
//   }

//   async blockUser(req: Request, res: Response) {
//     const { error, data } = validators.blockUserValidator(req.body);
//     if (error) throw new BadRequest(error.message, error.code);
//     const { userId, blockDecision } = data;

//     await User.findByIdAndUpdate(userId, {
//       deletedAt: blockDecision,
//       updatedAt: new Date(),
//     });

//     return res.ok({
//       message: blockDecision
//         ? "User has been blacklisted, and won't be able to login again"
//         : "Blacklist restriction removed, User access restored",
//     });
//   }

//   async formUserUpdatePassword(req: Request, res: Response) {
//     const userId = req.loggedInAccount._id;

//     const { error, data } = validators.changePasswordValidator(req.body);
//     if (error) throw new BadRequest(error.message, error.code);
//     const { oldPassword, newPassword } = data;

//     const user = await User.findById(userId);
//     if (!user)
//       throw new ResourceNotFound("User not found", "RESOURCE_NOT_FOUND");

//     if (user.authMethod !== "Form") {
//       throw new Forbidden(
//         "Cannot change password for non-form authentication method.",
//         "INSUFFICIENT_PERMISSIONS"
//       );
//     }

//     const hashedPassword = user.authType?.password;

//     if (hashedPassword !== undefined) {
//       const isPasswordValid = bcrypt.compareSync(oldPassword, hashedPassword);
//       if (!isPasswordValid) {
//         throw new Unauthorized("Invalid old password.", "INVALID_PASSWORD");
//       }
//     } else {
//       throw new Forbidden(
//         "You have no password set; please sign in with a third-party provider, e.g. Google.",
//         "ACCESS_DENIED"
//       );
//     }

//     const hash = await bcrypt.hash(newPassword, 10);
//     await User.findByIdAndUpdate(userId, {
//       "authType.password": hash,
//       updatedAt: new Date(),
//     });

//     await successChangedPasswordEmail(user.email, user.fullname);

//     return res.ok({
//       message: "Password successfully changed",
//     });
//   }

//   async updateUserDp(req: Request, res: Response) {
//     const userId = req.loggedInAccount._id;
//     const profilePicture = req.file;

//     if (!profilePicture) {
//       throw new BadRequest(
//         "No profile picture provided.",
//         "MISSING_REQUIRED_FIELD"
//       );
//     }

//     const uploadedFile = profilePicture as Express.Multer.File;

//     const profilePictureExtension = path.extname(uploadedFile.originalname);
//     const profilePictureKey = await uploadPicture(
//       uploadedFile.path,
//       "user-profile",
//       profilePictureExtension
//     );
//     await fsPromises.unlink(uploadedFile.path);

//     const key = `${awsBaseUrl}/${profilePictureKey}`;
//     const user = await User.findByIdAndUpdate(
//       userId,
//       { profilePicture: key, updatedAt: new Date() },
//       { new: true }
//     ).select(userFields.join(" "));

//     if (!user) {
//       throw new ResourceNotFound(
//         `User ${userId} not found.`,
//         "RESOURCE_NOT_FOUND"
//       );
//     }

//     res.ok({
//       updated: user,
//       message: "User picture uploaded successfully.",
//     });
//   }
// }

// export default new UserController();

import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

import {
  BadRequest,
  ResourceNotFound,
  Forbidden,
  Unauthorized,
} from "../../../errors/httpErrors";

import User from "../../../db/models/user.model";
import bcrypt from "bcrypt";
import { promises as fsPromises } from "fs";
import path from "path";
import { uploadPicture } from "../../../services/file.service";
import {
  getLimit,
  getPage,
  getStartDate,
  getEndDate,
} from "../../../utils/dataFilters";
import { userFields } from "../../../utils/fieldHelpers";
import * as validators from "../validators/auth.validator";
import { successChangedPasswordEmail } from "../../../services/email.service";

type QueryParams = {
  startDate?: Date;
  endDate?: Date;
  limit?: string;
  page?: string;
};

const awsBaseUrl = process.env.AWS_BASEURL;

class UserController {
  // Upgrade user to premium
  async upgradeToPremium(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.loggedInAccount._id;

      const user = await User.findById(userId);
      if (!user) {
        throw new ResourceNotFound("User not found.", "RESOURCE_NOT_FOUND");
      }

      // Only Sellers can upgrade to premium
      if (user.accountType !== "Seller") {
        throw new Forbidden(
          "Only sellers can upgrade to premium.",
          "INSUFFICIENT_PERMISSIONS"
        );
      }

      if (user.sellerInfo?.isPremium) {
        // Corrected line: Using a string literal for the error code
        throw new BadRequest("User is already a premium member.", "INVALID_REQUEST_PARAMETERS"); 
      }

      // Initialize sellerInfo if not present
      if (!user.sellerInfo) {
        user.sellerInfo = {
          isPremium: true,
          premiumType: "monthly", // or use req.body.premiumType if you want dynamic
          salesCount: 0,
        };
      } else {
        user.sellerInfo.isPremium = true;
        user.sellerInfo.premiumType = "monthly"; // or dynamic
      }

      await user.save();

      res.ok({
        message: "Your account has been successfully upgraded to premium.",
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request, res: Response) {
    const queryParams: QueryParams = req.query;
    const startDate = getStartDate(queryParams.startDate);
    const endDate = getEndDate(queryParams.endDate);
    const limit = getLimit(queryParams.limit);
    const page = getPage(queryParams.page);

    const query = User.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .sort({ createdAt: 1 })
      .limit(limit)
      .skip(limit * (page - 1));

    const totalUsers = await User.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });
    const mappedUsers = await query.select(userFields.join(" "));

    res.ok(
      { users: mappedUsers, totalUsers },
      { page, limit, startDate, endDate }
    );
  }

  async getUserById(req: Request, res: Response) {
    const { userId } = req.params;
    if (!userId) {
      throw new ResourceNotFound("userId is missing.", "RESOURCE_NOT_FOUND");
    }

    const user = await User.findById(userId).select(userFields.join(" "));
    if (!user) {
      throw new ResourceNotFound(
        `User with ID ${userId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.ok(user);
  }

  async updateUser(req: Request, res: Response) {
    const userId = req.loggedInAccount._id;

    const { error, data } = validators.updateUserValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);

    const user = await User.findByIdAndUpdate(
      userId,
      { ...data },
      { new: true }
    ).select(userFields.join(" "));

    if (!user) {
      throw new BadRequest(
        `User ${userId} not updated.`,
        "INVALID_REQUEST_PARAMETERS"
      );
    }

    res.ok({
      updated: user,
      message: "Your details are updated successfully.",
    });
  }

  async blockUser(req: Request, res: Response) {
    const { error, data } = validators.blockUserValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);
    const { userId, blockDecision } = data;

    await User.findByIdAndUpdate(userId, {
      deletedAt: blockDecision,
      updatedAt: new Date(),
    });

    return res.ok({
      message: blockDecision
        ? "User has been blacklisted, and won't be able to login again"
        : "Blacklist restriction removed, User access restored",
    });
  }

  async formUserUpdatePassword(req: Request, res: Response) {
    const userId = req.loggedInAccount._id;

    const { error, data } = validators.changePasswordValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);
    const { oldPassword, newPassword } = data;

    const user = await User.findById(userId);
    if (!user)
      throw new ResourceNotFound("User not found", "RESOURCE_NOT_FOUND");

    if (user.authMethod !== "Form") {
      throw new Forbidden(
        "Cannot change password for non-form authentication method.",
        "INSUFFICIENT_PERMISSIONS"
      );
    }

    const hashedPassword = user.authType?.password;

    if (hashedPassword !== undefined) {
      const isPasswordValid = bcrypt.compareSync(oldPassword, hashedPassword);
      if (!isPasswordValid) {
        throw new Unauthorized("Invalid old password.", "INVALID_PASSWORD");
      }
    } else {
      throw new Forbidden(
        "You have no password set; please sign in with a third-party provider, e.g. Google.",
        "ACCESS_DENIED"
      );
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, {
      "authType.password": hash,
      updatedAt: new Date(),
    });

    await successChangedPasswordEmail(user.email, user.fullname);

    return res.ok({
      message: "Password successfully changed",
    });
  }

  async updateUserDp(req: Request, res: Response) {
    const userId = req.loggedInAccount._id;
    const profilePicture = req.file;

    if (!profilePicture) {
      throw new BadRequest(
        "No profile picture provided.",
        "MISSING_REQUIRED_FIELD"
      );
    }

    const uploadedFile = profilePicture as Express.Multer.File;

    const profilePictureExtension = path.extname(uploadedFile.originalname);
    const profilePictureKey = await uploadPicture(
      uploadedFile.path,
      "user-profile",
      profilePictureExtension
    );
    await fsPromises.unlink(uploadedFile.path);

    const key = `${awsBaseUrl}/${profilePictureKey}`;
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: key, updatedAt: new Date() },
      { new: true }
    ).select(userFields.join(" "));

    if (!user) {
      throw new ResourceNotFound(
        `User ${userId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.ok({
      updated: user,
      message: "User picture uploaded successfully.",
    });
  }
}

export default new UserController();