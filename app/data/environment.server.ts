import { z } from "zod";

import { isE2E } from "./isE2E.server";

// In E2E/CI mode, all env vars are optional since we use mocks
const environmentString = isE2E
  ? z.string().optional().default("")
  : z.string();

const environmentSchema = z.object({
  EMAILS_EMAIL_SENDER: environmentString,
  EMAILS_SENDER_NAME: environmentString,
  EMAILS_SERVER_TOKEN: environmentString,
  FACEBOOK_CLIENT_ID: environmentString,
  FACEBOOK_CLIENT_SECRET: environmentString,
  FACEBOOK_REDIRECT_URL: environmentString,
  FAKTUROWNIA_API: environmentString,
  FAKTUROWNIA_SENDER_NAME: environmentString,
  FAKTUROWNIA_SENDER_TAX_ID: environmentString,
  FAKTUROWNIA_TOKEN: environmentString,
  GOOGLE_API_KEY: environmentString,
  GOOGLE_MAPS_KEY: environmentString,
  GOOGLE_RECAPTCHA_BACKEND: environmentString,
  GUS_USER_KEY: environmentString,
  HOSTED_SMS_API: environmentString,
  HOSTED_SMS_EMAIL: environmentString,
  HOSTED_SMS_PASSWORD: environmentString,
  HOSTED_SMS_SENDER: environmentString,
  IP_ADDRESS_ENCRYPTION_SECRET_KEY: environmentString,
  LOCAL_ENV: environmentString,
  META_ACCESS_TOKEN: environmentString,
  META_PIXEL_ID: environmentString,
  META_TEST_EVENT_CODE: environmentString,
  OAUTH_CLIENT_ID: environmentString,
  OAUTH_CLIENT_SECRET: environmentString,
  OAUTH_REDIRECT_URL: environmentString,
  SESSION_SECRET: environmentString,
  STRIPE_SECRET_KEY: environmentString,
  STRIPE_WEBHOOK_SECRET: environmentString,
  SUPABASE_SERVICE_ROLE_KEY: environmentString,
  SUPABASE_URL: environmentString,
  UPSTASH_REDIS_TOKEN: environmentString,
  UPSTASH_REDIS_URL: environmentString,
});

type EnvironmentSchemaType = z.infer<typeof environmentSchema>;

type EnvironmentKey = keyof EnvironmentSchemaType;

let cachedEnvironment: EnvironmentSchemaType | null = null;

function getValidatedEnvironment(): EnvironmentSchemaType {
  if (cachedEnvironment) {
    return cachedEnvironment;
  }

  const environmentValues: Partial<
    Record<keyof EnvironmentSchemaType, string>
  > = {};

  for (const key of Object.keys(environmentSchema.shape)) {
    environmentValues[key as keyof EnvironmentSchemaType] = process.env[key];
  }

  cachedEnvironment = environmentSchema.parse(environmentValues);
  return cachedEnvironment;
}

export function environment<K extends EnvironmentKey>(
  key: K,
): EnvironmentSchemaType[K] {
  return getValidatedEnvironment()[key];
}
