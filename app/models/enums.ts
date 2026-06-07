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

export const E_SubscriptionStatus = {
  ACTIVE: "ACTIVE",
  CANCELLED: "CANCELLED",
  PENDING: "PENDING",
  TO_BE_CANCELLED: "TO_BE_CANCELLED",
  TRIALING: "TRIALING",
  UNPAID: "UNPAID",
} as const;

export const E_PlanInterval = {
  DAY: "DAY",
  MONTH: "MONTH",
  WEEK: "WEEK",
  YEAR: "YEAR",
} as const;

export const E_PlanType = {
  BASIC: "BASIC",
  PREMIUM: "PREMIUM",
  STANDARD: "STANDARD",
  TRIAL: "TRIAL",
  ULTIMATE: "ULTIMATE",
} as const;

export const E_ListingType = {
  RENT: "RENT",
  SALE: "SALE",
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
  RENTED: "RENTED",
  SOLD: "SOLD",
} as const;

export const E_ListingPaymentStatus = {
  EXPIRED: "EXPIRED",
  FREE: "FREE",
  PAID: "PAID",
  PENDING: "PENDING",
  REJECTED: "REJECTED",
  UNPAID: "UNPAID",
} as const;

export const E_ListingSecurityOption = {
  ALARM: "ALARM",
  AUTOMATIC_GATE: "AUTOMATIC_GATE",
  BARRIER: "BARRIER",
  DOOR_LOCK: "DOOR_LOCK",
  ELECTRONIC_LOCK: "ELECTRONIC_LOCK",
  MANUAL_GATE: "MANUAL_GATE",
  MONITORING: "MONITORING",
  PADLOCK: "PADLOCK",
  REMOTE_CONTROL: "REMOTE_CONTROL",
  SECURITY: "SECURITY",
} as const;

export const E_ListingAccess = {
  ACCESS_24H: "ACCESS_24H",
  LIMITED_HOURS: "LIMITED_HOURS",
} as const;

export const E_ListingUtilityOption = {
  ELECTRICITY: "ELECTRICITY",
  SEWAGE: "SEWAGE",
  WATER: "WATER",
} as const;

export const E_ListingCondition = {
  FINISHED: "FINISHED",
  NEEDS_RENOVATION: "NEEDS_RENOVATION",
  NEW: "NEW",
  PARTIALLY_FINISHED: "PARTIALLY_FINISHED",
  RAW: "RAW",
} as const;

export const E_ListingPlotType = {
  AGRICULTURAL: "AGRICULTURAL",
  BUILDING: "BUILDING",
  FOREST: "FOREST",
  INVESTMENT: "INVESTMENT",
  RECREATIONAL: "RECREATIONAL",
  SERVICE: "SERVICE",
} as const;

export const E_ListingUnitType = {
  CONFERENCE_ROOM: "CONFERENCE_ROOM",
  OFFICE: "OFFICE",
  PRODUCTION: "PRODUCTION",
  RETAIL: "RETAIL",
  SERVICE: "SERVICE",
  WAREHOUSE: "WAREHOUSE",
} as const;

export const E_ListingComfortOption = {
  HEATED: "HEATED",
  LIGHTING: "LIGHTING",
  PARKING: "PARKING",
  VENTILATION: "VENTILATION",
} as const;

export const E_ListingEntryOption = {
  ELEVATOR: "ELEVATOR",
  STAIRCASE: "STAIRCASE",
  STREET_ENTRANCE: "STREET_ENTRANCE",
} as const;

export const E_ListingCategory = {
  ATTIC: "ATTIC",
  BANQUET_HALL: "BANQUET_HALL",
  BASEMENT: "BASEMENT",
  CONTAINER: "CONTAINER",
  PARKING: "PARKING",
  PLOT: "PLOT",
  ROOM: "ROOM",
  STORAGE_UNIT: "STORAGE_UNIT",
  UNIT: "UNIT",
  WAREHOUSE: "WAREHOUSE",
} as const;

export const E_ListingCategorySlug = {
  ATTIC: "strychy",
  BANQUET_HALL: "sala-bankietowa-weselna",
  BASEMENT: "piwnice",
  CONTAINER: "kontenery",
  PARKING: "garaze-miejsca-postojowe",
  PLOT: "dzialki",
  ROOM: "pokoje",
  STORAGE_UNIT: "komorki-lokatorskie",
  UNIT: "lokale",
  WAREHOUSE: "magazyny",
} as const;

