import { Request, Response } from "express";
// import { v4 as uuidv4 } from "uuid";

// import Order, { IOrder } from "../../../db/models/order.model";
//  import MediaApplication, {
//  IMediaApplication,
// } from "../../../db/models/mediaApplication.model";
// import PaystackService from "../../../services/payment.service";

// import{
// BadRequest,
// ResourceNotFound,
// ServerError,
//  } from "../../../errors/httpErrors";

// import * as validators from "../validators/order.validator";
// const yourBaseURL = process.env.BASE_URL!;

class OrderController {
  async createOrder(req: Request, res: Response) {
    const userId = req.loggedInAccount._id;
    // const { error, data } = validators.createOrderValidator(req.body);
    // if (error) throw new BadRequest(error.message, error.code);
    // const { products, paymentDetails, deliveryDetails } = data;
    // if (!products || products.length < 1) {
    //   throw new BadRequest(
    //     "No product in the cart items provided",
    //     "INVALID_REQUEST_PARAMETERS"
    //   );
    // }
    // const productArray = [];
    // let subtotal = 0;
    // const orderRef = uuidv4();
    // for (let i = 0; i < products.length; i++) {
    //   const product = products[i];
    //   const dbProduct = await Product.findOne({ _id: product.productId });
    //   if (!dbProduct) {
    //     throw new ResourceNotFound(
    //       `No product with id : ${product.productId}`,
    //       "RESOURCE_NOT_FOUND"
    //     );
    //   }
    //   const { productPrice, _id } = dbProduct;
    //   const orderSubRef = `${orderRef}-${i + 1000}`; // Calculate orderSubRef dynamically
    //   const singleProductItem = {
    //     orderSubRef,
    //     productId: _id,
    //     quantity: product.quantity,
    //     color: product.color,
    //     size: product.size,
    //     price: productPrice,
    //     subtotal: product.quantity * productPrice,
    //   };
    //   subtotal += singleProductItem.subtotal;
    //   productArray.push(singleProductItem);
    // }
    // const shippingFee = paymentDetails.shippingFee || 0;
    // const tax = paymentDetails.tax || 0;
    // const totalAmount = subtotal + shippingFee + tax;
    // const totalSubAmount = subtotal;
    // const orderPayload = {
    //   buyerId,
    //   orderRef,
    //   products: productArray,
    //   orderDetails: {
    //     noOfItems: products.length,
    //     // orderStatus
    //   },
    //   paymentDetails: {
    //     paymentMethod: paymentDetails.paymentMethod,
    //     totalAmount,
    //     totalSubAmount,
    //     shippingFee,
    //     tax,
    //     // paymentRef, paymentStatus
    //   },
    //   deliveryDetails,
    //   // expectedDeliveryStart,
    //   // expectedDeliveryEnd,
    // };
    // const orderPaypal = {
    //   intent: "CAPTURE",
    //   purchase_units: [
    //     {
    //       amount: {
    //         // reference_id: "d9f80740-38f0-11e8-b467-0ed5f89f718b",
    //         currency_code: "USD",
    //         value: orderPayload.paymentDetails.totalAmount.toString(),
    //       },
    //     },
    //   ],
    // };
    // const result = await PaypalService.orderPayment(orderPaypal);
    // console.log(result);
    // if (!result) {
    //   throw new ServerError(
    //     "Initiate payment failed",
    //     "THIRD_PARTY_API_FAILURE"
    //   );
    // }
    // const approveLink = result.links.find(
    //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //   (link: any) => link.rel === "approve"
    // );
    // if (approveLink) {
    //   const approvalUrl = approveLink.href;
    //   // Redirect the user to the approval URL, which will take them to PayPal for payment approval

    return res.ok({
      userId,
      message: "Order payment link created.",
    });
  }
}

export default new OrderController();
