import { z } from "zod";

import { Z_ProductNested } from "./productNested";

export const Z_Products = Z_ProductNested.merge(z.object({})).array();

export type T_Products = z.infer<typeof Z_Products>;
