/* eslint-disable no-inner-declarations */
/* eslint-disable prefer-const */
import { Request, Response } from "express";
import * as bcrypt from "bcrypt";
import _ from "lodash";
import * as moment from "moment-timezone";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import {
  BadRequest,
  ResourceNotFound,
  Conflict,
  Unauthorized,
  Forbidden,
  ServerError,
} from "../../../errors/httpErrors";
import Admin from "../../../db/models/admin.model";
import User, { IUser } from "../../../db/models/user.model";
import Seller, { ISeller } from "../../../db/models/seller.model";
import * as validators from "../validators/auth.validator";
import googleHelpers from "../../../utils/authGoogleHelpers";
import GeneratorService from "../../../utils/customIdGeneratorHelpers";
// import moment from 'moment-timezone';

import {
  generateAuthToken,
  verifyRefreshToken,
  buildSignupUrl,
} from "../../../utils/authHelpers";
import { userFields, adminFields } from "../../../utils/fieldHelpers";
import {
  verifyEmailNotification,
  welcomeNotification,
  resetPasswordEmail,
  successChangedPasswordEmail,
} from "../../../services/email.service";

const EMAIL_TOKEN_EXPIRY = 10; // 10 minutes
const PASSWORD_TOKEN_EXPIRY = 10; // 10 minutes
const googleClient = googleHelpers.generateClient();

class AuthController {
  //user auth
  async userFormRegister(req: Request, res: Response) {
    const { error, data } = validators.createUserValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);

