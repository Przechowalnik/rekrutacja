import { z } from "zod";

export const Z_CityCategoryCounts = z.object({
  byCategory: z.record(z.string(), z.number()),
  total: z.number(),
});

export type T_CityCategoryCounts = z.infer<typeof Z_CityCategoryCounts>;
