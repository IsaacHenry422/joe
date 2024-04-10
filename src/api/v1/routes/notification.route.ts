import express from "express";
import notificationController from "../controllers/notification.controller";
import { auth } from "../../middlewares/authMiddleware";

const notificationRouter = express.Router();

// get all notifications 
notificationRouter.get("/",auth({accountType:["User"]}),notificationController.getAllNotifications);

// get notification
notificationRouter.get("/one",auth({accountType:["User"]}),notificationController.getNotification);

// update notification
notificationRouter.patch("/one",auth({accountType:["User"]}),notificationController.updateNotification);

export default notificationRouter;