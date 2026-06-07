export const formatNumber = (number: number) => {
  const hasOneDecimalPlace = (number * 10) % 1 === 0;
  if (hasOneDecimalPlace) {
    return number.toFixed(1) + "0";
  }
  return number.toFixed(2);
};

export const calculateNetAmount = ({
  grossAmount,
  vatRate = 23,
}: {
  grossAmount: number;
  vatRate?: number;
}) => {
  const taxRate = 1 + vatRate / 100;
  const netAmount = grossAmount / taxRate;
  const netAmountRounded = Math.round(netAmount * 100) / 100;
  return formatNumber(netAmountRounded);
};

export const calculateGrossAmountWithTax = ({
  netAmount,
  vatRate,
}: {
  netAmount: number;
  vatRate: number;
}) => {
  const taxRate = 1 + vatRate / 100;
  const grossAmount = netAmount * taxRate;
  const grossAmountRounded = Math.round(grossAmount * 100) / 100;
  return formatNumber(grossAmountRounded);
};

export const changeValueToStringPx = (value: number | string) => {
  if (typeof value === "number") {
    return `${value}px`;
  }

  const valueHavePx = value.includes("px");
  if (valueHavePx) {
    return value;
  }

  return `${value}px`;
};

export function roundToOneDecimal({ number }: { number: number }): string {
  return (Math.floor(number * 10 + 0.5) / 10).toFixed(1).replace(".", ",");
}
