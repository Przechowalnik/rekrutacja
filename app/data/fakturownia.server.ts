import axios from "axios";
import dayjs from "dayjs";

import { environment } from "./environment.server";
import { isTestInvoicesServer } from "./flags.server";

export type T_CreateInvoice = {
  buyer_email: string;
  buyer_name: string;
  buyer_tax_no: null | string;
  positions: {
    discount?: number;
    discount_percent?: number;
    name: string;
    quantity: number;
    tax?: number;
    total_price_gross: number;
  }[];
  sell_date?: string;
};

type T_CreateInvoiceResult = {
  id: number;
};

export const createInvoice = async (
  properties: T_CreateInvoice,
): Promise<T_CreateInvoiceResult> => {
  const fakturowniaApi = environment("FAKTUROWNIA_API");
  const fakturowniaToken = environment("FAKTUROWNIA_TOKEN");

  if (!fakturowniaApi || !fakturowniaToken) {
    throw new Error("Error while creating invoice");
  }

  const isDiscountInPosition = properties.positions.some(
    item => typeof item.discount === "number",
  );

  const mapPositionsWithTax = properties.positions.map(item => {
    return {
      ...item,
      tax: item.tax ?? 23,
    };
  });

  const result = await axios.post<T_CreateInvoiceResult>(
    `${fakturowniaApi}.json`,
    {
      api_token: fakturowniaToken,
      invoice: {
        ...properties,
        ...(isDiscountInPosition
          ? {
              discount_kind: "amount",
              show_discount: isDiscountInPosition,
            }
          : {}),
        kind: isTestInvoicesServer() ? "proforma" : "vat",
        positions: mapPositionsWithTax,
        sell_date: properties?.sell_date
          ? dayjs(properties.sell_date).format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD"),
        seller_name: environment("FAKTUROWNIA_SENDER_NAME"),
        seller_tax_no: environment("FAKTUROWNIA_SENDER_TAX_ID"),
        status: "paid",
      },
    },
  );

  if (result.status !== 201) {
    throw new Error("Error while creating invoice");
  }

  return result.data;
};

export const getInvoice = async ({
  invoiceId,
}: {
  invoiceId: string;
}): Promise<Buffer> => {
  const fakturowniaApi = environment("FAKTUROWNIA_API");
  const fakturowniaToken = environment("FAKTUROWNIA_TOKEN");

  if (!fakturowniaApi || !fakturowniaToken) {
    throw new Error("Error while get invoice");
  }

  const result = await axios.get<Buffer>(
    `${fakturowniaApi}/${invoiceId}.pdf?api_token=${fakturowniaToken}`,
    {
      responseType: "arraybuffer",
    },
  );

  if (result.status !== 200) {
    throw new Error("Error while get invoice");
  }

  return result.data;
};
