import { z } from "zod";

import { Z_Country, Z_TaxCountry } from "../enums";

export const Z_CompanyInvoiceData = z.object({
  city: z.string(),
  companyName: z.string(),
  country: Z_Country,
  flatNumber: z.string().nullable().optional(),
  postalCode: z.string(),
  streetName: z.string(),
  streetNumber: z.string(),
  taxCountry: Z_TaxCountry,
  taxNumber: z.string(),
});

export type T_CompanyInvoiceData = z.infer<typeof Z_CompanyInvoiceData>;
