import postmark from "postmark";

import { environment } from "~/data/environment.server";

let client: null | postmark.ServerClient = null;

export function getEmailsClient() {
  if (client) {
    return client;
  }

  const token = environment("EMAILS_SERVER_TOKEN");
  client = new postmark.ServerClient(token);

  return client;
}

export function getEmailsSender() {
  return {
    email: environment("EMAILS_EMAIL_SENDER"),
    name: environment("EMAILS_SENDER_NAME"),
  };
}
