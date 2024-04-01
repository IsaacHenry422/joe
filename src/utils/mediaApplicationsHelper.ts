type QueryParams = {
  startDate?: Date;
  endDate?: Date;
  limit?: string;
  page?: string;
  brtType?: string;
  mediaType?: string;
  status?: string;
  listingTitle?: string;
  route?: string;
  state?: string;
  cityLga?: string;
  landmark?: string;
  price?: string;
  dimension?: string;
  nextAvailable?: Date;
  amountAvailable?: string;
  minPrice?: string;
  maxPrice?: string;
};

class applicationMediaHelper {
  filter = async (queryParams: QueryParams) => {
    const orConditions = [];

    if (queryParams.mediaType) {
      orConditions.push({ mediaType: queryParams.mediaType });
    }
    if (queryParams.status) {
      orConditions.push({ status: queryParams.status });
    }
    if (queryParams.brtType) {
      orConditions.push({ brtType: queryParams.brtType });
    }
    if (queryParams.amountAvailable) {
      orConditions.push({ amountAvailable: queryParams.amountAvailable });
    }
    if (queryParams.cityLga) {
      orConditions.push({ cityLga: queryParams.cityLga });
    }
    if (queryParams.dimension) {
      orConditions.push({ dimension: queryParams.dimension });
    }
    if (queryParams.landmark) {
      orConditions.push({ landmark: queryParams.landmark });
    }
    if (queryParams.listingTitle) {
      orConditions.push({ listingTitle: queryParams.listingTitle });
    }
    if (queryParams.nextAvailable) {
      orConditions.push({ nextAvailable: queryParams.nextAvailable });
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
    if (queryParams.route) {
      orConditions.push({ route: queryParams.route });
    }
    if (queryParams.state) {
      orConditions.push({ state: queryParams.state });
    }

    return orConditions;
  };
}

export default new applicationMediaHelper();
