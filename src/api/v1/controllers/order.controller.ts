import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

import Order, { IOrder } from "../../../db/models/order.model";
// import User from "../../../db/models/user.model";
import notifications from "./notification.controller";
// import MediaApplication from "../../../db/models/mediaApplication.model";
import PaystackService from "../../../services/payment.service";
import {
  getLimit,
  getPage,
  getStartDate,
  getEndDate,
} from "../../../utils/dataFilters";

import {
  BadRequest,
  ResourceNotFound,
  ServerError,
} from "../../../errors/httpErrors";

import * as validators from "../validators/order.validator";
type QueryParams = {
  startDate?: Date;
  endDate?: Date;
  limit?: string;
  page?: string;
  orderStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
};

class OrderController {
  //pay now
  async payLaterOrder(req: Request, res: Response) {
    const userId = req.loggedInAccount._id;
    const { error, data } = validators.createOrderValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);

    const { orderItem, amount, paymentMethod, paymentStatus, paymentType } =
      data;
    if (!orderItem || orderItem.length < 1) {
      throw new BadRequest(
        "No Item in the Order items provided",
        "INVALID_REQUEST_PARAMETERS"
      );
    }

    // Calculate subtotal and generate orderSubRef
    let subtotal = 0;
    const uuid = uuidv4();
    const orderCustomId = uuid.replace(/-/g, "").substring(0, 10);

