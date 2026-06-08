import { z } from "zod";

// enums
// enums
// enums
// enums
// enums
export const E_TaxCountry = {
  POLAND: "PL",
} as const;

export const E_Country = {
  POLAND: "POLAND",
} as const;

export const E_CountryCode = {
  POLAND: "48",
} as const;

export const E_Language = {
  EN: "EN",
  PL: "PL",
} as const;

export const E_Roles = {
  ADMIN: "ADMIN",
  ADMIN_SUPER: "ADMIN_SUPER",
  B2B_OWNER: "B2B_OWNER",
  B2B_WORKER: "B2B_WORKER",
  USER: "USER",
} as const;

export const E_CompanyWorkerPermissions = {
  MANAGE_LISTINGS: "MANAGE_LISTINGS",
  MANAGE_WORKERS: "MANAGE_WORKERS",
} as const;

export const E_BugPriority = {
  BIG: "BIG",
  MEDIUM: "MEDIUM",
  SMALL: "SMALL",
} as const;

export const E_BugEnvironment = {
  DESKTOP_CHROME: "DESKTOP_CHROME",
  DESKTOP_EDGE: "DESKTOP_EDGE",
  DESKTOP_FIREFOX: "DESKTOP_FIREFOX",
  DESKTOP_OTHER: "DESKTOP_OTHER",
  PHONE_ANDROID: "PHONE_ANDROID",
  PHONE_IOS: "PHONE_IOS",
  PHONE_OTHER: "PHONE_OTHER",
} as const;

export const E_BugStatus = {
  DUPLICATE: "DUPLICATE",
  IN_PROGRESS: "IN_PROGRESS",
  REJECTED: "REJECTED",
  REPORTED: "REPORTED",
  RESOLVED: "RESOLVED",
} as const;

export const E_ListingStatus = {
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
  DELETED: "DELETED",
  EXPIRED: "EXPIRED",
  INACTIVE: "INACTIVE",
  REJECTED: "REJECTED",
  UNPAID: "UNPAID",
} as const;

export const E_ListingDeleteReason = {
  CHANGED_MIND: "CHANGED_MIND",
  DUPLICATE: "DUPLICATE",
  NO_LONGER_AVAILABLE: "NO_LONGER_AVAILABLE",
  OTHER: "OTHER",
  POSITION_FILLED: "POSITION_FILLED",
} as const;

export const E_ListingPaymentStatus = {
  EXPIRED: "EXPIRED",
  FREE: "FREE",
  PAID: "PAID",
  PENDING: "PENDING",
  REJECTED: "REJECTED",
  UNPAID: "UNPAID",
} as const;

// Job categories (branże) — recruitment board.
export const E_ListingCategory = {
  ADMINISTRATION: "ADMINISTRATION",
  CONSTRUCTION: "CONSTRUCTION",
  CUSTOMER_SERVICE: "CUSTOMER_SERVICE",
  EDUCATION: "EDUCATION",
  ENGINEERING: "ENGINEERING",
  FINANCE: "FINANCE",
  GASTRONOMY: "GASTRONOMY",
  HEALTHCARE: "HEALTHCARE",
  HR: "HR",
  IT: "IT",
  LAW: "LAW",
  LOGISTICS: "LOGISTICS",
  MARKETING: "MARKETING",
  OTHER: "OTHER",
  PRODUCTION: "PRODUCTION",
  SALES: "SALES",
} as const;

export const E_ListingCategorySlug = {
  ADMINISTRATION: "administracja",
  CONSTRUCTION: "budownictwo",
  CUSTOMER_SERVICE: "obsluga-klienta",
  EDUCATION: "edukacja",
  ENGINEERING: "inzynieria",
  FINANCE: "finanse-ksiegowosc",
  GASTRONOMY: "gastronomia-hotelarstwo",
  HEALTHCARE: "zdrowie-medycyna",
  HR: "hr",
  IT: "it",
  LAW: "prawo",
  LOGISTICS: "logistyka-transport",
  MARKETING: "marketing",
  OTHER: "inne",
  PRODUCTION: "produkcja",
  SALES: "sprzedaz",
} as const;

// Work mode (tryb pracy).
export const E_WorkMode = {
  HYBRID: "HYBRID",
  ONSITE: "ONSITE",
  REMOTE: "REMOTE",
} as const;

export const E_ReportType = {
  ILLEGAL_CONTENT: "ILLEGAL_CONTENT",
  MISLEADING_INFO: "MISLEADING_INFO",
  OFFENSIVE_CONTENT: "OFFENSIVE_CONTENT",
  OTHER: "OTHER",
  SCAM_FRAUD: "SCAM_FRAUD",
  SPAM: "SPAM",
  WRONG_CATEGORY: "WRONG_CATEGORY",
} as const;

// zod object from enums
// zod object from enums
// zod object from enums
// zod object from enums
// zod object from enums

export const Z_Roles = z.enum([
  E_Roles.ADMIN,
  E_Roles.ADMIN_SUPER,
  E_Roles.B2B_OWNER,
  E_Roles.USER,
  E_Roles.B2B_WORKER,
]);

