import { TFunction } from "i18next";

import {
  E_ListingContractType,
  E_ListingType,
  T_ListingContractType,
  T_ListingType,
} from "~/models/enums";

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

export const generateListingPriceFromTypeAndContractType = ({
  contractType,
  tCommon,
  type,
}: {
  contractType: null | T_ListingContractType | undefined;
  tCommon: TFunction<"common", undefined>;
  type: null | T_ListingType;
}) => {
  if (!type || !contractType) {
    return tCommon("inputs.listingPrice");
  }
  if (type === E_ListingType.SALE) {
    return tCommon("inputs.listingPrice");
  }
  if (contractType === E_ListingContractType.LONG_TERM) {
    return tCommon("inputs.listingPriceMonthly");
  }
  return tCommon("inputs.listingPriceDaily");
};

export const generateListingPriceFromTypeAndContractTypeWithPrice = ({
  contractType,
  negotiable,
  negotiableAsterisk,
  price,
  tCommon,
  type,
}: {
  contractType: null | T_ListingContractType | undefined;
  negotiable: boolean;
  negotiableAsterisk?: boolean;
  price: bigint | number;
  tCommon: TFunction<"common", undefined>;
  type: T_ListingType;
}) => {
  return (
    <>
      {generateListingPriceFromTypeAndContractType({
        contractType,
        tCommon,
        type,
      })}
      {": "}
      <b>{`${formatAmountForDisplay(price)}${(() => {
        if (!negotiable) {
          return "";
        }
        if (negotiableAsterisk) {
          return " (+/-)";
        }
        return ` (${tCommon("cardSearchListing.negotiable")})`;
      })()}`}</b>
    </>
  );
};

export const generateListingPriceToShowFromTypeAndContractType = ({
  contractType,
  negotiable,
  negotiableAsterisk,
  price,
  tCommon,
  type,
}: {
  contractType: null | T_ListingContractType | undefined;
  negotiable: boolean;
  negotiableAsterisk?: boolean;
  price: bigint | number;
  tCommon: TFunction<"common", undefined>;
  type: T_ListingType;
}) => {
  const translationKey = (() => {
    if (type === E_ListingType.SALE || !contractType) {
      return "cardSearchListing.price";
    }
    if (contractType === E_ListingContractType.LONG_TERM) {
      return "cardSearchListing.priceMonthly";
    }
    return "cardSearchListing.priceDaily";
  })();

  const negotiableSuffix = (() => {
    if (!negotiable) {
      return "";
    }
    if (negotiableAsterisk) {
      return " (+/-)";
    }
    return ` (${tCommon("cardSearchListing.negotiable")})`;
  })();

  return `${tCommon(translationKey, {
    price: formatAmountForDisplay(price),
  })}${negotiableSuffix}`;
};
