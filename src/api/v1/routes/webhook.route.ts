import express from "express";
import WebhookController from "../controllers/webhook.controller";

const webhookRouter = express.Router();

// Create a new subscription plan (admin route)
webhookRouter.post("/paystack", WebhookController.paystackWebhook);

export default webhookRouter;
