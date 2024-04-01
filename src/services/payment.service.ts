// paypalService.ts
import axios, { AxiosResponse } from "axios";
import dotenv from "dotenv";

dotenv.config();

const paystackAxios = axios.create({
  baseURL: "https://api.paystack.co/",
  headers: {
    Authorization: "Bearer " + process.env.PAYSTACK_SECRET,
    "Content-Type": "application/json",
  },
});

// Define a type or interface for the payment payload
interface PaystackPayload {}

class PaystackService {
  // Function to obtain the paystack access token from an endpoint
  async payWithPaystack(
    email: string,
    amount: number,
    metadata: PaystackPayload
  ): Promise<string> {
    // Payments must be converted to kobo or the lowest denomination of that currency
    const actualAmount = amount * 100;

    const payload = { email, amount: actualAmount, metadata };

    const response: AxiosResponse = await paystackAxios.post(
      "/transaction/initialize",
      payload
    );

    return response.data.data.authorization_url;
  }
}

export default new PaystackService();

// https://ravebooking.onrender.com/api/v1/webhooks/paystackwebhook
