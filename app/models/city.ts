import { z } from "zod";

import { Z_CityNested } from "./cityNested";

export const Z_City = Z_CityNested.merge(z.object({}));

export type T_City = z.infer<typeof Z_City>;
