import BillboardApplication from "../db/models/billboardMedia.model";
import PrintApplication from "../db/models/printMedia.model";
import { BadRequest, ResourceNotFound } from "../errors/httpErrors";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleOrderValidation(order: any) {
  if (order.orderType === "Billboard") {
    if (!order.duration || !order.billboardId) {
      throw new BadRequest(
        `please provide the complete order details for the billboard ${order.billboardId}`,
        "INVALID_REQUEST_PARAMETERS"
      );
    }

    const billboard = await BillboardApplication.findOne({
      _id: order.billboardId,
    });

    if (!billboard) {
      throw new ResourceNotFound("billboard not found", "RESOURCE_NOT_FOUND");
    }

    if (order.price !== billboard?.price) {
      throw new BadRequest(
        `please provide the correct price for the billboard ${order.billboardId}`,
        "INVALID_REQUEST_PARAMETERS"
      );
    }

    const innerSubTotal =
      order.quantity * order.duration.totalDuration * billboard!.price;

    if (innerSubTotal !== order.subtotal) {
      throw new BadRequest(
        `please provide the correct subtotal for the billboard ${order.billboardId}`,
        "INVALID_REQUEST_PARAMETERS"
      );
    }
  } else if (order.orderType === "Print") {
    if (!order.deliveryMethod || !order.printId) {
      throw new BadRequest(
        `please provide the complete order details for the print ${order.printId}`,
        "INVALID_REQUEST_PARAMETERS"
      );
    }

    const print = await PrintApplication.findOne({
      _id: order.printId,
    });
    if (!print) {
      throw new ResourceNotFound("print not found", "RESOURCE_NOT_FOUND");
    }

    if (order.price !== print?.price) {
      throw new BadRequest(
        `please provide the correct price for the print ${order.printId}`,
        "INVALID_REQUEST_PARAMETERS"
      );
    }

    const innerSubTotal = order.quantity * print!.price;
    if (innerSubTotal !== order.subtotal) {
      throw new BadRequest(
        `please provide the correct subtotal for the print ${order.printId}`,
        "INVALID_REQUEST_PARAMETERS"
      );
    }
  } else {
    throw new BadRequest(
      `Invalid order type supplied- ${order.orderType}`,
      "INVALID_REQUEST_PARAMETERS"
    );
  }
}

export { handleOrderValidation };
