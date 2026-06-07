import { z } from "zod";

import { Z_ProductNested } from "./productNested";

export const Z_Product = Z_ProductNested.merge(z.object({}));

export type T_Product = z.infer<typeof Z_Product>;
