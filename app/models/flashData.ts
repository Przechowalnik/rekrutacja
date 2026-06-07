import { z } from "zod";

const E_FlashMessageStatus = ["error", "info", "success", "warning"] as const;

const Z_FlashMessageStatus = z.enum(E_FlashMessageStatus);

export const Z_FlashData = z.object({
  logout: z.boolean().nullable().optional(),
  message: z.string().nullable().optional(),
  messageStatus: Z_FlashMessageStatus.nullable().optional(),
  modal: z.string().nullable().optional(),
  refetchUserSession: z.boolean().nullable().optional(),
});

export type T_FlashData = z.infer<typeof Z_FlashData>;
export type T_FlashMessageStatus = z.infer<typeof Z_FlashMessageStatus>;
