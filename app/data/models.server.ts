import { $Enums } from "generated/prisma/client";

export const E_LanguagesServer = $Enums.Languages;
export const E_ReportTypeServer = $Enums.ReportType;
export const E_ListingPaymentStatusServer = $Enums.ListingPaymentStatus;
export const E_ListingEntryOptionServer = $Enums.ListingEntryOption;
export const E_ListingSecurityOptionServer = $Enums.ListingSecurityOption;
export const E_ListingUtilityOptionServer = $Enums.ListingUtilityOption;
export const E_ListingComfortOptionServer = $Enums.ListingComfortOption;
export const E_ListingUsageOptionServer = $Enums.ListingUsageOptions;
export const E_ListingAccessServer = $Enums.ListingAccess;
export const E_ListingContractTypeServer = $Enums.ListingContractType;
export const E_ListingParkingTypeServer = $Enums.ListingParkingType;
export const E_ListingContainerTypeServer = $Enums.ListingContainerType;
export const E_ListingStatusServer = $Enums.ListingStatus;
export const E_ListingDeleteReasonServer = $Enums.ListingDeleteReason;
export const E_ListingTypeServer = $Enums.ListingType;
export const E_ListingConditionServer = $Enums.ListingCondition;
export const E_ListingUnitTypeServer = $Enums.ListingUnitType;
export const E_ListingPlotTypeServer = $Enums.ListingPlotType;
export const E_ListingCategoryServer = $Enums.ListingCategory;
export const E_ListingInteractionTypeServer = $Enums.ListingInteractionType;
export const E_CompanyWorkerPermissionsServer = $Enums.CompanyWorkerPermission;
export const E_RolesServer = $Enums.Role;
export const E_CompanyWorkerRolesWithoutOwnerServer = {
  B2B_WORKER: $Enums.Role.B2B_WORKER,
};
export type T_CompanyWorkerPermissionsServer =
  keyof typeof E_CompanyWorkerPermissionsServer;
export type T_UserRolesServer = keyof typeof E_RolesServer;

export const E_SubscriptionStatusServer = $Enums.SubscriptionStatus;
export const E_CountryServer = $Enums.Country;
export const E_TaxCountryServer = $Enums.TaxCountry;
export const E_PlanTypeServer = $Enums.PlanType;
export type T_PlanTypeServer = keyof typeof E_PlanTypeServer;
export const E_PlanIntervalServer = $Enums.PlanInterval;
export const E_BugPriorityServer = $Enums.BugPriority;
export const E_BugEnvironmentServer = $Enums.BugEnvironment;
export const E_BugStatusServer = $Enums.BugStatus;

export enum E_CountryCodeServer {
  POLAND = "48",
}

export type T_LanguagesServer = keyof typeof E_LanguagesServer;
export type T_ListingStatusServer = keyof typeof E_ListingStatusServer;
export type T_ListingTypeServer = keyof typeof E_ListingTypeServer;
export type T_ListingCategoryServer = keyof typeof E_ListingCategoryServer;
export type T_CountryServer = keyof typeof E_CountryServer;
