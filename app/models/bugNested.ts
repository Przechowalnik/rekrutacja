import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

import { Z_BugEnvironment, Z_BugPriority, Z_BugStatus } from "./enums";

export const Z_BugNested = z.object({
  actionsBeforeError: z.string(),
  answer: z.string().nullable().optional(),
  companyId: z.string().uuid().optional().nullable(),
  description: z.string(),
  environment: Z_BugEnvironment,
  errorMessage: z.string().nullable().optional(),
  expectedBehavior: z.string().nullable().optional(),
  id: z.string().uuid(),
  images: z.string().array().nullable().optional(),
  isReproducible: z.boolean(),
  pointsPaidAt: zodDateValidator().nullable().optional(),
  priority: Z_BugPriority.nullable().optional(),
  status: Z_BugStatus,
  timestamp: zodDateValidator(),
  video: z.string().nullable().optional(),
});

export type T_BugNested = z.infer<typeof Z_BugNested>;
