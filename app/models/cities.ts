import { z } from "zod";

import { Z_CityNested } from "./cityNested";

export const Z_Cities = Z_CityNested.merge(z.object({})).array();

export type T_Cities = z.infer<typeof Z_Cities>;
