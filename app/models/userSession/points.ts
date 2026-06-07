import { z } from "zod";

export const Z_Points = z.object({
  balance: z.number(),
});

export type T_Points = z.infer<typeof Z_Points>;