export const E_ListingUsageOptions = {
  CAR_ACCESS: "CAR_ACCESS",
  TIR_ACCESS: "TIR_ACCESS",
} as const;

export const E_ListingParkingType = {
  DETACHED: "DETACHED",
  GROUND_PLACE: "GROUND_PLACE",
  MULTILEVEL_LIFT: "MULTILEVEL_LIFT",
  UNDERGROUND: "UNDERGROUND",
} as const;

export const E_ListingContainerType = {
  MARINE: "MARINE",
  MODULAR_RESIDENTIAL: "MODULAR_RESIDENTIAL",
  OFFICE_SOCIAL: "OFFICE_SOCIAL",
  REFRIGERATED: "REFRIGERATED",
  SANITARY: "SANITARY",
  WAREHOUSE: "WAREHOUSE",
} as const;

export const E_ListingContractType = {
  LONG_TERM: "LONG_TERM",
  SHORT_TERM: "SHORT_TERM",
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
export const Z_SubscriptionStatus = z.nativeEnum(E_SubscriptionStatus);
export const Z_PlanInterval = z.nativeEnum(E_PlanInterval);
export const Z_PlanType = z.nativeEnum(E_PlanType);
export const Z_ListingType = z.nativeEnum(E_ListingType);
export const Z_ListingStatus = z.nativeEnum(E_ListingStatus);
export const Z_ListingDeleteReason = z.nativeEnum(E_ListingDeleteReason);
export const Z_ListingPaymentStatus = z.nativeEnum(E_ListingPaymentStatus);
export const Z_ListingAccess = z.nativeEnum(E_ListingAccess);
export const Z_ListingSecurityOption = z.nativeEnum(E_ListingSecurityOption);
export const Z_ListingUtilityOption = z.nativeEnum(E_ListingUtilityOption);
export const Z_ListingCondition = z.nativeEnum(E_ListingCondition);
export const Z_ListingComfortOption = z.nativeEnum(E_ListingComfortOption);
export const Z_ListingPlotType = z.nativeEnum(E_ListingPlotType);
export const Z_ListingUnitType = z.nativeEnum(E_ListingUnitType);
export const Z_ListingCategory = z.nativeEnum(E_ListingCategory);
export const Z_ListingEntryOption = z.nativeEnum(E_ListingEntryOption);
export const Z_ListingUsageOptions = z.nativeEnum(E_ListingUsageOptions);
export const Z_ListingParkingType = z.nativeEnum(E_ListingParkingType);
export const Z_ListingContainerType = z.nativeEnum(E_ListingContainerType);
export const Z_ListingContractType = z.nativeEnum(E_ListingContractType);
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
export type T_SubscriptionStatus = z.infer<typeof Z_SubscriptionStatus>;
export type T_PlanInterval = z.infer<typeof Z_PlanInterval>;
export type T_PlanType = z.infer<typeof Z_PlanType>;
export type T_ListingType = z.infer<typeof Z_ListingType>;
export type T_ListingPaymentStatus = z.infer<typeof Z_ListingPaymentStatus>;
export type T_ListingStatus = z.infer<typeof Z_ListingStatus>;
export type T_ListingDeleteReason = z.infer<typeof Z_ListingDeleteReason>;
export type T_ListingCategory = z.infer<typeof Z_ListingCategory>;
export type T_ListingAccess = z.infer<typeof Z_ListingAccess>;
export type T_ListingSecurityOption = z.infer<typeof Z_ListingSecurityOption>;
export type T_ListingUtilityOption = z.infer<typeof Z_ListingUtilityOption>;
export type T_ListingCondition = z.infer<typeof Z_ListingCondition>;
export type T_ListingComfortOption = z.infer<typeof Z_ListingComfortOption>;
export type T_ListingPlotType = z.infer<typeof Z_ListingPlotType>;
export type T_ListingUnitType = z.infer<typeof Z_ListingUnitType>;
export type T_ListingEntryOption = z.infer<typeof Z_ListingEntryOption>;
export type T_ListingUsageOptions = z.infer<typeof Z_ListingUsageOptions>;
export type T_ListingParkingType = z.infer<typeof Z_ListingParkingType>;
export type T_ListingContainerType = z.infer<typeof Z_ListingContainerType>;
export type T_ListingContractType = z.infer<typeof Z_ListingContractType>;
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

export const allPlanIntervals: T_PlanInterval[] = [
  E_PlanInterval.DAY,
  E_PlanInterval.WEEK,
  E_PlanInterval.MONTH,
  E_PlanInterval.YEAR,
];

export const allPlanTypes: T_PlanType[] = [
  E_PlanType.TRIAL,
  E_PlanType.BASIC,
  E_PlanType.STANDARD,
  E_PlanType.PREMIUM,
  E_PlanType.ULTIMATE,
];

export const allLanguages: T_Language[] = [E_Language.PL, E_Language.EN];

export const allListingType: T_ListingType[] = [
  E_ListingType.RENT,
  E_ListingType.SALE,
];

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
  E_ListingDeleteReason.SOLD,
  E_ListingDeleteReason.RENTED,
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
  E_ListingCategory.ATTIC,
  E_ListingCategory.BASEMENT,
  E_ListingCategory.PARKING,
  E_ListingCategory.ROOM,
  E_ListingCategory.STORAGE_UNIT,
  E_ListingCategory.BANQUET_HALL,
  E_ListingCategory.WAREHOUSE,
  E_ListingCategory.PLOT,
  E_ListingCategory.UNIT,
  E_ListingCategory.CONTAINER,
];

