import { z } from "zod";

export const Z_ProductNested = z.object({
  id: z.string().uuid(),
  name: z.string(),
  points_1: z.bigint().or(z.number()),
  points_2_5: z.bigint().or(z.number()),
  points_6_plus: z.bigint().or(z.number()),
  price_1: z.bigint().or(z.number()),
  price_2_5: z.bigint().or(z.number()),
  price_6_plus: z.bigint().or(z.number()),
});

export type T_ProductNested = z.infer<typeof Z_ProductNested>;
