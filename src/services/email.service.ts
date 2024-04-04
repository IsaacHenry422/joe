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
    template: "user-welcome",
    variables: {
      name: firstname,
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
      name: firstname,
      link: otp,
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
    subject: "Password changed Successfully",
    template: "changed-password",
    variables: {
      firstname,
      otp,
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

async function failedOrderNotification({
  email,
  ...variables
}: {
  email: string;
  [key: string]: any;
}): Promise<void> {
  const options: EmailOptions = {
    to: email,
    subject: "Your order payment Failed",
    template: "failed-order",
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
  link,
  mediaType,
  state,
  BRTtypes,
  period,
  quantity,
  unitPrice,
  tax,
  dueDate,
  ...variables
}: {
  email: string;
  link: string;
  mediaType: string;
  state: string;
  BRTtypes?: string;
  period: string;
  quantity: number;
  unitPrice: number;
  tax: string;
  dueDate: string;
  [key: string]: any;
}): Promise<void> {
  const options: EmailOptions = {
    to: email,
    subject: "Your Invoice is ready, pay now!",
    template: "new-invoice",
    link,
    variables: {
      ...variables,
      mediaType,
      state,
      BRTtypes,
      period,
      quantity,
      unitPrice,
      tax,
      dueDate,
    },
  };

  await sendMail(options);
}

async function successInvoiceNotification({
  email,
  period,
  quantity,
  unitPrice,
  tax,
  ...variables
}: {
  email: string;
  period: string;
  quantity: number;
  unitPrice: number;
  tax: string;
  [key: string]: any;
}): Promise<void> {
  const options: EmailOptions = {
    to: email,
    subject: "Your Invoice payment is successful",
    template: "success-invoice",
    variables: {
      ...variables,
      period,
      quantity,
      unitPrice,
      tax,
    },
  };

  await sendMail(options);
}

export {
  welcomeNotification,
  resetPasswordEmail,
  successChangedPasswordEmail,
  successOrderNotification,
  failedOrderNotification,
  expiredOrderNotification,
  invoiceNotification,
  successInvoiceNotification,
};
