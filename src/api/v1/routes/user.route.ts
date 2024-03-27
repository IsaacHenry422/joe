import express from "express";

import controller from "../controllers/user.controller";
import { auth } from "../../middlewares/authMiddleware";
import upload from "../../middlewares/multerMiddleware";

const userRouter = express.Router();

//admin route
userRouter.get("/", auth({ accountType: ["admin"] }), controller.getUsers);

// users and admin route
userRouter.get(
  "/:userId",
  auth({ accountType: ["admin"] }),
  controller.getUserById
);

userRouter.patch("/", auth({ accountType: ["admin"] }), controller.blockUser);

// users route
userRouter.put("/", auth({ accountType: ["user"] }), controller.updateUser);

userRouter.patch(
  "/dp",
  auth({ accountType: ["user"] }),
  upload.single("profilePicture"),
  controller.updateUserDp
);

userRouter.patch(
  "/password",
  auth({ accountType: ["user"] }),
  controller.formUserUpdatePassword
);

export default userRouter;
