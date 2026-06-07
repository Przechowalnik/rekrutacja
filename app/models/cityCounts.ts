import { z } from "zod";

export const Z_CityCounts = z.record(z.string(), z.number());

export type T_CityCounts = z.infer<typeof Z_CityCounts>;