export const allListingCategoryRent: T_ListingCategory[] = [
  E_ListingCategory.ATTIC,
  E_ListingCategory.BASEMENT,
  E_ListingCategory.PARKING,
  E_ListingCategory.ROOM,
  E_ListingCategory.STORAGE_UNIT,
  E_ListingCategory.BANQUET_HALL,
  E_ListingCategory.WAREHOUSE,
  E_ListingCategory.PLOT,
  E_ListingCategory.UNIT,
  E_ListingCategory.CONTAINER,
];

export const allListingCategorySale: T_ListingCategory[] = [
  E_ListingCategory.PARKING,
  E_ListingCategory.STORAGE_UNIT,
  E_ListingCategory.BANQUET_HALL,
  E_ListingCategory.WAREHOUSE,
  E_ListingCategory.PLOT,
  E_ListingCategory.UNIT,
  E_ListingCategory.CONTAINER,
];

export const allListingAccess: T_ListingAccess[] = [
  E_ListingAccess.ACCESS_24H,
  E_ListingAccess.LIMITED_HOURS,
];

export const allListingSecurityOptions: T_ListingSecurityOption[] = [
  E_ListingSecurityOption.ALARM,
  E_ListingSecurityOption.AUTOMATIC_GATE,
  E_ListingSecurityOption.ELECTRONIC_LOCK,
  E_ListingSecurityOption.MANUAL_GATE,
  E_ListingSecurityOption.MONITORING,
  E_ListingSecurityOption.PADLOCK,
  E_ListingSecurityOption.DOOR_LOCK,
  E_ListingSecurityOption.SECURITY,
  E_ListingSecurityOption.BARRIER,
  E_ListingSecurityOption.REMOTE_CONTROL,
];

export const allListingUtilityOptions: T_ListingUtilityOption[] = [
  E_ListingUtilityOption.ELECTRICITY,
  E_ListingUtilityOption.SEWAGE,
  E_ListingUtilityOption.WATER,
];

export const allListingConditions: T_ListingCondition[] = [
  E_ListingCondition.FINISHED,
  E_ListingCondition.NEEDS_RENOVATION,
  E_ListingCondition.NEW,
  E_ListingCondition.PARTIALLY_FINISHED,
  E_ListingCondition.RAW,
];

export const allListingComfortOptions: T_ListingComfortOption[] = [
  E_ListingComfortOption.HEATED,
  E_ListingComfortOption.LIGHTING,
  E_ListingComfortOption.PARKING,
  E_ListingComfortOption.VENTILATION,
];

export const allListingPlotTypes: T_ListingPlotType[] = [
  E_ListingPlotType.BUILDING,
  E_ListingPlotType.INVESTMENT,
  E_ListingPlotType.RECREATIONAL,
  E_ListingPlotType.AGRICULTURAL,
  E_ListingPlotType.SERVICE,
  E_ListingPlotType.FOREST,
];

export const allListingPlotTypesSale: T_ListingPlotType[] = [
  E_ListingPlotType.BUILDING,
  E_ListingPlotType.INVESTMENT,
  E_ListingPlotType.RECREATIONAL,
  E_ListingPlotType.AGRICULTURAL,
  E_ListingPlotType.FOREST,
];

