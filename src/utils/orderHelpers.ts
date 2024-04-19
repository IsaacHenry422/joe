async function handleOrderValidation(order: any): Promise<void> {
  if (order.orderType === "Media") {
    if (!order.duration || !order.mediaId) {
      throw new BadRequest(
        `please provide the complete order details for the media ${order.mediaId}`,
        "INVALID_REQUEST_PARAMETERS"
      );
    }

    const media = await MediaApplication.findOne({
      _id: order.mediaId,
    });

    if (order.price !== media?.price) {
      throw new BadRequest(
        `please provide the correct price for the media ${order.mediaId}`,
        "INVALID_REQUEST_PARAMETERS"
      );
    }

    const innerSubTotal = order.quantity * parseInt(media.price);
    if (innerSubTotal !== order.subtotal) {
      throw new BadRequest(
        `please provide the correct price for the media ${order.mediaId}`,
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

    const print = await PrintMedia.findOne({
      _id: order.printId,
    });

    if (order.price !== print?.price) {
      throw new BadRequest(
        `please provide the correct price for the print ${order.printId}`,
        "INVALID_REQUEST_PARAMETERS"
      );
    }

    const innerSubTotal = order.quantity * parseInt(print.price);
    if (innerSubTotal !== order.subtotal) {
      throw new BadRequest(
        `please provide the correct price for the media ${order.printId}`,
        "INVALID_REQUEST_PARAMETERS"
      );
    }
  } else {
    throw new BadRequest(
      `Invalid order type supplied`,
      "INVALID_REQUEST_PARAMETERS"
    );
  }
}
