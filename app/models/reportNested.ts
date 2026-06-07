import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

import { Z_ReportType } from "./enums";

const Z_ReportUser = z.object({
  email: z.string(),
  id: z.string().uuid(),
});

const Z_ReportCompany = z.object({
  id: z.string().uuid(),
  name: z.string(),
  workers: Z_ReportUser.array(),
});

export const Z_ReportNested = z.object({
  createdAt: zodDateValidator(),
  description: z.string().optional().nullable(),
  id: z.string().uuid(),
  listing: z.object({ slug: z.string() }).optional().nullable(),
  listingId: z.string().uuid().optional().nullable(),
  targetCompany: Z_ReportCompany.optional().nullable(),
  targetUser: Z_ReportUser.optional().nullable(),
  type: Z_ReportType,
  user: Z_ReportUser.optional().nullable(),
});

export type T_ReportNested = z.infer<typeof Z_ReportNested>;
