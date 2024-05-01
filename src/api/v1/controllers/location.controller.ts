import { Request, Response } from "express";
import { ResourceNotFound, ServerError } from "../../../errors/httpErrors";

import LocationService from "../../../services/location.service";

class LocationController {
  async getAllCountries(req: Request, res: Response) {
    const response = await LocationService.allCountries();
    if (!response) {
      throw new ServerError("Location fetch failed", "THIRD_PARTY_API_FAILURE");
    }

    return res.ok({
      countries: response,
      message: "Countries returned.",
    });
  }

  async getAllStatesByCountry(req: Request, res: Response) {
    const { ciso } = req.params;

    if (!ciso) {
      throw new ResourceNotFound(
        "Country code is missing.",
        "RESOURCE_NOT_FOUND"
      );
    }

    const response = await LocationService.allStatesByCountry(ciso);
    if (!response) {
      throw new ServerError("State fetch failed", "THIRD_PARTY_API_FAILURE");
    }

    return res.ok({
      states: response,
      message: "States returned.",
    });
  }

  async getAllCitiesInCountry(req: Request, res: Response) {
    const { ciso } = req.params;

    if (!ciso) {
      throw new ResourceNotFound(
        "Country code is missing.",
        "RESOURCE_NOT_FOUND"
      );
    }

    const response = await LocationService.allCitiesInCountry(ciso);
    if (!response) {
      throw new ServerError("Cities fetch failed", "THIRD_PARTY_API_FAILURE");
    }

    return res.ok({
      states: response,
      message: "Cities returned.",
    });
  }

  async getAllCitiesInStateAndCountry(req: Request, res: Response) {
    const { ciso, siso } = req.params;

    if (!ciso || !siso) {
      throw new ResourceNotFound(
        "Country code is missing.",
        "RESOURCE_NOT_FOUND"
      );
    }

    const response = await LocationService.allCitiesInStateAndCountry(
      ciso,
      siso
    );
    if (!response) {
      throw new ServerError(
        "cities and states fetch failed",
        "THIRD_PARTY_API_FAILURE"
      );
    }

    return res.ok({
      states: response,
      message: "Cities returned.",
    });
  }
}
export default new LocationController();
