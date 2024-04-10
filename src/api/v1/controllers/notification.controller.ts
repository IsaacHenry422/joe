/* eslint-disable no-constant-condition */
import { Request, Response } from "express";
import { BadRequest, ResourceNotFound } from "../../../errors/httpErrors";
import Notification from "../../../db/models/notification.model";
import * as validators from "../validators/notification.validator";

import {
  getLimit,
  getPage,
  getStartDate,
  getEndDate,
} from "../../../utils/dataFilters";

type QueryParams = {
  startDate?: Date;
  endDate?: Date;
  limit?: string;
  page?: string;
};

class notificationController {
  // // Create a new media application
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createNotification(payload: any) {
    const userId = payload.userId;
    
    const { error, data } = validators.createNotificationValidator(payload);
    
    if (error) throw new BadRequest(error.message, error.code);

    const notification = new Notification({
      ...data,
      userId,
    });
    await notification.save();
    console.log("notification created successfully");
    
  }

  //   get all notifications
  async getAllNotifications(req: Request, res: Response) {
    const userId = req.loggedInAccount._id;
    const queryParams: QueryParams = req.query;
    const startDate = getStartDate(queryParams.startDate);
    const endDate = getEndDate(queryParams.endDate);
    const limit = getLimit(queryParams.limit);
    const page = getPage(queryParams.page);

    const notifications = await Notification.find({
      userId,
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .sort({ createdAt: 1 })
      .limit(limit)
      .skip(limit * (page - 1));

    // Send the response
    res.ok(
      {
        notifications,
      },
      { page, limit, startDate, endDate }
    );
  }

  //   get notification
  async getNotification(req: Request, res: Response) {
    const userId = req.loggedInAccount._id;
    const _id = req.query.notificationId;
    if (!_id)
      throw new BadRequest(
        "Please provide notification id",
        "MISSING_REQUIRED_FIELD"
      );
    const notification = await Notification.findOne({ userId, _id });
    if (!notification)
      throw new ResourceNotFound(
        `you do not have a notification with id:${_id}`,
        "RESOURCE_NOT_FOUND"
      );
    res.ok({ notification });
  }

  //   update notification
  async updateNotification(req: Request, res: Response) {
    const userId = req.loggedInAccount._id;
    const _id = req.query.notificationId;
    if (!_id)
      throw new BadRequest(
        "Please provide notification id",
        "MISSING_REQUIRED_FIELD"
      );
    const notification = await Notification.findOneAndUpdate(
      { userId, _id },
      { read: true },
      { new: true, runValidators: true }
    );
    if (!notification)
      throw new ResourceNotFound(
        `you do not have a notification with id:${_id}`,
        "RESOURCE_NOT_FOUND"
      );
    res.noContent();
  }
}

export default new notificationController();
