import { ComboboxItem } from "@mantine/core";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useUser } from "~/hooks/useUser";
import { formNames } from "~/lib/zodFormValidator";
import {
  E_CompanyWorkerPermissions,
  E_ListingStatus,
  T_ListingStatus,
} from "~/models/enums";
import { T_Listings, Z_Listings } from "~/models/listings";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { CardListing } from "~/ui/CardListing";
import { InfiniteDataQueryPagination } from "~/ui/InfiniteDataQueryPagination";
import { Section } from "~/ui/Section";
import { SelectListingStatus } from "~/ui/SelectListingStatus";
import { checkCompanyUserPermissions } from "~/utilities/functions";

type T_ReusableListingsPage = {
  isCompany: boolean;
  listings: T_Listings;
  nextPage: null | number;
  totalPages: null | number | undefined;
};

export const ReusableListingsPage = ({
  isCompany,
  listings,
  nextPage,
  totalPages,
}: T_ReusableListingsPage) => {
  const [selectedListingStatus, setSelectedListingStatus] =
    useState<null | T_ListingStatus>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const { t } = useTranslation(
    isCompany ? namespaces.companyListings : namespaces.accountListings,
  );
  const { t: tCommon } = useTranslation(namespaces.common);
  const { user } = useUser();

  const disabledButtonNew = isCompany
    ? !user?.company?.phone?.verifiedAt
    : !user?.phone?.verifiedAt;

  const handleUpdateListingStatus = useCallback(
    (newValue: ComboboxItem | null | string) => {
      setSelectedListingStatus(
        typeof newValue === "string"
          ? (newValue as null | T_ListingStatus)
          : null,
      );
      setReloadTrigger(previousState => previousState + 1);
    },
    [],
  );

  const extraQuery = useMemo(() => {
    return {
      ...(selectedListingStatus
        ? {
            [formNames.listingStatus]: selectedListingStatus,
          }
        : {}),
    };
  }, [selectedListingStatus]);

  return (
    <Section
      breadcrumbs={
        isCompany
          ? [E_Routes.home, E_Routes.company, E_Routes.companyListings]
          : [E_Routes.home, E_Routes.account, E_Routes.accountListings]
      }
      buttons={
        <>
          <ButtonArrowLeft
            routeTo={isCompany ? E_Routes.company : E_Routes.account}
            textGoBack
          />
          {!isCompany && (
            <Button
              disabled={disabledButtonNew}
              routeTo={E_Routes.accountListingsNew}
              tooltip={{
                label: tCommon("navigation.tooltipNewListingDisabledAccount"),
              }}
            >
              {t("buttonNew")}
            </Button>
          )}
          {isCompany &&
            checkCompanyUserPermissions({
              permissions: [E_CompanyWorkerPermissions.MANAGE_LISTINGS],
              user,
            }) && (
              <Button
                disabled={disabledButtonNew}
                routeTo={E_Routes.companyListingsNew}
                tooltip={{
                  label: tCommon("navigation.tooltipNewListingDisabledCompany"),
                }}
              >
                {t("buttonNew")}
              </Button>
            )}
        </>
      }
      filters={[
        <SelectListingStatus
          defaultValue={E_ListingStatus.ACTIVE}
          key="listingStatus"
          onChange={handleUpdateListingStatus}
          value={selectedListingStatus}
          variant="default"
        />,
      ]}
      filtersDefaultOpen={false}
      fullHeight
      information={t("information")}
      pageMeta={{
        route: isCompany ? E_Routes.companyListings : E_Routes.accountListings,
      }}
      size="lg"
      title={t("title")}
    >
      <InfiniteDataQueryPagination
        data={{
          items: listings,
          nextPage: nextPage,
          totalPages: totalPages,
        }}
        extraQuery={extraQuery}
        limit={10}
        noMoreDataDescription={t("noData")}
        reloadTrigger={reloadTrigger}
        renderItem={item => {
          return (
            <CardListing
              isCompany={isCompany}
              key={`listing_${item.id}`}
              listing={item}
            />
          );
        }}
        schema={Z_Listings}
      />
    </Section>
  );
};
