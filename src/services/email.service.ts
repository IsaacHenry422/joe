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
      otp,
      email,
    },
  };
  await sendMail(options);
}

async function successChangedPasswordEmail(
  email: string,
  firstname: string
): Promise<void> {
  const options: EmailOptions = {
    to: email,
    subject: "Your Vaad PIN Has Been Changed Successfully",
    template: "changed-password",
    variables: {
      name: firstname,
      email,
    },
  };
  await sendMail(options);
}

async function newTransactionNotification(
  email: string,
  firstname: string,
  lastname: string,
  amount: number,
  createdAt: string
): Promise<void> {
  const options: EmailOptions = {
    to: email,
    subject: "ALERT: You have a new Transaction",
    template: "success-transaction",
    variables: {
      email,
      firstname,
      lastname,
      amount,
      createdAt,
    },
  };

  await sendMail(options);
}

async function successOrderNotification(
  orderId: string,
  email: string,
  firstname: string,
  date: string,
  subTotal: number,
  vat: number,
  delivery: number,
  totalAmount: number,
  paymentMethod: string,
  paymentComments: string
): Promise<void> {
  const options: EmailOptions = {
    to: email,
    subject: "ALERT: Your order was a Success",
    template: "order",
    variables: {
      orderId,
      name: firstname,
      email,
      date,
      subTotal,
      vat,
      delivery,
      totalAmount,
      paymentMethod,
      paymentComments,
    },
    version: "success-order",
  };

  await sendMail(options);
}

async function pendingOrderNotification(
  orderId: string,
  email: string,
  firstname: string,
  date: string,
  subTotal: number,
  vat: number,
  delivery: number,
  totalAmount: number,
  paymentMethod: string,
  paymentComments: string
): Promise<void> {
  const options: EmailOptions = {
    to: email,
    subject: "URGENT: You have a pending payment to make",
    template: "order",
    variables: {
      orderId,
      name: firstname,
      email,
      date,
      subTotal,
      vat,
      delivery,
      totalAmount,
      paymentMethod,
      paymentComments,
    },
    version: "pending-order",
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
    version: "expired-order",
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
    template: "invoice",
    variables,
    version: "new-invoice",
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
    template: " invoice",
    variables,
    version: "success-invoice",
  };

  await sendMail(options);
}

async function contactUsUserCopy (
  email: string,
  firstname: string,
  message: string
): Promise<void> {
  const options: EmailOptions = {
    to: email,
    subject: "Copy of email sent to Vaad",
    template: "contact-us-admin",
    variables: {
      name: firstname,
      message,
      email,
    },
  };
  await sendMail(options);
}
async function contactUsAdminCopy (
  email: string,
  admin: string,
  firstname: string,
  phoneNumber: string,
  message: string
): Promise<void> {
  const options: EmailOptions = {
    to: admin,
    subject: `Message from ${firstname}`,
    template: "contact-us-admin",
    variables: {
      name: firstname,
      message,
      email,
      phoneNumber,
    },
    version: "contact-us-admin-cpoy",
  };
  await sendMail(options);
}
// async function testEmail(email: string) {
//   const options = {
//     to: email,
//     subject: "Accept invitation to attend event",
//     template: "test",
//   };

//   await sendMail(options);
// }

export {
  verifyEmailNotification,
  welcomeNotification,
  resetPasswordEmail,
  successChangedPasswordEmail,
  newTransactionNotification,
  successOrderNotification,
  pendingOrderNotification,
  expiredOrderNotification,
  invoiceNotification,
  successInvoiceNotification,
  contactUsUserCopy,
  contactUsAdminCopy,
  // testEmail,
};
