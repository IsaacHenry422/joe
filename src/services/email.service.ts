/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendMail, EmailOptions } from "../utils/emailHelpers";
import dotenv from "dotenv";

dotenv.config();

async function welcomeNotification(
  email: string,
  firstname: string
): Promise<void> {
  const options: EmailOptions = {
    to: email,
    subject: "Welcome to Vaad Media",
    template: "welcome",
    variables: {
      firstname,
    },
  };

  await sendMail(options);
}

async function resetPasswordEmail(
  email: string,
  firstname: string,
  otp: string
): Promise<void> {
  const options: EmailOptions = {
    to: email,
    subject: "Reset Password",
    template: "forgot-password",
    variables: {
      firstname,
      otp,
    },
  };
  await sendMail(options);
}

async function subscriptionNotification({
  email,
  ...variables
}: {
  email: string;
  [key: string]: any;
}): Promise<void> {
  const options: EmailOptions = {
    to: email,
    subject: "Subscription Confirmation",
    template: "subscription-confirmation",
    variables,
  };

  await sendMail(options);
}

async function subscriptionExpiredNotification(user: {
  email: string;
  firstName: string;
}): Promise<void> {
  const options: EmailOptions = {
    to: user.email,
    subject: "Your Subscription Has Expired",
    template: "subscription-ended",
    variables: { firstName: user.firstName },
  };

  await sendMail(options);
}

export {
  welcomeNotification,
  resetPasswordEmail,
  subscriptionNotification,
  subscriptionExpiredNotification,
};
