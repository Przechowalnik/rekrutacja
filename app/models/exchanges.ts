import { z } from "zod";

import { Z_ExchangeNested } from "./exchangeNested";

export const Z_Exchanges = Z_ExchangeNested.merge(z.object({})).array();

export type T_Exchanges = z.infer<typeof Z_Exchanges>;
