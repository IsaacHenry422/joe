/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendMail, EmailOptions } from "../utils/emailHelpers";
import dotenv from "dotenv";

dotenv.config();

async function verifyEmailNotification(
  email: string,
  firstname: string,
  link: string
): Promise<void> {
  const options: EmailOptions = {
    to: email,
    subject: "Verify your Email address",
    template: "signup-users",
    variables: {
      name: firstname,
      link,
      email,
    },
  };
  await sendMail(options);
}

async function welcomeNotification(
  email: string,
  firstname: string
): Promise<void> {
  const options: EmailOptions = {
    to: email,
    subject: "Welcome to Vaad Media",
    template: "user-welcome",
    variables: {
      name: firstname,
      email,
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
    subject: "Reset Your Vaad Account Password",
    template: "forgot-password",
    variables: {
      name: firstname,
      link: otp,
      email,
    },
  };
  await sendMail(options);
}

async function successChangedPasswordEmail(
  email: string,
  firstname: string,
  otp: string
): Promise<void> {
  const options: EmailOptions = {
    to: email,
    subject: "Your Vaad PIN Has Been Changed Successfully",
    template: "changed-password",
    variables: {
      firstname,
      otp,
      email,
    },
  };
  await sendMail(options);
}

async function successOrderNotification({
  email,
  ...variables
}: {
  email: string;
  [key: string]: any;
}): Promise<void> {
  const options: EmailOptions = {
    to: email,
    subject: "Your order was a success",
    template: "sucesss-order",
    variables,
  };

  await sendMail(options);
}

async function pendingOrderNotification({
  email,
  ...variables
}: {
  email: string;
  [key: string]: any;
}): Promise<void> {
  const options: EmailOptions = {
    to: email,
    subject: "Your order payment is still pending",
    template: "pending-order-payment",
    variables,
  };

  await sendMail(options);
}

async function expiredOrderNotification({
  email,
  ...variables
}: {
  email: string;
  [key: string]: any;
}): Promise<void> {
  const options: EmailOptions = {
    to: email,
    subject: "Your order will expire in 48 hours",
    template: "expired-order",
    variables,
  };

  await sendMail(options);
}

async function invoiceNotification({
  email,
  ...variables
}: {
  email: string;
  [key: string]: any;
}): Promise<void> {
  const options: EmailOptions = {
    to: email,
    subject: "Your Invoice is ready, pay now!",
    template: "new-invoice",
    variables,
  };

  await sendMail(options);
}

async function successInvoiceNotification({
  email,
  ...variables
}: {
  email: string;
  [key: string]: any;
}): Promise<void> {
  const options: EmailOptions = {
    to: email,
    subject: "Your Invoice payment is successful",
    template: "success-invoice",
    variables,
  };

  await sendMail(options);
}

export {
  verifyEmailNotification,
  welcomeNotification,
  resetPasswordEmail,
  successChangedPasswordEmail,
  successOrderNotification,
  pendingOrderNotification,
  expiredOrderNotification,
  invoiceNotification,
  successInvoiceNotification,
};
