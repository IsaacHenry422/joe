import { Request, Response } from "express";
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
  // Get all users
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

    const totalUsers = await User.countDocuments(query);

    const mappedUsers = await query.select(userFields.join(" "));

    res.ok(
      { users: mappedUsers, totalUsers },
      { page, limit, startDate, endDate }
    );
  }

  // Get a user by ID
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

  // Update a User by ID
  async updateUser(req: Request, res: Response) {
    const userId = req.loggedInAccount._id;

    const { error, data } = validators.updateUserValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);

    const user = await User.findByIdAndUpdate(
      userId,
      { ...data, updatedAt: new Date() },
      { new: true }
    ).select(userFields.join(" "));

    if (!user) {
      throw new BadRequest(
        `User ${user!.userCustomId} not updated.`,
        "INVALID_REQUEST_PARAMETERS"
      );
    }

    res.ok({
      updated: user,
      message: "Your details are updated successfully.",
    });
  }

  // block a User by ID
  async blockUser(req: Request, res: Response) {
    const { error, data } = validators.blockUserValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);
    const { userId, blockDecision } = data;

    if (blockDecision == true) {
      await User.findByIdAndUpdate(userId, {
        deletedAt: blockDecision,
        updatedAt: new Date(),
      });
      return res.ok({
        message: "User has been blacklisted, and wont be able to login again",
      });
    } else {
      await User.findByIdAndUpdate(userId, {
        deletedAt: blockDecision,
        updatedAt: new Date(),
      });
      return res.ok({
        message: "Blacklist restriction removed, User access restored",
      });
    }
  }

  //update User password
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

    // Retrieve the hashed password from the user's business account
    const hashedPassword = user.authType?.password;

    // Check if hashedPassword is not undefined before using bcrypt.compareSync
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

    await successChangedPasswordEmail(user.email, user.firstname);

    return res.ok({
      message: "Password successfully changed",
    });
  }

  //update User dp
  async updateUserDp(req: Request, res: Response) {
    const userId = req.loggedInAccount._id;
    const profilePicture = req.file; // Access the uploaded file from req

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
