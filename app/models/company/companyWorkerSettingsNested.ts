import { z } from "zod";

export const Z_CompanyWorkerSettingsNested = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
});

export type T_CompanyWorkerSettingsNested = z.infer<
  typeof Z_CompanyWorkerSettingsNested
>;
