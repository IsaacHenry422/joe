/* eslint-disable @typescript-eslint/no-explicit-any */
import { mailgunClient } from "../../src/config/mailgun.config";

import moment from "moment";
import dotenv from "dotenv";

dotenv.config();
const domain: string = process.env.MAILGUN_DOMAIN!;
const sender: string = `Vaad Media <${process.env.MAILGUN_SENDER_EMAIL}>`;

export interface EmailMessage {
  from: string;
  to: string;
  subject: string;
  template: string;
  "t:variables"?: string;
  "o:deliverytime"?: string;
  html?: string; // Make html optional
  text?: string;
}

export interface EmailOptions {
  to: string;
  template: string;
  subject: string;
  variables?: Record<string, any>;
  time?: Date;
}

//send Mail
async function sendMail({
  to,
  template,
  subject,
  variables = {},
}: EmailOptions): Promise<any> {
  const messageData: EmailMessage = {
    from: sender,
    to,
    subject,
    template,
    "t:variables": JSON.stringify(variables),
    html: "",
  };

  // return mailgunClient.messages.create(domain, messageData);
}

//schedule Mail
async function scheduleMail({
  to,
  template,
  subject,
  variables = {},
  time,
}: EmailOptions): Promise<any> {
  const messageData: EmailMessage = {
    from: sender,
    to,
    subject,
    template,
    "t:variables": JSON.stringify(variables),
    "o:deliverytime": moment(time).toDate().toUTCString(),
    html: "",
  };

  // return mailgunClient.messages.create(domain, messageData);
}

export { sendMail, scheduleMail };
