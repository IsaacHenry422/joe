import express from "express";

import controller from "../controllers/auth.controller";
import { auth } from "../../middlewares/authMiddleware";

const authRouter = express.Router();

// form Auth buyer
authRouter.post("/user/register", controller.userFormRegister);
authRouter.post("/user/login", controller.userFormLogin);
authRouter.post("/user/verify-token", controller.formVerifyUniqueString);
authRouter.post("/user/resend-token", controller.formEmailVerification);

// Google Auth buyer/business
authRouter.get("/google/getauthurl", controller.getGoogleConsentUrl);
authRouter.post("/google/callback", controller.googleVerification);

//password reset and regenerate verify email token for users/owners
authRouter.post(
  "/resetpassword/send-token",
  controller.sendTokenToForgetPassword
);
authRouter.post(
  "/resetpassword/verify-token",
  controller.verifyUserOtpResetPassword
);
authRouter.post(
  "/resetpassword/change-password",
  controller.verifyUserOtpAndChangePassword
);
authRouter.post(
  "/resetpassword/admin",
  auth({ accountType: ["admin"], adminType: ["Super-Admin"] }),
  controller.resetadminPassword
);

// Auth admin
authRouter.post("/admin/register", controller.adminRegister);
authRouter.post("/admin/login", controller.adminLogin);

//refresh and logout
authRouter.post("/refresh-token", controller.refreshToken);
authRouter.patch("/logout", controller.logout);

// get loggedin user/owner/admin
authRouter.get("/me", auth(), controller.loggedInAccount);

export default authRouter;
