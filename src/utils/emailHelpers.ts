/* eslint-disable @typescript-eslint/no-explicit-any */
import { mailgunClient } from "../config/mailgun.config";

import moment from "moment";
import dotenv from "dotenv";

dotenv.config();
const domain: string = process.env.MAILGUN_DOMAIN!;
const sender: string = `Vaad Media <${process.env.MAILGUN_SENDER_EMAIL}>`;

export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  variables?: Record<string, any>;
  time?: Date;
  version?: string;
}

type MailgunMessageData = {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  "t:variables"?: string;
  "o:deliverytime"?: string;

  [key: string]: any; // Index signature to allow additional properties
  template?: string; // 'template' is optional if needed
};

//send Mail
async function sendMail({
  to,
  template,
  subject,
  variables = {},
  version,
}: EmailOptions): Promise<any> {
  const messageData: MailgunMessageData = {
    from: sender,
    to,
    subject,
    template,
    html: "", // Provide a default value for html
    "t:variables": JSON.stringify(variables),
  };

  if (version) {
    messageData["t:version"] = version;
  }

  return mailgunClient.messages.create(domain, messageData);
}

// //schedule Mail
async function scheduleMail({
  to,
  template,
  subject,
  variables = {},
  time,
}: EmailOptions): Promise<any> {
  const messageData: MailgunMessageData = {
    from: sender,
    to,
    subject,
    template,
    "t:variables": JSON.stringify(variables),
    "o:deliverytime": moment(time).toDate().toUTCString(),
    html: "",
  };

  return mailgunClient.messages.create(domain, messageData);
}

export { sendMail, scheduleMail };
