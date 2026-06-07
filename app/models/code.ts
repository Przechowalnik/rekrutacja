import { z } from "zod";

export const Z_CodeString = z.string().min(6).max(6);
