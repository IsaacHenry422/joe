import { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

class WebhookController {
  //function to verify Webhook Signature
  async paystackWebhook(req: Request, res: Response) {
    const body = JSON.stringify(req.body);

    console.log(body);

    return res.sendStatus(403); // 403 Forbidden
  }
}

export default new WebhookController();
