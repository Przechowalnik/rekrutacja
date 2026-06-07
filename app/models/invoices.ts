import { z } from "zod";

import { Z_InvoiceNested } from "./invoiceNested";

export const Z_Invoices = Z_InvoiceNested.merge(z.object({})).array();

export type T_Invoices = z.infer<typeof Z_Invoices>;
