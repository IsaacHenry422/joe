import express from "express";
import WebhookController from "../controllers/webhook.controller";

const webhookRouter = express.Router();

//paystack webhook
webhookRouter.post("/paystack", WebhookController.paystackWebhook);

export default webhookRouter;
