import { Request, Response } from "express";
import { BadRequest, ResourceNotFound } from "../../../errors/httpErrors";
import RequestPlan from "../../../db/models/requestPlan.model";
import * as validators from "../validators/requestPlan.validator";
import {
  getLimit,
  getPage,
  getStartDate,
  getEndDate,
} from "../../../utils/dataFilters";

type QueryParams = {
  startDate?: Date;
  endDate?: Date;
  limit?: string;
  page?: string;
};

class RequestPlanController {
  async createRequestPlan(req: Request, res: Response) {
    const { error, data } = validators.createRequestPlanValidator(req.body);
    if (error) {
      throw new BadRequest(error.message, error.code);
    }

    const {
      name,
      phoneNumber,
      email,
      companyName,
      companyAddress,
      state,
      derivedCustomerAction,
      intendedTargetAudience,
      intendedDeliverable,
      keyCampaignTiming,
      campaignObjectives,
      scopeOfIntendedCampaign,
    } = data;

    const requestPlan = new RequestPlan({
      name,
      phoneNumber,
      email,
      companyName,
      companyAddress,
      state,
      derivedCustomerAction,
      intendedTargetAudience,
      intendedDeliverable,
      keyCampaignTiming,
      campaignObjectives,
      scopeOfIntendedCampaign,
    });

    const newRequestPlan = await requestPlan.save();

    res.created({
      requestPlan: newRequestPlan,
      message: "Request plan created successfully.",
    });
  }

  async updateRequestPlan(req: Request, res: Response) {
    const { requestId } = req.params;

    const { error, data } = validators.updateRequestPlanValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);

    const updatedRequestPlan = await RequestPlan.findByIdAndUpdate(
      requestId,
      data,
      { new: true }
    );
    if (!updatedRequestPlan) {
      throw new ResourceNotFound(
        `Request plan with ID ${requestId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }
    res.ok({
      updatedRequestPlan,
      message: "Request plan updated successfully.",
    });
  }

  async getRequestPlans(req: Request, res: Response) {
    const queryParams: QueryParams = req.query;
    const startDate = getStartDate(queryParams.startDate);
    const endDate = getEndDate(queryParams.endDate);
    const limit = getLimit(queryParams.limit);
    const page = getPage(queryParams.page);

    const query = await RequestPlan.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .sort({ createdAt: 1 })
      .limit(limit)
      .skip(limit * (page - 1));

    const totalRequestPlans = await RequestPlan.countDocuments(query);

    res.ok(
      { total: totalRequestPlans, requestPlans: query },
      { page, limit, startDate, endDate }
    );
  }

  async getRequestPlanById(req: Request, res: Response) {
    const { requestId } = req.params;
    if (!requestId) {
      throw new ResourceNotFound(
        "Request plan ID is missing.",
        "RESOURCE_NOT_FOUND"
      );
    }

    const requestPlan = await RequestPlan.findById(requestId);
    if (!requestPlan) {
      throw new ResourceNotFound(
        `Request plan with ID ${requestId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.ok(requestPlan);
  }

  async deleteRequestPlanById(req: Request, res: Response) {
    const { requestId } = req.params;
    if (!requestId) {
      throw new BadRequest(
        "Request plan ID is missing.",
        "MISSING_REQUIRED_FIELD"
      );
    }

    const deletedRequestPlan = await RequestPlan.findByIdAndDelete(requestId);
    if (!deletedRequestPlan) {
      throw new ResourceNotFound(
        `Request plan with ID ${requestId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.noContent();
  }
}

export default new RequestPlanController();