    const orderArray: IOrder["orderItem"] = orderItem.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (order: any, index: number) => {
        const orderSubRef = `${orderCustomId}-${index + 1000}`;
        subtotal += order.subtotal;
        return {
          orderSubRef,
          orderType: order.orderType,
          mediaId: order.mediaId,
          quantity: order.quantity,
          route: order.route,
          price: order.price,
          subtotal: order.subtotal,
          duration: order.duration,
        };
      }
    );

    // Check if subtotal matches subTotal
    if (subtotal !== amount.subTotal) {
      throw new BadRequest(
        "Subtotal does not match the provided subTotal amount",
        "INVALID_REQUEST_PARAMETERS"
      );
    }

    // Calculate totalAmount
    const totalAmount = amount.subTotal + amount.vat + amount.delivery;

    // Check if totalAmount matches provided totalAmount
    if (totalAmount !== amount.totalAmount) {
      throw new BadRequest(
        "TotalAmount does not match the calculated totalAmount",
        "INVALID_REQUEST_PARAMETERS"
      );
    }

    // Create the order
    const order = new Order({
      userId,
      orderCustomId,
      amount,
      paymentStatus,
      paymentMethod,
      paymentType,
      orderItem: orderArray,
      orderStatus: "Pending",
    });

    // Save the order
    const savedOrder = await order.save();
    if (!savedOrder) {
      throw new BadRequest(
        "Failed to create order",
        "INVALID_REQUEST_PARAMETERS"
      );
    }
    const notificationPayload = {
      userId: req.loggedInAccount._id,
      title: "Order Status Updated",
      content: `Order:${savedOrder.orderCustomId}, created successfully`,
      activityType: "Order",
      orderId:savedOrder._id,
    };
    await notifications.createNotification(notificationPayload);
    return res.ok({
      order: savedOrder,
      message:
        "Order created successfully, pay within 1-3 hours to avoid order being cancelled.",
    });
  }

  //pay later
  async payNowOrderwithPaystack(req: Request, res: Response) {
    const userId = req.loggedInAccount._id;
    const email = req.loggedInAccount.email;

    const { error, data } = validators.createOrderValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);

    const { orderItem, amount, paymentMethod, paymentStatus, paymentType } =
      data;
    if (!orderItem || orderItem.length < 1) {
      throw new BadRequest(
        "No Item in the Order items provided",
        "INVALID_REQUEST_PARAMETERS"
      );
    }

    // Calculate subtotal and generate orderSubRef
    let subtotal = 0;
    const uuid = uuidv4();
    const orderCustomId = uuid.replace(/-/g, "").substring(0, 10);

    const orderArray: IOrder["orderItem"] = orderItem.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (order: any, index: number) => {
        const orderSubRef = `${orderCustomId}-${index + 1000}`;
        subtotal += order.subtotal;
        return {
          orderSubRef,
          orderType: order.orderType,
          mediaId: order.mediaId,
          quantity: order.quantity,
          route: order.route,
          price: order.price,
          subtotal: order.subtotal,
          duration: order.duration,
        };
      }
    );

    // Check if subtotal matches subTotal
    if (subtotal !== amount.subTotal) {
      throw new BadRequest(
        "Subtotal does not match the provided subTotal amount",
        "INVALID_REQUEST_PARAMETERS"
      );
    }

    // Calculate totalAmount
    const totalAmount = amount.subTotal + amount.vat + amount.delivery;

    // Check if totalAmount matches provided totalAmount
    if (totalAmount !== amount.totalAmount) {
      throw new BadRequest(
        "TotalAmount does not match the calculated totalAmount",
        "INVALID_REQUEST_PARAMETERS"
      );
    }

    // Create the order
    const order = new Order({
      userId,
      orderCustomId,
      amount,
      paymentStatus,
      paymentMethod,
      paymentType,
      orderItem: orderArray,
      orderStatus: "Pending",
    });

    // Save the order
    const savedOrder = await order.save();
    if (!savedOrder) {
      throw new BadRequest(
        "Failed to create order",
        "INVALID_REQUEST_PARAMETERS"
      );
    }
    const orderPaystack = {
      email,
      amount: savedOrder.amount.totalAmount,
      metadata: {
        paymentType: "Order",
        savedOrder,
      },
    };
    //create the payment link
    const response = await PaystackService.payWithPaystack(
      orderPaystack.email,
      orderPaystack.amount,
      orderPaystack.metadata
    );
    console.log(response);
    if (!response) {
      throw new ServerError(
        "Initiate payment failed",
        "THIRD_PARTY_API_FAILURE"
      );
    }

    return res.ok({
      order: savedOrder,
      redirectUrl: response,
      messageLink: "Order payment link created.",
      messageOrder:
        "Order created successfully, pay within 1-3 hours to avoid order being cancelled.",
    });
  }

  //generate link for payment
  async generatePaymentLinkForOrderwithPaystack(req: Request, res: Response) {
    const email = req.loggedInAccount.email;

    // Extract order _id from request parameters
    const orderId = req.params.orderId;
    if (!orderId) {
      throw new ResourceNotFound("Order id not found", "RESOURCE_NOT_FOUND");
    }
    // Retrieve order details from the database
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ResourceNotFound("Order not found", "RESOURCE_NOT_FOUND");
    }

    if (order.paymentStatus === "Success") {
      throw new BadRequest(
        "Order has been previously paid for",
        "INVALID_REQUEST_PARAMETERS"
      );
    }

    const orderPaystack = {
      email,
      amount: order.amount.totalAmount,
      metadata: {
        paymentType: "Order",
        savedOrder: order,
      },
    };

    // Generate Paystack payment link
    const paymentLink = await PaystackService.payWithPaystack(
      orderPaystack.email,
      orderPaystack.amount,
      orderPaystack.metadata
    );

    // Return the payment link to the user
    return res.ok({
      paymentLink,
      message: "Payment link generated successfully.",
    });
  }

  async getAllOrdersAdmin(req: Request, res: Response) {
    const queryParams: QueryParams = req.query;
    const startDate = getStartDate(queryParams.startDate);
    const endDate = getEndDate(queryParams.endDate);
    const limit = getLimit(queryParams.limit);
    const page = getPage(queryParams.page);
    const orderStatus = queryParams.orderStatus;
    const paymentStatus = queryParams.paymentStatus;
    const paymentMethod = queryParams.paymentMethod;

    // Construct the query object based on the provided parameters
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {
      createdAt: { $gte: startDate, $lte: endDate },
    };

    if (orderStatus) {
      query.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    // Find orders based on the constructed query
    const orders = await Order.find(query)
      .sort({ createdAt: -1 }) // Descending order by createdAt
      .limit(limit)
      .skip(limit * (page - 1))
      .populate({
        path: "userId",
        select: "userCustomId firstname lastname email phoneNumber", // Specify fields to populate
      }) // Populate user details
      .populate({
        path: "orderItem.mediaId",
        model: "billboardMediaApplication", // Populate billboard if media is available.
      });
    // .populate({
    //   path: "orderItem.printId",
    //   model: "printMediaApplication", // Populate print
    // });

    const totalOrders = await Order.countDocuments(query);

    res.ok({ orders, totalOrders }, { page, limit, startDate, endDate });
  }

  // Get All Orders by User
  async getAllOrdersUser(req: Request, res: Response) {
    const userId = req.loggedInAccount._id;

    const queryParams: QueryParams = req.query;
    const startDate = getStartDate(queryParams.startDate);
    const endDate = getEndDate(queryParams.endDate);
    const limit = getLimit(queryParams.limit);
    const page = getPage(queryParams.page);
    const orderStatus = queryParams.orderStatus;
    const paymentStatus = queryParams.paymentStatus;
    const paymentMethod = queryParams.paymentMethod;

    // Construct the query object based on the provided parameters
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {
      createdAt: { $gte: startDate, $lte: endDate },
      userId,
    };

    if (orderStatus) {
      query.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    // Find orders based on the constructed query
    const orders = await Order.find(query)
      .sort({ createdAt: -1 }) // Descending order by createdAt
      .limit(limit)
      .skip(limit * (page - 1))
      .populate({
        path: "userId",
        select: "userCustomId firstname lastname email phoneNumber", // Specify fields to populate
      }) // Populate user details
      .populate({
        path: "orderItem.mediaId",
        model: "billboardMediaApplication", // Populate billboard if media is available.
      });
    // .populate({
    //   path: "orderItem.printId",
    //   model: "printMediaApplication", // Populate print
    // });

    const totalOrders = await Order.countDocuments(query);

    res.ok({ orders, totalOrders }, { page, limit, startDate, endDate });
  }

  // Get User Order By Id
  async getOrderByIdUser(req: Request, res: Response) {
    const userId = req.loggedInAccount._id;

    const { orderId } = req.params;
    if (!orderId) {
      throw new ResourceNotFound("orderId is missing.", "RESOURCE_NOT_FOUND");
    }

    const order = await Order.findOne({
      _id: orderId,
      userId,
    })
      .populate({
        path: "userId",
        select: "userCustomId firstname lastname email phoneNumber", // Specify fields to populate
      }) // Populate user details
      .populate({
        path: "orderItem.mediaId",
        model: "billboardMediaApplication", // Populate billboard if media is available.
      });
    // .populate({
    //   path: "orderItem.printId",
    //   model: "printMediaApplication", // Populate print
    // });

    if (!order) {
      throw new ResourceNotFound(
        "Order not found or not associated with your account.",
        "RESOURCE_NOT_FOUND"
      );
    }

    if (order.userId._id.toString() !== userId.toString()) {
      throw new BadRequest(
        "You can not access order you didn't create.",
        "INVALID_REQUEST_PARAMETERS"
      );
    }

    res.ok(order);
  }
  // Get Admin Order By Id
  async GetOrderByIdAdmin(req: Request, res: Response) {
    const { orderId } = req.params;
    if (!orderId) {
      throw new ResourceNotFound("orderId is missing.", "RESOURCE_NOT_FOUND");
    }

    const order = await Order.findById(orderId)
      .populate({
        path: "userId",
        select: "userCustomId firstname lastname email phoneNumber", // Specify fields to populate
      }) // Populate user details
      .populate({
        path: "orderItem.mediaId",
        model: "billboardMediaApplication", // Populate billboard if media is available.
      });
    // .populate({
    //   path: "orderItem.printId",
    //   model: "printMediaApplication", // Populate print
    // });

    if (!order) {
      throw new ResourceNotFound(
        `Order with ID ${orderId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.ok(order);
  }

  // // Get a Order by CustomId
  async GetOrderByCustomAdmin(req: Request, res: Response) {
    const { orderCustomId } = req.params;
    if (!orderCustomId) {
      throw new ResourceNotFound(
        "order CustomId is missing.",
        "RESOURCE_NOT_FOUND"
      );
    }

    const order = await Order.findOne({ orderCustomId })
      .populate({
        path: "userId",
        select: "userCustomId firstname lastname email phoneNumber", // Specify fields to populate
      }) // Populate user details
      .populate({
        path: "orderItem.mediaId",
        model: "billboardMediaApplication", // Populate billboard if media is available.
      });
    // .populate({
    //   path: "orderItem.printId",
    //   model: "printMediaApplication", // Populate print
    // });
    if (!order) {
      throw new ResourceNotFound(
        `Order with ID ${orderCustomId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.ok(order);
  }

  // update Order details By Id: only(payment status)
  async updateOrderdetailsById(req: Request, res: Response) {
    const { orderId } = req.params;
    if (!orderId) {
      throw new ResourceNotFound("orderId is missing.", "RESOURCE_NOT_FOUND");
    }
    const { error, data } = validators.updateOrderValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { ...data },
      { new: true }
    );

    if (!updatedOrder) {
      throw new BadRequest(
        "order details can not be updated, try again later.",
        "INVALID_REQUEST_PARAMETERS"
      );
    }

    return res.ok({
      message: "Order updated successfully",
      updatedOrder,
    });
  }

  // Update Order Status By Id
  async updateOrderStatusById(req: Request, res: Response) {
    const { orderId } = req.params;
    if (!orderId) {
      throw new ResourceNotFound("orderId is missing.", "RESOURCE_NOT_FOUND");
    }
    const { error, data } = validators.updateOrderStatusValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: data.orderStatus },
      { new: true }
    );

    if (!updatedOrder) {
      throw new BadRequest(
        "order status can not be updated, try again later.",
        "INVALID_REQUEST_PARAMETERS"
      );
    }

    return res.ok({
      message: "Order status updated successfully",
      updatedOrder,
    });
  }

  // Delete Order By Id
  async deleteOrderById(req: Request, res: Response) {
    const { orderId } = req.params;
    if (!orderId) {
      throw new ResourceNotFound("orderId is missing.", "RESOURCE_NOT_FOUND");
    }

    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      throw new ResourceNotFound("order not found.", "RESOURCE_NOT_FOUND");
    }

    return res.ok({
      message: "Order deleted successfully",
    });
  }
}

export default new OrderController();
