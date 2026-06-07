import { z } from "zod";

export const Z_CategoryCityCounts = z.record(z.string(), z.number());

export type T_CategoryCityCounts = z.infer<typeof Z_CategoryCityCounts>;
