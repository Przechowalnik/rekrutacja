import { z } from "zod";

import { Z_ExchangeNested } from "./exchangeNested";

export const Z_Exchange = Z_ExchangeNested.merge(z.object({}));

export type T_Exchange = z.infer<typeof Z_Exchange>;