export const allListingPlotTypesRent: T_ListingPlotType[] = [
  E_ListingPlotType.SERVICE,
  E_ListingPlotType.FOREST,
  E_ListingPlotType.AGRICULTURAL,
];

export const allListingUnitTypes: T_ListingUnitType[] = [
  E_ListingUnitType.CONFERENCE_ROOM,
  E_ListingUnitType.OFFICE,
  E_ListingUnitType.PRODUCTION,
  E_ListingUnitType.RETAIL,
  E_ListingUnitType.SERVICE,
  E_ListingUnitType.WAREHOUSE,
];

export const allListingEntryOptions: T_ListingEntryOption[] = [
  E_ListingEntryOption.ELEVATOR,
  E_ListingEntryOption.STAIRCASE,
  E_ListingEntryOption.STREET_ENTRANCE,
];

export const allListingUsageOptions: T_ListingUsageOptions[] = [
  E_ListingUsageOptions.CAR_ACCESS,
  E_ListingUsageOptions.TIR_ACCESS,
];

export const allListingParkingType: T_ListingParkingType[] = [
  E_ListingParkingType.DETACHED,
  E_ListingParkingType.MULTILEVEL_LIFT,
  E_ListingParkingType.UNDERGROUND,
  E_ListingParkingType.GROUND_PLACE,
];

export const allListingContainerType: T_ListingContainerType[] = [
  E_ListingContainerType.MARINE,
  E_ListingContainerType.MODULAR_RESIDENTIAL,
  E_ListingContainerType.OFFICE_SOCIAL,
  E_ListingContainerType.REFRIGERATED,
  E_ListingContainerType.SANITARY,
  E_ListingContainerType.WAREHOUSE,
];

export const allListingContractType: T_ListingContractType[] = [
  E_ListingContractType.SHORT_TERM,
  E_ListingContractType.LONG_TERM,
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

export const isInPlanTypes = (value: string) => {
  return allPlanTypes.includes(value as T_PlanType);
};

export const isInPlanIntervals = (value: string) => {
  return allPlanIntervals.includes(value as T_PlanInterval);
};

export const isInLanguages = (value: string) => {
  return allLanguages.includes(value as T_Language);
};

export const isInListingTypes = (value: string) => {
  return allListingType.includes(value as T_ListingType);
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
  return allListingCategoryRent.includes(value as T_ListingCategory);
};

export const isInListingAccess = (value: string) => {
  return allListingAccess.includes(value as T_ListingAccess);
};

export const isInListingSecurityOptions = (value: string) => {
  return allListingSecurityOptions.includes(value as T_ListingSecurityOption);
};

export const isInListingComfortOptions = (value: string) => {
  return allListingComfortOptions.includes(value as T_ListingComfortOption);
};

export const isInListingPlotTypes = (value: string) => {
  return allListingPlotTypes.includes(value as T_ListingPlotType);
};

export const isInListingPlotTypesRent = (value: string) => {
  return allListingPlotTypesRent.includes(value as T_ListingPlotType);
};

export const isInListingPlotTypesSale = (value: string) => {
  return allListingPlotTypesSale.includes(value as T_ListingPlotType);
};

export const isInListingUnitTypes = (value: string) => {
  return allListingUnitTypes.includes(value as T_ListingUnitType);
};

export const isInListingUtilityOptions = (value: string) => {
  return allListingUtilityOptions.includes(value as T_ListingUtilityOption);
};

export const isInListingConditions = (value: string) => {
  return allListingConditions.includes(value as T_ListingCondition);
};

export const isInListingEntryOptions = (value: string) => {
  return allListingEntryOptions.includes(value as T_ListingEntryOption);
};

export const isInListingUsageOptions = (value: string) => {
  return allListingUsageOptions.includes(value as T_ListingUsageOptions);
};

export const isInListingParkingType = (value: string) => {
  return allListingParkingType.includes(value as T_ListingParkingType);
};

export const isInListingContainerType = (value: string) => {
  return allListingContainerType.includes(value as T_ListingContainerType);
};

export const isInListingContractType = (value: string) => {
  return allListingContractType.includes(value as T_ListingContractType);
};

export const isInReportType = (value: string) => {
  return allReportType.includes(value as T_ReportType);
};

export const isInLocationRadius = (value: number) => {
  return allLocationRadius.includes(value as T_LocationRadius);
};
