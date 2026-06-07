import { z } from "zod";

import { Z_ListingNested } from "./listingNested";

export const Z_Listings = Z_ListingNested.merge(z.object({})).array();

export type T_Listings = z.infer<typeof Z_Listings>;
