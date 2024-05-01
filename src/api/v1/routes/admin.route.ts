import express from "express";

import controller from "../controllers/admin.controller";
import { auth } from "../../middlewares/authMiddleware";
import upload from "../../middlewares/multerMiddleware";

const adminRouter = express.Router();

//admin route
adminRouter.get("/", auth({ accountType: ["admin"] }), controller.getAdmins);

adminRouter.get(
  "/:adminId",
  auth({ accountType: ["admin"] }),
  controller.getAdminById
);
adminRouter.get(
  "/admin/:adminCustomId",
  auth({ accountType: ["admin"] }),
  controller.getAdminByCustomId
);
adminRouter.get(
  "/user/:userCustomId",
  auth({ accountType: ["admin"] }),
  controller.getUserByCustomId
);

adminRouter.put("/", auth({ accountType: ["admin"] }), controller.updateAdmin);

adminRouter.put(
  "/superadmin/:adminId",
  auth({ accountType: ["admin"], adminType: ["Super-Admin"] }),
  controller.updateAdminBySuperAdmin
);

adminRouter.patch(
  "/dp",
  auth({ accountType: ["admin"] }),
  upload.single("profilePicture"),
  controller.updateAdminDp
);

adminRouter.patch(
  "/password",
  auth({ accountType: ["admin"] }),
  controller.formAdminUpdatePassword
);

adminRouter.patch(
  "/",
  auth({ accountType: ["admin"], adminType: ["Super-Admin"] }),
  controller.blockAdmin
);

export default adminRouter;
