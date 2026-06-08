import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

import { Z_Language, Z_Roles } from "../enums";
import { Z_Company } from "./company";
import { Z_CompanyWorkerSettings } from "./companyWorkerSettings";
import { Z_UserAuthenticator2Fa } from "./userAuthenticator2Fa";
import { Z_UserAuthenticatorEmailOtp } from "./userAuthenticatorEmailOtp";
import { Z_UserEmailVerification } from "./userEmailVerification";
import { Z_UserPhone } from "./userPhone";

export const Z_UserSession = z.object({
  authenticator2FA: Z_UserAuthenticator2Fa.nullable().optional(),
  authenticatorEmailOTP: Z_UserAuthenticatorEmailOtp.nullable().optional(),
  avatar: z.string().nullable(),
  company: Z_Company.optional().nullable(),
  createdAt: zodDateValidator(),
  email: z.string(),
  emailVerification: Z_UserEmailVerification.nullable().optional(),
  firstName: z.string(),
  id: z.string().uuid(),
  isPasswordSet: z.boolean(),
  lang: Z_Language,
  lastName: z.string().nullable().optional(),
  phone: Z_UserPhone.nullable().optional(),
  role: Z_Roles,
  workerSettings: Z_CompanyWorkerSettings.nullable().optional(),
});

export type T_UserSession = z.infer<typeof Z_UserSession>;