export const Z_TaxCountry = z.nativeEnum(E_TaxCountry);
export const Z_Country = z.nativeEnum(E_Country);
export const Z_Language = z.nativeEnum(E_Language);
export const Z_CountryCode = z.nativeEnum(E_CountryCode);

export const Z_CompanyWorkerRoles = z.enum(
  [
    E_Roles.B2B_OWNER,
    E_Roles.B2B_WORKER,
    E_Roles.ADMIN,
    E_Roles.ADMIN_SUPER,
    E_Roles.USER,
  ],
  {
    message: "badCompanyWorkerRole",
  },
);

export const Z_CompanyWorkerRolesWithoutOwner = z.enum([E_Roles.B2B_WORKER], {
  message: "badCompanyWorkerRole",
});

export const Z_CompanyWorkerPermissions = z.enum([
  E_CompanyWorkerPermissions.MANAGE_LISTINGS,
  E_CompanyWorkerPermissions.MANAGE_WORKERS,
]);

export const Z_BugPriority = z.nativeEnum(E_BugPriority);
export const Z_BugEnvironment = z.nativeEnum(E_BugEnvironment);
export const Z_BugStatus = z.nativeEnum(E_BugStatus);
export const Z_ListingStatus = z.nativeEnum(E_ListingStatus);
export const Z_ListingDeleteReason = z.nativeEnum(E_ListingDeleteReason);
export const Z_ListingPaymentStatus = z.nativeEnum(E_ListingPaymentStatus);
export const Z_ListingCategory = z.nativeEnum(E_ListingCategory);
export const Z_WorkMode = z.nativeEnum(E_WorkMode);
export const Z_ReportType = z.nativeEnum(E_ReportType);

// types
// types
// types
// types
// types
export type T_Roles = z.infer<typeof Z_Roles>;
export type T_Country = z.infer<typeof Z_Country>;
export type T_TaxCountry = z.infer<typeof Z_TaxCountry>;
export type T_CompanyWorkerRoles = z.infer<typeof Z_CompanyWorkerRoles>;
export type T_CountryCode = z.infer<typeof Z_CountryCode>;
export type T_Language = z.infer<typeof Z_Language>;
export type T_CompanyWorkerPermissions = z.infer<
  typeof Z_CompanyWorkerPermissions
>;
export type T_BugPriority = z.infer<typeof Z_BugPriority>;
export type T_BugEnvironment = z.infer<typeof Z_BugEnvironment>;
export type T_BugStatus = z.infer<typeof Z_BugStatus>;
export type T_ListingPaymentStatus = z.infer<typeof Z_ListingPaymentStatus>;
export type T_ListingStatus = z.infer<typeof Z_ListingStatus>;
export type T_ListingDeleteReason = z.infer<typeof Z_ListingDeleteReason>;
export type T_ListingCategory = z.infer<typeof Z_ListingCategory>;
export type T_WorkMode = z.infer<typeof Z_WorkMode>;
export type T_ReportType = z.infer<typeof Z_ReportType>;
export type T_LocationRadius = 0 | 10 | 15 | 2 | 30 | 5;

export const getCategorySlug = (category: T_ListingCategory): string => {
  return (
    E_ListingCategorySlug[category?.toUpperCase() as T_ListingCategory] ??
    category.toLowerCase()
  );
};

export const getCategoryFromSlug = (slug: string): null | T_ListingCategory => {
  const entry = Object.entries(E_ListingCategorySlug).find(
    ([, value]) => value === slug,
  );
  return entry ? (entry[0] as T_ListingCategory) : null;
};

// is in all
// is in all
// is in all
// is in all
// is in all
export const allRoles: T_Roles[] = [
  E_Roles.ADMIN,
  E_Roles.ADMIN_SUPER,
  E_Roles.B2B_OWNER,
  E_Roles.USER,
  E_Roles.B2B_WORKER,
];

export const allTaxCountriesCode = [E_TaxCountry.POLAND];
export const allCountriesCode = [E_CountryCode[E_Country.POLAND]];
export const allCountries: T_Country[] = [E_Country.POLAND];
export const allCompanyWorkerRoles: T_CompanyWorkerRoles[] = [
  E_Roles.B2B_WORKER,
];

export const allCompanyWorkerPermissions: T_CompanyWorkerPermissions[] = [
  E_CompanyWorkerPermissions.MANAGE_WORKERS,
  E_CompanyWorkerPermissions.MANAGE_LISTINGS,
];

export const allBugPriority: T_BugPriority[] = [
  E_BugPriority.SMALL,
  E_BugPriority.MEDIUM,
  E_BugPriority.BIG,
];

export const allBugStatus: T_BugStatus[] = [
  E_BugStatus.DUPLICATE,
  E_BugStatus.IN_PROGRESS,
  E_BugStatus.REJECTED,
  E_BugStatus.REPORTED,
  E_BugStatus.RESOLVED,
];

