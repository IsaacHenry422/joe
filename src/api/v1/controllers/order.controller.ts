import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

import Order, { IOrder } from "../../../db/models/order.model";
import User from "../../../db/models/user.model";

import MediaApplication from "../../../db/models/mediaApplication.model";
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

  // Get all orders by admin
  async GetAllOrdersAdmin(req: Request, res: Response) {
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
      .sort({ createdAt: 1 })
      .limit(limit)
      .skip(limit * (page - 1));

    // Fetch customer details and media details for each order
    for (const order of orders) {
      // Fetch user details from the User model using userId
      const user = await User.findById(order.userId);

      if (user) {
        // Construct the customer object
        const customer = {
          _id: user._id,
          userCustomId: user.userCustomId,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          phoneNumber: user.phoneNumber,
        };

        // Add the customer object to the order
        order.customer = customer;
      }

      // Iterate through orderItem array and fetch media details if mediaId is available
      for (const item of order.orderItem) {
        if (item.mediaId) {
          // Fetch media details from the MediaApplication model using mediaId
          const media = await MediaApplication.findById(item.mediaId);

          if (media) {
            // Construct the media object
            const mediaDetails = {
              _id: media._id,
              mediaCustomId: media.mediaCustomId,
              listingTitle: media.listingTitle,
              pictures: media.pictures,
              description: media.description,
              address: media.address,
            };

            // Add the media object to the orderItem
            item.media = mediaDetails;
          }
        }
      }
    }

    const totalOrders = await Order.countDocuments(query);

    res.ok({ orders, totalOrders }, { page, limit, startDate, endDate });
  }

  // GetOrderByQueryParamsAdmin
  // async GetOrderByQueryParamsAdmin(req: Request, res: Response) {
  //   const queryParams: QueryParams = req.query;
  //   const startDate = getStartDate(queryParams.startDate);
  //   const endDate = getEndDate(queryParams.endDate);
  //   const limit = getLimit(queryParams.limit);
  //   const page = getPage(queryParams.page);

  //   const orders = Order.find({
  //     createdAt: { $gte: startDate, $lte: endDate },
  //   })
  //     .sort({ createdAt: 1 })
  //     .limit(limit)
  //     .skip(limit * (page - 1));

  //   const totalOrders = await Order.countDocuments(orders);

  //   res.ok({ orders, totalOrders }, { page, limit, startDate, endDate });
  // }

  // UpdateOrderStatusById

  // GetAllOrdersUser
  // GetUserOrderById
  // TrackOrderById
}

export default new OrderController();
