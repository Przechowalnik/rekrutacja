import { FormErrors, useForm } from "@mantine/form";
import { SyntheticEvent } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes, routesExtra } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSubmitWithActions } from "~/hooks/useSubmitWithActions";
import { E_ListingStatus } from "~/models/enums";
import { T_Listing } from "~/models/listing";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { Form } from "~/ui/Form";
import { Link } from "~/ui/Link";
import { Section } from "~/ui/Section";
import {
  hasDateExpired,
  isExpiringIn,
  replaceDateToYearMonthHoursMinutesInWordsDay,
} from "~/utilities/date";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";

type T_ReusableListingsPaymentsPage = {
  isCompany: boolean;
  listing: T_Listing;
};

export const ReusableListingsPaymentsPage = ({
  isCompany,
  listing,
}: T_ReusableListingsPaymentsPage) => {
  const { getLocalizedRoute } = useLocalizedRoute();
  const submit = useSubmitWithActions();
  const { t } = useTranslation(
    isCompany
      ? namespaces.companyListingsPayments
      : namespaces.accountListingsPayments,
  );
  const { t: tNotifications } = useTranslation(namespaces.notifications);

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {},
    mode: "uncontrolled",
  });

  const isNewListing = !listing?.payments?.some(item => item.free);

  const isActive = listing.expiresAt
    ? !hasDateExpired(listing.expiresAt.toString()) &&
      listing.status === E_ListingStatus.ACTIVE
    : false;

  const isActiveAndExpiresInThreeDays = listing.expiresAt
    ? isExpiringIn({
        days: 3,
        expirationDate: listing.expiresAt.toString(),
      }) && isActive
    : false;

  const isActiveAndExpiresInOneMonth = listing.expiresAt
    ? isExpiringIn({
        expirationDate: listing.expiresAt.toString(),
        months: 1,
      }) && isActive
    : false;

  const isHidden = listing.availableTo
    ? new Date(listing.availableTo) <= new Date()
    : false;

  const linkGoBack = getLocalizedRoute({
    extraPath: `/${listing.slug ?? listing.id}`,
    route: isCompany
      ? E_Routes.companyListingsEdit
      : E_Routes.accountListingsEdit,
  });

  const linkCurrent = getLocalizedRoute({
    extraPath: `/${listing.slug ?? listing.id}${isCompany ? routesExtra[E_Routes.companyListings].payments : routesExtra[E_Routes.accountListings].payments}`,
    route: isCompany
      ? E_Routes.companyListingsPayments
      : E_Routes.accountListingsPayments,
  });

  const handleSubmitErrors = (
    validationErrors: FormErrors,
    _values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();
    showAllErrorsForm({ tNotifications, validationErrors });
  };

  const handleSubmit = (
    _values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();

    submit(convertToFormData({}), {
      action: linkCurrent,
      method: "post",
    });
  };

  const alertLabel = (() => {
    if (!isActive || !listing.expiresAt) {
      return t("alert");
    }

    if (isHidden) {
      return t("hidden");
    }

    return;
  })();

  return (
    <Form onSubmit={form.onSubmit(handleSubmit, handleSubmitErrors)}>
      <Section
        alert={alertLabel}
        breadcrumbs={[
          E_Routes.home,
          isCompany ? E_Routes.company : E_Routes.account,
          isCompany ? E_Routes.companyListings : E_Routes.accountListings,
          {
            customHref: linkGoBack,
            route: isCompany
              ? E_Routes.companyListingsEdit
              : E_Routes.accountListingsEdit,
          },
          {
            customHref: linkCurrent,
            route: isCompany
              ? E_Routes.companyListingsPayments
              : E_Routes.accountListingsPayments,
          },
        ]}
        buttons={
          <>
            <Link fullWidthOnMobile to={linkGoBack}>
              <ButtonArrowLeft />
            </Link>
            <Button
              disabled={isActive && !isActiveAndExpiresInOneMonth}
              tooltip={{ label: t("tooltipFreeExtend") }}
              type="submit"
            >
              {isActive ? t("buttonExtend") : t("buttonReAdd")}
            </Button>
          </>
        }
        description={t("descriptionFreeListings")}
        pageMeta={{
          route: isCompany
            ? E_Routes.companyListingsPayments
            : E_Routes.accountListingsPayments,
        }}
        size="sm"
        success={
          isActive &&
          listing.expiresAt &&
          !isActiveAndExpiresInOneMonth &&
          !isActiveAndExpiresInThreeDays
            ? t("success", {
                date: replaceDateToYearMonthHoursMinutesInWordsDay({
                  date: listing.expiresAt.toString(),
                  withNbsp: false,
                }),
              })
            : undefined
        }
        title={isNewListing ? t("titleNewExtension") : t("title")}
        warning={
          isActive &&
          listing.expiresAt &&
          (isActiveAndExpiresInOneMonth || isActiveAndExpiresInThreeDays)
            ? t("success", {
                date: replaceDateToYearMonthHoursMinutesInWordsDay({
                  date: listing.expiresAt.toString(),
                  withNbsp: false,
                }),
              })
            : undefined
        }
        withMinHeight
      />
    </Form>
  );
};
