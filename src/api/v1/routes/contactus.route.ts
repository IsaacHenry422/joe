import express from "express";
import controller from "../controllers/contactForm.controller";
// import { auth } from "../../middlewares/authMiddleware";

const contactUsRouter = express.Router();

// Create a new contactus entry route
contactUsRouter.post("/", controller.contactUs);

// Get all contactus entries route
contactUsRouter.get(
  "/",
  //   auth({ accountType: ["user"] }),
  controller.getContacts
);

// Get a specific contactus entry by ID route
contactUsRouter.get(
  "/:contactId",
  //   auth({ accountType: ["user"] }),
  controller.getContactById
);

// Update a specific contactus entry by ID route
contactUsRouter.patch(
  "/:contactId",
  //   auth({ accountType: ["user"] }),
  controller.updateContact
);

// Delete a contactus entry by ID route
contactUsRouter.delete("/:contactId", controller.deleteContactById);

export default contactUsRouter;
