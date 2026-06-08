import { TFunction } from "i18next";

export const CURRENCY = "pln";

export function formatAmountForDisplayWithElements(amount: bigint | number): {
  currency: string;
  priceNumber: string;
} {
  const isInteger = Number(amount) % 100 === 0;
  const adjustedAmount = Number(amount) / 100;

  const numberFormat = new Intl.NumberFormat(["pl-PL"], {
    currency: CURRENCY,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: isInteger ? 0 : 2,
    minimumFractionDigits: isInteger ? 0 : 2,
    style: "currency",
  });

  const formatted = numberFormat.format(adjustedAmount);
  const currencySymbol =
    numberFormat.formatToParts(1).find(part => part.type === "currency")
      ?.value ?? "";

  return {
    currency: currencySymbol.trim(),
    priceNumber: formatted.replace(currencySymbol, "").trim(),
  };
}
export function formatAmountForDisplay(amount: bigint | number): string {
  const isInteger = Number(amount) % 100 === 0;
  const adjustedAmount = Number(amount) / 100;

  const numberFormat = new Intl.NumberFormat(["pl-PL"], {
    currency: CURRENCY,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: isInteger ? 0 : 2,
    minimumFractionDigits: isInteger ? 0 : 2,
    style: "currency",
  });

  const formatted = numberFormat.format(adjustedAmount);
  const currencySymbol =
    numberFormat.formatToParts(1).find(part => part.type === "currency")
      ?.value ?? "";

  return `${formatted.replace(currencySymbol, "").trim()} ${currencySymbol.trim()}`;
}

export function formatNetAmountFromGrossForDisplay({
  grossAmount,
  vatRate,
}: {
  grossAmount: bigint | number;
  vatRate: number;
}): string {
  const adjustedAmount = Number(grossAmount) / 100;
  const netAmount = adjustedAmount / (1 + vatRate / 100);
  const isInteger = Number.isInteger(netAmount);

  const numberFormat = new Intl.NumberFormat(["pl-PL"], {
    currency: "PLN",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: isInteger ? 0 : 2,
    minimumFractionDigits: isInteger ? 0 : 2,
    style: "currency",
  });

  const formattedNet = numberFormat.format(netAmount);

  const currencySymbol =
    numberFormat.formatToParts(1).find(part => part.type === "currency")
      ?.value ?? "";

  return `${formattedNet.replace(currencySymbol, "").trim()} ${currencySymbol.trim()}`;
}

export function formatAmountToNumber(amount: bigint | number): number {
  return Number.parseFloat((Number(amount) / 100).toFixed(2));
}

export function calculateDiscount({
  amount = 0,
  discountPercentage = 0,
}: {
  amount: number;
  discountPercentage: number;
}) {
  const normalizedPercentage = Math.min(Math.max(discountPercentage, 0), 100);
  const discount = (amount * normalizedPercentage) / 100;
  const finalPrice = Math.round(amount - discount);

  return finalPrice;
}

const formatPlainAmount = (amount: number): string => {
  return new Intl.NumberFormat("pl-PL", {
    maximumFractionDigits: 0,
  }).format(amount);
};

// Salary range "od–do zł / mies." for job listings (gross monthly, PLN).
export const generateSalaryRange = ({
  salaryFrom,
  salaryTo,
  tCommon,
}: {
  salaryFrom?: null | number;
  salaryTo?: null | number;
  tCommon: TFunction<"common", undefined>;
}): null | string => {
  if (salaryFrom == null && salaryTo == null) {
    return null;
  }

  const unit = tCommon("cardSearchListing.salaryUnit");

  if (salaryFrom != null && salaryTo != null) {
    return `${formatPlainAmount(salaryFrom)} – ${formatPlainAmount(salaryTo)} ${unit}`;
  }

  const value = salaryFrom ?? salaryTo ?? 0;
  return `${formatPlainAmount(value)} ${unit}`;
};
