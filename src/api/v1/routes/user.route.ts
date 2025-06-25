//  import express from "express";
// import controller from "../controllers/user.controller";
// import { auth } from "../../middlewares/authMiddleware";
// import upload from "../../middlewares/multerMiddleware";

// const userRouter = express.Router();

// // Admin-only routes
// userRouter.get("/", auth({ accountType: ["admin"] }), controller.getUsers);
// userRouter.get("/:userId", auth({ accountType: ["admin"] }), controller.getUserById);
// userRouter.patch("/", auth({ accountType: ["admin"] }), controller.blockUser);

// // User-only routes
// userRouter.put("/", auth({ accountType: ["user"] }), controller.updateUser);

// userRouter.patch(
//   "/dp",
//   auth({ accountType: ["user"] }),
//   upload.single("profilePicture"),
//   controller.updateUserDp
// );

// userRouter.patch(
//   "/password",
//   auth({ accountType: ["user"] }),
//   controller.formUserUpdatePassword
// );

// // ✅ Premium upgrade route (seller -> premium)
// userRouter.post(
//   "/upgrade-premium",
//   auth({ accountType: ["seller"] }), // Ensure this matches `req.loggedInAccount.accountType.toLowerCase()`
//   controller.upgradeToPremium
// );

// export default userRouter;
import express from "express";
import controller from "../controllers/user.controller";
import { auth } from "../../middlewares/authMiddleware";
import upload from "../../middlewares/multerMiddleware";

const userRouter = express.Router();

// Admin-only routes
userRouter.get("/", auth({ accountType: ["admin"] }), controller.getUsers);
userRouter.get("/:userId", auth({ accountType: ["admin"] }), controller.getUserById);
userRouter.patch("/", auth({ accountType: ["admin"] }), controller.blockUser);

// User-only routes (consider including "seller" if they should update themselves)
userRouter.put("/", auth({ accountType: ["user", "seller"] }), controller.updateUser);

userRouter.patch(
  "/dp",
  auth({ accountType: ["user", "seller"] }),
  upload.single("profilePicture"),
  controller.updateUserDp
);

userRouter.patch(
  "/password",
  auth({ accountType: ["user", "seller"] }),
  controller.formUserUpdatePassword
);

// Premium upgrade route — Ensure case sensitivity matches your model's accountType values
userRouter.post(
  "/upgrade-premium",
  auth({ accountType: ["Seller"] }), // Capital S to match model "Seller"
  controller.upgradeToPremium
);

export default userRouter;
