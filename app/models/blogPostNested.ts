import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

export const Z_BlogPostNested = z.object({
  content: z.string(),
  createdAt: zodDateValidator(),
  description: z.string(),
  descriptionSeo: z.string(),
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  titleSeo: z.string(),
  updatedAt: zodDateValidator(),
});

export type T_BlogPostNested = z.infer<typeof Z_BlogPostNested>;
