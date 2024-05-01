type QueryParams = {
  startDate?: Date;
  endDate?: Date;
  limit?: string;
  page?: string;
  prototypeId?: string;
  price?: string;
  minPrice?: string;
  maxPrice?: string;
};

class applicationMediaHelper {
  filter = async (queryParams: QueryParams) => {
    const orConditions = [];

    if (queryParams.prototypeId) {
      orConditions.push({ prototypeId: queryParams.prototypeId });
    }
    if (queryParams.price) {
      orConditions.push({ price: queryParams.price });
    } else if (queryParams.minPrice && queryParams.maxPrice) {
      orConditions.push({
        price: { $gte: queryParams.minPrice, $lte: queryParams.maxPrice },
      });
    } else if (queryParams.minPrice) {
      orConditions.push({ price: { $gte: queryParams.minPrice } });
    } else if (queryParams.maxPrice) {
      orConditions.push({ price: { $lte: queryParams.maxPrice } });
    }

    return orConditions;
  };
}

export default new applicationMediaHelper();