    const { fullname, email, password, phoneNumber } = data;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      console.log(`${email} already exist, change the email.`);
      throw new Conflict(
        `${email} already exist, change the email.`,
        "EXISTING_USER_EMAIL"
      );
    }
    const accountType = "User";
    const hash = await bcrypt.hash(password, 10);

    // Generate custom user ID
    const customId = await GeneratorService.generateUserCustomId();

    const userTimezone = moment.tz.guess();
    const now = moment.tz(userTimezone);
    const expiry = now.add(EMAIL_TOKEN_EXPIRY, "minutes").toDate();

    const user = await User.create({
      fullname,
      email,
      phoneNumber,
      customId,
      accountType,
      authMethod: "Form",
      authType: {
        password: hash,
      },
      isVerified: false,
      emailConfirmation: {
        emailConfirmationToken: uuidv4(),
        emailConfirmationTokenExpiresAt: expiry,
      },
    });

    const token = user.emailConfirmation?.emailConfirmationToken;

    const link = buildSignupUrl(token!, user.email);

    // await verifyEmailNotification(user.email, user.fullname, link);

    const formattedUser = _.pick(user, userFields);

    return res.created({
      user: formattedUser,
      message: "Email verification link sent to the email address provided",
    });
  }

  async userFormLogin(req: Request, res: Response) {
    const { error, data } = validators.loginValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);
    const { email, password } = data;

    // Check if a user with the provided email exists
    const user = await User.findOne({ email });
    if (!user) {
      throw new BadRequest(
        "Invalid Login credentials.",
        "INVALID_REQUEST_PARAMETERS"
      );
    }
    // Check if user account has been deleted
    if (user.deletedAt) {
      throw new Forbidden(
        "Your account is currently deleted. Contact support if this is by mistake.",
        "ACCESS_DENIED"
      );
    }
    if (user.accountType !== "User") {
      throw new Forbidden(
        "Your account is not a user. Contact support if this is by mistake.",
        "ACCESS_DENIED"
      );
    }

    // Check if user has "value" on password as authType
    if (user.authMethod !== "Form") {
      throw new Forbidden(
        "You have no password set; please sign in with a third-party provider, e.g. Google.",
        "ACCESS_DENIED"
      );
    }

    // Retrieve the hashed password from the user's business account
    const hashedPassword = user.authType?.password;

    // Check if hashedPassword is not undefined before using bcrypt.compareSync
    if (hashedPassword !== undefined) {
      const isPasswordValid = bcrypt.compareSync(password, hashedPassword);
      if (!isPasswordValid) {
        throw new Unauthorized(
          "Invalid Login credentials.",
          "INVALID_PASSWORD"
        );
      }
    } else {
      throw new Forbidden(
        "You have no password set; please sign in with a third-party provider, e.g. Google.",
        "ACCESS_DENIED"
      );
    }
    if (!user.isVerified) {
      console.log("Your account is not verified.");
      throw new BadRequest(
        "Your account is not verified. Kindly request for Email verification link",
        "EMAIL_NOT_VERIFIED"
      );
    }

    const { accessToken, refreshToken } = await generateAuthToken(user, "User");
    const formattedUser = _.pick(user, userFields);

    return res.ok({
      user: formattedUser,
      accessToken,
      refreshToken,
      message: "You are Logged in successfully",
    });
  }

  async formVerifyUniqueString(req: Request, res: Response) {
    const { uniqueString } = req.query;

    if (!uniqueString) {
      throw new BadRequest(
        "Unique string token missing",
        "MISSING_REQUIRED_FIELD"
      );
    }

    const user = await User.findOne({
      "emailConfirmation.emailConfirmationToken": uniqueString,
    });

    if (!user) {
      throw new ResourceNotFound("Invalid Token", "RESOURCE_NOT_FOUND");
    }

    const userTimezone = moment.tz.guess();
    const now = moment.tz(userTimezone);
    const tokenExpired = now.isAfter(
      user.emailConfirmation?.emailConfirmationTokenExpiresAt
    );

    if (tokenExpired) {
      await User.findByIdAndUpdate(user._id, {
        isVerified: false,
        "emailConfirmation.emailConfirmationToken": null,
        "emailConfirmation.emailConfirmationTokenExpiresAt": null,
      });

      return res.error(
        400,
        "Token Expired, Request for a new link",
        "EXPIRED_TOKEN"
      );
    } else {
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          isVerified: true,
          "emailConfirmation.emailConfirmationToken": null,
          "emailConfirmation.emailConfirmationTokenExpiresAt": null,
        },
        { new: true }
      );

      const { accessToken, refreshToken } = await generateAuthToken(
        user,
        "User"
      );

      // await welcomeNotification(user.email, user.fullname);
      const formattedUser = _.pick(updatedUser, userFields);

      return res.ok({
        updatedUser: formattedUser,
        accessToken: accessToken,
        refreshToken: refreshToken,
        message: "Email Address Verified Successfully",
      });
    }
  }

  async formEmailVerification(req: Request, res: Response) {
    let email = req.query.email as string;
    email = email.toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      throw new ResourceNotFound(
        "Your associated account with the email not found",
        "RESOURCE_NOT_FOUND"
      );
    }
    if (user.isVerified) {
      console.log("Your account is already verified.");
      throw new BadRequest(
        "Your account is already verified!. Kindly use the Login link",
        "EMAIL_ALREADY_VERIFIED"
      );
    }

    const userTimezone = moment.tz.guess();
    const now = moment.tz(userTimezone);
    const expiry = now.add(EMAIL_TOKEN_EXPIRY, "minutes").toDate();

    const emailConfirmationToken = uuidv4();
    await User.findByIdAndUpdate(
      user._id,
      {
        "emailConfirmation.emailConfirmationToken": emailConfirmationToken,
        "emailConfirmation.emailConfirmationTokenExpiresAt": expiry,
      },
      { new: true }
    );

    const link = buildSignupUrl(emailConfirmationToken, user.email);

    //await verifyEmailNotification(user.email, user.fullname, link);

    return res.ok({
      message: "Email verification link sent to the email address provided",
    });

    // let email = req.query.email as string;
    // email = email.toLowerCase();

    // await testEmail(email);

    // return res.ok({
    //   message: "Test email sent",
    // });
  }

  // GOOGLE FOR BOTH user
  //get google auth Url
  async getGoogleConsentUrl(req: Request, res: Response) {
    try {
      const authUrl = googleClient.generateAuthUrl({
        access_type: "offline",
        scope: googleHelpers.SCOPES,
      });

      res.ok({
        urlAuth: authUrl,
      });
    } catch (error) {
      console.log(error);
      throw new ServerError(
        "Could not connect to Google servers, please try again later",
        "THIRD_PARTY_API_FAILURE"
      );
    }
  }

  async googleVerification(req: Request, res: Response) {
    const { error, data } = validators.oauthValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);

    const { code } = data;

    let account: IUser | null = null;
    let authProcessType: string | null = null;
    const tokenId = await googleHelpers.getAccessToken(code, googleClient);
    const payload = await googleHelpers.verify(tokenId, googleClient);
    const email = payload["email"];

    //check if account exist
    account = (await User.findOne({ email: email })) || null;

    //create new account if it doesn't exist but sign if it exist
    if (!account) {
      const userCustomId = await GeneratorService.generateUserCustomId();

      account = await googleHelpers.userGoogleSignup(
        code,
        googleClient,
        userCustomId,
        payload
      );

      await welcomeNotification(account!.email, account!.fullname);

      authProcessType = "signup";
    } else {
      authProcessType = "signin";
    }

    if (account?.deletedAt) {
      throw new Forbidden(
        "Your account is currently deleted. Contact support if this is by mistake.",
        "ACCESS_DENIED"
      );
    }

    if (account?.authMethod !== "Google") {
      throw new Forbidden(
        "You have no password set; please sign in with a third-party provider, e.g., Google.",
        "ACCESS_DENIED"
      );
    }

    // Ensure only allowed account types are passed
    const allowedAccountTypes = ["User", "Seller", "Admin"] as const;
    const safeAccountType = allowedAccountTypes.includes(account.accountType as any)
      ? (account.accountType as "User" | "Seller" | "Admin")
      : "User";
    const { accessToken, refreshToken } = await generateAuthToken(
      account,
      safeAccountType
    );

    let formattedAccount: Partial<IUser> | null = null;
    formattedAccount = _.pick(account as IUser, userFields);

    res.ok({
      authProcessType,
      account: formattedAccount,
      token: accessToken,
      refreshToken: refreshToken,
      message: "You are logged in successfully",
    });
  }

  // admin auth
  async adminRegister(req: Request, res: Response) {
    const { error, data } = validators.createAdminValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);
    const { firstname, lastname, email, password, adminType } = data;

    const emailExists = await Admin.findOne({ email });
    if (emailExists) {
      console.log(`${email} already exist, change the email.`);
      throw new Conflict(
        `${email} already exist, change the email.`,
        "EXISTING_USER_EMAIL"
      );
    }
    const accountType = "Admin";
    const hash = await bcrypt.hash(password, 10);
    const adminCustomId = await GeneratorService.generateAdminCustomId();
    console.log(adminCustomId);

    const admin = await Admin.create({
      firstname,
      lastname,
      email,
      password: hash,
      isAdmin: true,
      accountType: "Admin",
      adminType,
      adminCustomId,
    });

    const { accessToken, refreshToken } = await generateAuthToken(
      admin,
      accountType
    );

    const formattedAdmin = _.pick(admin, adminFields);

    return res.created({
      admin: formattedAdmin,
      accessToken: accessToken,
      refreshToken: refreshToken,
      message: "Account created successfully",
    });
  }

  async adminLogin(req: Request, res: Response) {
    const { error, data } = validators.adminValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);
    const { email, password } = data;

    // Check if a admin with the provided email exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      throw new BadRequest(
        "Admin account not found.",
        "INVALID_REQUEST_PARAMETERS"
      );
    }
    // Check if user account has been deleted
    if (admin.deletedAt) {
      throw new Forbidden(
        "Your account is currently deleted. Contact support if this is by mistake.",
        "ACCESS_DENIED"
      );
    }
    if (admin.accountType !== "Admin") {
      throw new Forbidden(
        "Your account is not a admin. Contact support if this is by mistake.",
        "ACCESS_DENIED"
      );
    }

    // Verify the provided password against the hashed password
    const isPasswordValid = await bcrypt.compareSync(password, admin.password);
    if (!isPasswordValid) {
      throw new Unauthorized("Invalid Login credentials.", "INVALID_PASSWORD");
    }

    const { accessToken, refreshToken } = await generateAuthToken(
      admin,
      "Admin"
    );
    const formattedAdmin = _.pick(admin, adminFields);

    return res.ok({
      admin: formattedAdmin,
      accessToken,
      refreshToken,
      message: "You are Logged in successfully",
    });
  }

  // General Reset Password
  async sendTokenToForgetPassword(req: Request, res: Response) {
    const { error, data } = validators.resetTokenValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);
    let { email } = data;

    const user = await User.findOne({ email });
    if (!user) {
      throw new ResourceNotFound(
        "Your associated account with the email not found",
        "RESOURCE_NOT_FOUND"
      );
    }

    if (user.authType.password === undefined || user.authMethod !== "Form") {
      throw new BadRequest(
        "Cannot reset password for non-Form login account, continue with another option like Google",
        "INVALID_REQUEST_PARAMETERS"
      );
    }

    const userTimezone = moment.tz.guess();
    const now = moment.tz(userTimezone);
    const expiry = now.add(PASSWORD_TOKEN_EXPIRY, "minutes").toDate();

    function generateOTP() {
      return Math.floor(100000 + Math.random() * 900000).toString();
    }

    user.passwordRecovery = {
      passwordRecoveryOtp: generateOTP(),
      passwordRecoveryOtpExpiresAt: expiry,
    };
    await user.save();

    const otp = user.passwordRecovery.passwordRecoveryOtp;

    if (otp && user.fullname && email) {
      // await resetPasswordEmail(user.email, user.fullname, otp);
    }

    res.ok({ message: `New reset password Otp sent to ${email}` });
  }

  async verifyUserOtpResetPassword(req: Request, res: Response) {
    const { otp } = req.query;

    // Cast the req.query object to the expected payload structure
    const verifyTokenPayload = {
      otp: otp as string,
    };

    const { error } = validators.verifyTokenValidator(verifyTokenPayload);
    if (error) throw new BadRequest(error.message, error.code);

    const user = await User.findOne({
      "passwordRecovery.passwordRecoveryOtp": otp,
    });
    if (!user) {
      throw new Unauthorized("Invalid OTP supplied", "EXPIRED_TOKEN");
    }

    const userTimezone = moment.tz.guess();
    const now = moment.tz(userTimezone);
    const otpExpired = now.isAfter(
      user?.passwordRecovery?.passwordRecoveryOtpExpiresAt
    );

    // Handle expired OTP
    if (otpExpired) {
      user.passwordRecovery = {
        passwordRecoveryOtp: undefined,
        passwordRecoveryOtpExpiresAt: undefined,
      };
      await user.save();
      return res.error(400, "OTP Expired, request a new one", "EXPIRED_TOKEN");
    }

    res.ok({ message: "Otp validated successfully" });
  }

  async verifyUserOtpAndChangePassword(req: Request, res: Response) {
    const { error, data } = validators.verifyUserOtpAndChangePasswordValidator(
      req.body
    );
    if (error) throw new BadRequest(error.message, error.code);
    const { otp, newPassword, accountType } = data;

    if(accountType === "User"){
      const user = await User.findOne({
      "passwordRecovery.passwordRecoveryOtp": otp,
    });

    if (!user)
      throw new BadRequest("Invalid OTP", "INVALID_REQUEST_PARAMETERS");

    const userTimezone = moment.tz.guess();
    const now = moment.tz(userTimezone);
    const otpExpired = now.isAfter(
      user?.passwordRecovery?.passwordRecoveryOtpExpiresAt
    );

    // Handle expired OTP
    if (otpExpired) {
      user.passwordRecovery = {
        passwordRecoveryOtp: undefined,
        passwordRecoveryOtpExpiresAt: undefined,
      };
      await user.save();
      return res.error(400, "OTP Expired, request a new one", "EXPIRED_TOKEN");
    } else {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.authType.password = hashedPassword;
      user.passwordRecovery = {
        passwordRecoveryOtp: undefined,
        passwordRecoveryOtpExpiresAt: undefined,
      };
      await user.save();
      // await successChangedPasswordEmail(user.email, user.fullname);

      res.ok({ message: "Your Password has been changed successfully" });
    }
    }else if(accountType==="Seller"){
       const seller = await Seller.findOne({
      "passwordRecovery.passwordRecoveryOtp": otp,
       });

    if (!seller)
      throw new BadRequest("Invalid OTP", "INVALID_REQUEST_PARAMETERS");

    const sellerTimezone = moment.tz.guess();
    const now = moment.tz(sellerTimezone);
    const otpExpired = now.isAfter(
      seller?.passwordRecovery?.passwordRecoveryOtpExpiresAt
    );

    // Handle expired OTP
    if (otpExpired) {
      seller.passwordRecovery = {
        passwordRecoveryOtp: undefined,
        passwordRecoveryOtpExpiresAt: undefined,
      };
      await seller.save();
      return res.error(400, "OTP Expired, request a new one", "EXPIRED_TOKEN");
    } else {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      seller.authType.password = hashedPassword;
      seller.passwordRecovery = {
        passwordRecoveryOtp: undefined,
        passwordRecoveryOtpExpiresAt: undefined,
      };
      await seller.save();
      // await successChangedPasswordEmail(seller.email, seller.fullname);

      res.ok({ message: "Your Password has been changed successfully" });
    }
    }
  }

  async resetadminPassword(req: Request, res: Response) {
    const { error, data } = validators.resetTokenValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);
    let { email } = data;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      throw new ResourceNotFound(
        "Admin associated account with the email not found",
        "RESOURCE_NOT_FOUND"
      );
    }
    const randomBytes = uuidv4().split("-")[0];
    const password = `Admin@${randomBytes}`;
    const hash = await bcrypt.hash(password, 10);

    const updatedAdmin = await Admin.findByIdAndUpdate(admin._id, {
      password: hash,
      updatedAt: new Date(),
    });

    const formattedAdmin = _.pick(updatedAdmin, adminFields);

    res.ok({
      admin: formattedAdmin,
      newPassword: password,
      message: "Admin password updated successfully",
    });
  }

  //General Refresh Token and Logout for users and Admin
  async refreshToken(req: Request, res: Response) {
    const { error, data } = validators.tokenValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);

    //my birthday bug fixed
    const { refreshToken, accountType } = data;
    let payload, accessToken;
    // Define types for token details and verify result
    interface TokenDetails {
      userId?: string;
      adminId?: string;
      iat: number;
      exp: number;
    }

    // Specify the type of the returned value from verifyRefreshToken
    const result = await verifyRefreshToken(refreshToken, accountType);

    if (accountType === "User") {
      const tokenDetails = result.tokenDetails as TokenDetails; // Type assertion

      payload = { userId: tokenDetails.userId };
      accessToken = jwt.sign(payload, process.env.JWT_SEC, {
        expiresIn: "24h",
      });
    } else if (accountType === "Admin") {
      const tokenDetails = result.tokenDetails as TokenDetails; // Type assertion

      payload = { adminId: tokenDetails.adminId };
      accessToken = jwt.sign(payload, process.env.JWT_SEC, {
        expiresIn: "1h",
      });
    } else {
      throw new Unauthorized(
        "Account type is not valid for refreshing token",
        "INVALID_TOKEN"
      );
    }
    res.ok({
      accessToken,
      message: `New Access token created successfully for the ${accountType}`,
    });
  }

  async logout(req: Request, res: Response) {
    const { error, data } = validators.tokenValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);
    const { refreshToken, accountType } = data;

    if (accountType === "User") {
      const loggedUser = await User.findOneAndUpdate(
        { refreshToken: refreshToken },
        { refreshToken: "" },
        { new: true }
      );

      if (!loggedUser) {
        throw new Unauthorized("You are not logged in", "INVALID_TOKEN");
      }

      res.ok({ message: "Logged Out Successfully" });
    } else if (accountType === "Admin") {
      const loggedAdmin = await Admin.findOneAndUpdate(
        { refreshToken: refreshToken },
        { refreshToken: "" },
        { new: true }
      );

      if (!loggedAdmin) {
        throw new Unauthorized("You are not logged in", "INVALID_TOKEN");
      }

      res.ok({ message: "Logged Out Successfully" });
    } else {
      throw new Error("Invalid account type provided");
    }
  }

  async loggedInAccount(req: Request, res: Response) {
    const loggedInAccount = req.loggedInAccount;
    let formattedAccount;
    if (loggedInAccount.accountType === "User") {
      formattedAccount = _.pick(loggedInAccount, userFields);
    } else {
      formattedAccount = _.pick(loggedInAccount, adminFields);
    }

    res.ok({
      loggedInAccount: formattedAccount,
      message: "Current Logged-in Credential retrieved",
    });
  }
}

export default new AuthController();
