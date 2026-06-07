import Stripe from "stripe";

import { environment } from "~/data/environment.server";
import { isE2E } from "~/data/isE2E.server";

const stripeKey = isE2E ? "sk_test_dummy" : environment("STRIPE_SECRET_KEY");

export const stripe = new Stripe(stripeKey, {
  apiVersion: "2024-06-20",
});

export const CURRENCY = "pln";
export const MIN_AMOUNT = 10;
export const MAX_AMOUNT = 5000;
export const AMOUNT_STEP = 5;

export function formatAmountOnlyNumber(amount: bigint | number): number {
  return Number.parseFloat((Number(amount) / 100).toFixed(2));
}

export function formatAmountForDisplay(amount: number): string {
  const adjustedAmount = amount / 100;
  const numberFormat = new Intl.NumberFormat(["en-US"], {
    currency: CURRENCY,
    currencyDisplay: "symbol",
    style: "currency",
  });
  const formattedAmount = numberFormat.format(adjustedAmount);
  const currencySymbol =
    numberFormat.formatToParts(1).find(part => part.type === "currency")
      ?.value ?? "";

  return `${formattedAmount.replace(currencySymbol, "").trim()} ${currencySymbol.trim()}`;
}

export function formatAmountForStripe(amount: number): number {
  const numberFormat = new Intl.NumberFormat(["en-US"], {
    currency: CURRENCY,
    currencyDisplay: "symbol",
    style: "currency",
  });
  const parts = numberFormat.formatToParts(amount);
  let zeroDecimalCurrency: boolean = true;
  for (const part of parts) {
    if (part.type === "decimal") {
      zeroDecimalCurrency = false;
    }
  }
  return zeroDecimalCurrency ? amount : Math.round(amount * 100);
}

export function calculateNetPrice({
  grossPrice,
  taxRate,
}: {
  grossPrice: number;
  taxRate: number;
}) {
  if (grossPrice === 0 && taxRate === 0) {
    return 0;
  }

  if (grossPrice <= 0 || taxRate < 0) {
    return null;
  }

  if (taxRate === 0) {
    return grossPrice;
  }

  return +(grossPrice / (1 + taxRate / 100)).toFixed(2);
}