export const allBugEnvironment: T_BugEnvironment[] = [
  E_BugEnvironment.PHONE_ANDROID,
  E_BugEnvironment.PHONE_IOS,
  E_BugEnvironment.PHONE_OTHER,
  E_BugEnvironment.DESKTOP_CHROME,
  E_BugEnvironment.DESKTOP_EDGE,
  E_BugEnvironment.DESKTOP_FIREFOX,
  E_BugEnvironment.DESKTOP_OTHER,
];

export const allLanguages: T_Language[] = [E_Language.PL, E_Language.EN];

export const allListingStatus: T_ListingStatus[] = [
  E_ListingStatus.ACTIVE,
  E_ListingStatus.INACTIVE,
  E_ListingStatus.ARCHIVED,
  E_ListingStatus.EXPIRED,
  E_ListingStatus.REJECTED,
  E_ListingStatus.DELETED,
  E_ListingStatus.UNPAID,
];

export const allListingDeleteReason: T_ListingDeleteReason[] = [
  E_ListingDeleteReason.POSITION_FILLED,
  E_ListingDeleteReason.NO_LONGER_AVAILABLE,
  E_ListingDeleteReason.CHANGED_MIND,
  E_ListingDeleteReason.DUPLICATE,
  E_ListingDeleteReason.OTHER,
];

export const allListingPaymentStatus: T_ListingPaymentStatus[] = [
  E_ListingPaymentStatus.EXPIRED,
  E_ListingPaymentStatus.PAID,
  E_ListingPaymentStatus.REJECTED,
  E_ListingPaymentStatus.PENDING,
  E_ListingPaymentStatus.FREE,
  E_ListingPaymentStatus.UNPAID,
];

export const allListingCategory: T_ListingCategory[] = [
  E_ListingCategory.IT,
  E_ListingCategory.SALES,
  E_ListingCategory.MARKETING,
  E_ListingCategory.FINANCE,
  E_ListingCategory.HR,
  E_ListingCategory.ADMINISTRATION,
  E_ListingCategory.CUSTOMER_SERVICE,
  E_ListingCategory.LOGISTICS,
  E_ListingCategory.PRODUCTION,
  E_ListingCategory.CONSTRUCTION,
  E_ListingCategory.GASTRONOMY,
  E_ListingCategory.HEALTHCARE,
  E_ListingCategory.EDUCATION,
  E_ListingCategory.ENGINEERING,
  E_ListingCategory.LAW,
  E_ListingCategory.OTHER,
];

export const allWorkMode: T_WorkMode[] = [
  E_WorkMode.ONSITE,
  E_WorkMode.REMOTE,
  E_WorkMode.HYBRID,
];

export const allReportType: T_ReportType[] = [
  E_ReportType.ILLEGAL_CONTENT,
  E_ReportType.SCAM_FRAUD,
  E_ReportType.OFFENSIVE_CONTENT,
  E_ReportType.MISLEADING_INFO,
  E_ReportType.WRONG_CATEGORY,
  E_ReportType.SPAM,
  E_ReportType.OTHER,
];

export const allLocationRadius: T_LocationRadius[] = [2, 5, 10, 15, 30];

// functions to check
// functions to check
// functions to check
// functions to check
// functions to check
export const isInCountries = (value: string) => {
  return allCountries.includes(value as T_Country);
};

export const isInTaxCountries = (value: string) => {
  return allTaxCountriesCode.includes(value as T_TaxCountry);
};

export const isInCountriesCode = (value: string) => {
  return allCountriesCode.includes(value as T_CountryCode);
};

export const isInCompanyWorkerRoles = (value: string) => {
  return allCompanyWorkerRoles.includes(value as T_CompanyWorkerRoles);
};

export const isInCompanyWorkerPermissions = (value: string) => {
  return allCompanyWorkerPermissions.includes(
    value as T_CompanyWorkerPermissions,
  );
};

export const isInBugPriority = (value: string) => {
  return allBugPriority.includes(value as T_BugPriority);
};

export const isInBugStatus = (value: string) => {
  return allBugStatus.includes(value as T_BugStatus);
};

export const isInBugEnvironment = (value: string) => {
  return allBugEnvironment.includes(value as T_BugEnvironment);
};

export const isInLanguages = (value: string) => {
  return allLanguages.includes(value as T_Language);
};

export const isInListingDeleteReason = (value: string) => {
  return allListingDeleteReason.includes(value as T_ListingDeleteReason);
};

export const isInListingStatus = (value: string) => {
  return allListingStatus.includes(value as T_ListingStatus);
};

export const isInListingPaymentStatus = (value: string) => {
  return allListingPaymentStatus.includes(value as T_ListingPaymentStatus);
};

export const isInListingCategory = (value: string) => {
  return allListingCategory.includes(value as T_ListingCategory);
};

export const isInWorkMode = (value: string) => {
  return allWorkMode.includes(value as T_WorkMode);
};

export const isInReportType = (value: string) => {
  return allReportType.includes(value as T_ReportType);
};

export const isInLocationRadius = (value: number) => {
  return allLocationRadius.includes(value as T_LocationRadius);
};
