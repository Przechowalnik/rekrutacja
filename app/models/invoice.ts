import { z } from "zod";

import { Z_InvoiceNested } from "./invoiceNested";

export const Z_Invoice = Z_InvoiceNested.merge(z.object({}));

export type T_Invoice = z.infer<typeof Z_Invoice>;
