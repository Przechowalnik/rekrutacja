import { Elements } from "@stripe/react-stripe-js";
import type { PropsWithChildren } from "react";

import { getStripe } from "~/lib/stripe";

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

export const RespectStripe = ({ children }: PropsWithChildren) => {
  if (!stripePublicKey) {
    return null;
  }

  return <Elements stripe={getStripe(stripePublicKey)}>{children}</Elements>;
};
