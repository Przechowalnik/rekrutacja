import { z } from "zod";

export const Z_CompanyProfile = z.object({
  avatar: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  urlFacebook: z.string().nullable().optional(),
  urlInstagram: z.string().nullable().optional(),
  urlTiktok: z.string().nullable().optional(),
});

export type T_CompanyProfile = z.infer<typeof Z_CompanyProfile>;
