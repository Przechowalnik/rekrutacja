import { List } from "@mantine/core";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useUser } from "~/hooks/useUser";
import { showPhoneNumber } from "~/lib/validations";
import {
  E_CompanyWorkerPermissions,
  E_ListingStatus,
  E_Roles,
  T_ListingStatus,
} from "~/models/enums";
import { T_Listings } from "~/models/listings";
import {
  hasDateExpired,
  replaceDateToYearMonthHoursMinutesInWordsDay,
} from "~/utilities/date";
import {
  checkCompanyUserPermissions,
  generateLocationAddress,
} from "~/utilities/functions";
import { generateSalaryRange } from "~/utilities/price";

import type { T_CardBadge } from "../Card";
import { Card } from "../Card";
import { Text } from "../Text";

const statusColorMap: Record<T_ListingStatus, string> = {
  [E_ListingStatus.ACTIVE]: "green",
  [E_ListingStatus.ARCHIVED]: "red",
  [E_ListingStatus.DELETED]: "red",
  [E_ListingStatus.EXPIRED]: "orange",
  [E_ListingStatus.INACTIVE]: "red",
  [E_ListingStatus.REJECTED]: "red",
  [E_ListingStatus.UNPAID]: "red",
};

type T_CardListing = {
  isCompany: boolean;
  listing: T_Listings[number];
};

const CardListingToMemoize = ({ isCompany, listing }: T_CardListing) => {
  const { t } = useTranslation(namespaces.common);
  const { getLocalizedRoute } = useLocalizedRoute();
  const { user } = useUser();

  const hasPermissionToEdit =
    ((!user?.company && user?.role === E_Roles.USER) ||
      checkCompanyUserPermissions({
        permissions: [E_CompanyWorkerPermissions.MANAGE_LISTINGS],
        user,
      })) &&
    listing.status !== E_ListingStatus.DELETED;

  const isExpires = listing.expiresAt
    ? hasDateExpired(listing.expiresAt.toString())
    : false;

  const isHidden = false;

  let phoneNumber: bigint | null | number = null;
  let phoneCountryCode: bigint | null | number = null;
  if (listing?.company?.phone?.countryCode && listing?.company?.phone?.number) {
    phoneNumber = listing?.company?.phone?.number;
    phoneCountryCode = listing?.company?.phone?.countryCode;
  } else if (
    listing?.user?.phone?.countryCode &&
    listing?.user?.phone?.number
  ) {
    phoneNumber = listing?.user?.phone?.number;
    phoneCountryCode = listing?.user?.phone?.countryCode;
  }

  const badgeColor = (() => {
    if (listing.status !== E_ListingStatus.ACTIVE) {
      return statusColorMap[listing.status] ?? "gray";
    }
    if (isHidden) {
      return statusColorMap.EXPIRED;
    }
    if (isExpires) {
      return statusColorMap[E_ListingStatus.EXPIRED];
    }
    return statusColorMap[listing.status];
  })();

  const badgeLabel = (() => {
    if (listing.status !== E_ListingStatus.ACTIVE) {
      return t(`listingStatus.${listing.status}`);
    }
    if (isHidden) {
      return t("listingStatus.HIDDEN");
    }
    if (isExpires) {
      return t(`listingStatus.${E_ListingStatus.EXPIRED}`);
    }
    return t(`listingStatus.${listing.status}`);
  })();

  const badges: T_CardBadge[] = [
    {
      color: badgeColor,
      label: badgeLabel,
    },
  ];

  return (
    <Card
      badges={badges}
      color={hasPermissionToEdit ? undefined : "gray"}
      customButtons={
        hasPermissionToEdit
          ? [
              {
                label: t("cardListing.buttonDetails"),
              },
            ]
          : undefined
      }
      href={getLocalizedRoute({
        extraPath: `/${listing.slug ?? listing.id}`,
        route: isCompany ? E_Routes.companyListings : E_Routes.accountListings,
      })}
      isEditable={!!hasPermissionToEdit}
      minHeight={{
        base: "auto",
        xs: hasPermissionToEdit ? 500 : 450,
      }}
      title={listing.title}
      titleLineClamp={1}
      withOpacityEffect
    >
      <List c="white" pr={12}>
        {listing.expiresAt && (
          <List.Item>
            <Text c="white" size="sm">
              {t("cardListing.expiresAt")}:{" "}
              <b>
                {replaceDateToYearMonthHoursMinutesInWordsDay({
                  date: listing.expiresAt.toString(),
                  withNbsp: false,
                })}
              </b>
            </Text>
          </List.Item>
        )}
        {listing.availableFrom && (
          <List.Item>
            <Text c="white" size="sm">
              {t("cardListing.availableFrom")}:{" "}
              <b>
                {replaceDateToYearMonthHoursMinutesInWordsDay({
                  date: listing.availableFrom.toString(),
                  withNbsp: false,
                })}
              </b>
            </Text>
          </List.Item>
        )}
        <List.Item>
          <Text c="white" size="sm">
            {t("inputs.listingWorkMode")}:{" "}
            <b>{t(`workMode.${listing.workMode}`)}</b>
          </Text>
        </List.Item>
        <List.Item>
          <Text c="white" size="sm">
            {t("inputs.listingCategory")}:{" "}
            <b>{t(`listingCategory.${listing.category}`)}</b>
          </Text>
        </List.Item>
        {(listing?.salaryFrom != null || listing?.salaryTo != null) && (
          <List.Item>
            <Text c="white" size="sm">
              {t("inputs.listingSalary")}:{" "}
              <b>
                {generateSalaryRange({
                  salaryFrom: listing.salaryFrom,
                  salaryTo: listing.salaryTo,
                  tCommon: t,
                })}
              </b>
            </Text>
          </List.Item>
        )}
        <List.Item>
          <Text c="white" size="sm">
            {t("cardListing.countImages")}: <b>{listing.images.length}</b>
          </Text>
        </List.Item>
        {listing.location && (
          <List.Item>
            <Text c="white" size="sm">
              {t("cardListing.address")}:{" "}
              <b>
                {generateLocationAddress({
                  city: listing.location.city ?? null,
                  cityCustom: listing.location.cityCustom ?? null,
                  district: listing.location.district ?? null,
                  flatNumber: listing.location.flatNumber,
                  streetName: listing.location.streetName,
                  streetNumber: listing.location.streetNumber,
                })}
              </b>
            </Text>
          </List.Item>
        )}
        {phoneNumber && phoneCountryCode && (
          <List.Item>
            <Text c="white" size="sm">
              {t("inputs.phone")}:{" "}
              <b>
                {showPhoneNumber({
                  phoneCountryCode,
                  phoneNumber,
                })}
              </b>
            </Text>
          </List.Item>
        )}
      </List>
    </Card>
  );
};

export const CardListing = memo(CardListingToMemoize);
