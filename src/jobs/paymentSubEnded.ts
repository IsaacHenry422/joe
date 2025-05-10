// import OrderModel from "../db/models/order.model";

// export default async (): Promise<void> => {
//   try {
//     // Calculate the expiration date as 7 days from now
//     const expirationDate = new Date();
//     expirationDate.setDate(expirationDate.getDate() - 7);

//     // Find orders where the end date has passed the expiration date and payment status is pending
//     const filter = {
//       paymentStatus: "Pending",
//       "orderItem.duration.endDate": { $lte: expirationDate },
//       orderStatus: { $ne: "Expired" }, // Only process orders that are not already expired
//     };

//     // Update the status of expired orders to "Expired"
//     const update = {
//       $set: { "orderItem.$[elem].orderStatus": "Expired" },
//     };

//     const options = {
//       arrayFilters: [{ "elem.duration.endDate": { $lte: expirationDate } }],
//       multi: true,
//     };

//     // Perform the update operation
//     const result = await OrderModel.updateMany(filter, update, options);

//     const updated = result.modifiedCount;
//     // Log the number of updated records
//     console.log(
//       `Activated cron job to update pending unpaid orders to expired orders. Updated ${updated} records.`
//     );
//   } catch (error) {
//     console.error(
//       "Error in activating cron job to update pending unpaid orders to expired orders:",
//       error
//     );
//   }
// };
