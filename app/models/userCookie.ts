import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

import { Z_Language, Z_Roles } from "./enums";

export const Z_UserCookie = z
  .object({
    expiresAt: zodDateValidator().nullable().optional(),
    forceFetchUserData: z.boolean().nullable().optional(),
    userCompanyId: z.string().nullable().optional(),
    userCompanyName: z.string().nullable().optional(),
    userFirstName: z.string().nullable().optional(),
    userId: z.string().nullable().optional(),
    userLang: Z_Language.nullable().optional(),
    userLastName: z.string().nullable().optional(),
    userRole: Z_Roles.nullable().optional(),
    userSessionVersion: z.number().nullable().optional(),
  })
  .required();

export type T_UserCookie = Required<z.infer<typeof Z_UserCookie>>;
