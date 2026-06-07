import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<null | Stripe> | undefined;

export function getStripe(
  stripePublishKey?: string,
): null | Promise<null | Stripe> {
  if (!stripePublishKey) {
    return null;
  }

  stripePromise ??= loadStripe(stripePublishKey);

  return stripePromise;
}
