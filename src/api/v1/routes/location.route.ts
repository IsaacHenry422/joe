import express from "express";
import controller from "../controllers/location.controller";

const locationRouter = express.Router();

locationRouter.get("/", controller.getAllCountries);

locationRouter.get("/:ciso", controller.getAllStatesByCountry);

locationRouter.get("/cities/:ciso", controller.getAllCitiesInCountry);

locationRouter.get(
  "/:ciso/cities/:siso",
  controller.getAllCitiesInStateAndCountry
);

export default locationRouter;
