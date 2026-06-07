import { z } from "zod";

import { Z_ListingMapNested } from "./listingMapNested";

export const Z_ListingsMap = Z_ListingMapNested.merge(z.object({})).array();

export type T_ListingsMap = z.infer<typeof Z_ListingsMap>;
