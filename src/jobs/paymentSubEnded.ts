import OrderModel, { IOrder } from "../db/models/order.model";

export default async (): Promise<void> => {
  try {
    // Find orders where the end date has passed the current date
    const expiredOrders = await OrderModel.find({
      paymentStatus: false,
      "orderItem.duration.endDate": { $lte: new Date() },
      orderStatus: { $ne: "Expired" }, // Only process orders that are not already expired
    });

    // Update the status of expired orders to "Expired"
    await Promise.allSettled(
      expiredOrders.map(async (order: IOrder) => {
        order.orderStatus = "Expired";
        await order.save();
      })
    );
    console.log("Activated cron job to update expired orders");
  } catch (error) {
    console.error("Error in activating cron job:", error);
  }
};
