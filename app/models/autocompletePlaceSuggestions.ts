import { z } from "zod";

export const Z_AutocompletePlaceSuggestions = z
  .object({
    description: z.string(),
    id: z.string(),
  })
  .array();

export type T_AutocompletePlaceSuggestions = z.infer<
  typeof Z_AutocompletePlaceSuggestions
>;
