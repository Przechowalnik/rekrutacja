import { Box, Flex } from "@mantine/core";
import { FormErrors, useForm } from "@mantine/form";
import dayjs from "dayjs";
import { SyntheticEvent, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes, routesExtra } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSubmitWithActions } from "~/hooks/useSubmitWithActions";
import { useUser } from "~/hooks/useUser";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import {
  E_ListingPaymentStatus,
  E_ListingStatus,
  E_Roles,
} from "~/models/enums";
import { T_Listing } from "~/models/listing";
import { T_Product } from "~/models/product";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { CardSummary } from "~/ui/CardSummary";
import { Checkbox } from "~/ui/Checkbox";
import { Collapse } from "~/ui/Collapse";
import { Form } from "~/ui/Form";
import { InputWrapper } from "~/ui/InputWrapper";
import { Link } from "~/ui/Link";
import { ModalCondition } from "~/ui/ModalCondition";
import { Section } from "~/ui/Section";
import { SelectListingExtension } from "~/ui/SelectListingExtension";
import { Text } from "~/ui/Text";
import { Title } from "~/ui/Title";
import { Tooltip } from "~/ui/Tooltip";
import {
  hasDateExpired,
  isExpiringIn,
  replaceDateToYearMonthHoursMinutesInWordsDay,
} from "~/utilities/date";
import { isFreeListings } from "~/utilities/flags";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";
import {
  calculatePointsFromMonths,
  calculatePriceFromMonths,
} from "~/utilities/functions";

type T_ReusableListingsPaymentsPage = {
  isCompany: boolean;
  listing: T_Listing;
  product: T_Product;
};

export const ReusableListingsPaymentsPage = ({
  isCompany,
  listing,
  product,
}: T_ReusableListingsPaymentsPage) => {
  const { getLocalizedRoute } = useLocalizedRoute();
  const [checkedUseCompanyCard, setCheckedUseCompanyCard] = useState(false);
  const [checkedUsePoints, setCheckedUsePoints] = useState(false);
  const [extension, setExtension] = useState<null | number>(null);
  const [showModalConfirmExtend, setShowModalConfirmExtend] = useState(false);

  const { user } = useUser();
  const submit = useSubmitWithActions();
  const { t } = useTranslation(
    isCompany
      ? namespaces.companyListingsPayments
      : namespaces.accountListingsPayments,
  );
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);

  const isFreeListingConfiguration = isFreeListings();

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {
      [formNames.checkboxListingUseCompanyCard]: false,
      [formNames.checkboxListingUsePoints]: false,
      [formNames.listingExtension]: "",
    },
    mode: "uncontrolled",
    onValuesChange(values) {
      const {
        checkboxListingUseCompanyCard,
        checkboxListingUsePoints,
        listingExtension,
      } = values;
      setExtension(
        typeof listingExtension === "string" ? Number(listingExtension) : null,
      );
      setCheckedUseCompanyCard(checkboxListingUseCompanyCard);
      setCheckedUsePoints(checkboxListingUsePoints);
    },
    validate: {
      [formNames.checkboxListingUseCompanyCard]: value =>
        checkFormValidator({
          formName: formNames.checkboxListingUseCompanyCard,
          optional: true,
          value,
        }),
      [formNames.checkboxListingUsePoints]: value =>
        checkFormValidator({
          formName: formNames.checkboxListingUsePoints,
          optional: true,
          value,
        }),
      [formNames.listingExtension]: value =>
        checkFormValidator({
          formName: formNames.listingExtension,
          optional: isFreeListingConfiguration,
          value,
        }),
    },
  });

  const neededPointsToPayment = calculatePointsFromMonths({
    months: extension ?? 0,
    product,
  });

  const neededPriceToPayment = calculatePriceFromMonths({
    months: extension ?? 0,
    product,
  });

  const validBalance = isCompany
    ? (user?.company?.points?.balance ?? 0)
    : (user?.points?.balance ?? 0);

  const disabledCheckboxUsePoints =
    !extension || neededPointsToPayment > validBalance;

  const companyHasAvailableCard =
    !!user?.company?.stripe?.customerHasCard &&
    user?.role === E_Roles.B2B_OWNER &&
    isCompany;

  const lastPaymentLink = listing?.payments?.at(0)?.stripeCheckoutUrl;
  const lastPayment = listing?.payments?.at(0);
  const isNewListing = !listing?.payments?.some(
    item =>
      item.status === E_ListingPaymentStatus.FREE ||
      item.status === E_ListingPaymentStatus.PAID,
  );

  const showCompanyExtend =
    isCompany && user?.company?.isAvailableSlotsToCreateNewListing;

  const isActiveButtonGoBackToPayment = lastPayment
    ? !hasDateExpired(
        dayjs(lastPayment.createdAt).add(24, "hour").toISOString(),
      )
    : false;

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

  useEffect(() => {
    form.setFieldValue(formNames.checkboxListingUsePoints, false);
  }, [extension]);

  useEffect(() => {
    if (checkedUseCompanyCard) {
      form.setFieldValue(formNames.checkboxListingUsePoints, false);
    }
  }, [checkedUseCompanyCard]);

  useEffect(() => {
    if (checkedUsePoints) {
      form.setFieldValue(formNames.checkboxListingUseCompanyCard, false);
    }
  }, [checkedUsePoints]);

  const handleExtendListing = useCallback(() => {
    setShowModalConfirmExtend(true);
  }, []);

  const handleCloseModalConfirmExtend = useCallback(() => {
    setShowModalConfirmExtend(false);
  }, []);

  const handleOnConfirmExtend = () => {
    if (!user?.company || !isCompany || isFreeListingConfiguration) {
      return;
    }

    submit(
      convertToFormData({
        [formNames.listingId]: listing.id,
      }),
      {
        action: linkCurrent,
        method: "patch",
      },
    );

    setShowModalConfirmExtend(false);
  };

  const handleSubmitErrors = (
    validationErrors: FormErrors,
    _values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();
    showAllErrorsForm({ tNotifications, validationErrors });
  };

  const handleSubmit = (
    values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();

    const {
      checkboxListingUseCompanyCard,
      checkboxListingUsePoints,
      listingExtension,
    } = values;

    submit(
      convertToFormData(
        isFreeListingConfiguration
          ? {}
          : {
              [formNames.listingExtension]: listingExtension,
              ...(companyHasAvailableCard
                ? {
                    [formNames.checkboxListingUseCompanyCard]:
                      checkboxListingUseCompanyCard,
                  }
                : {}),
              ...(disabledCheckboxUsePoints
                ? {}
                : {
                    [formNames.checkboxListingUsePoints]:
                      checkboxListingUsePoints,
                  }),
            },
      ),
      {
        action: linkCurrent,
        method: "post",
      },
    );
  };

  const contentButtonGoBack = (
    <Link fullWidthOnMobile to={linkGoBack}>
      <ButtonArrowLeft />
    </Link>
  );

  const submitButtonLabel = (() => {
    if (checkedUseCompanyCard && companyHasAvailableCard) {
      return t("buttonPay");
    }

    if (checkedUsePoints) {
      return t("buttonUsePoints");
    }

    return t("buttonExtension");
  })();

  const contentButtons = (
    <>
      {lastPaymentLink && isActiveButtonGoBackToPayment && (
        <Link customHref={lastPaymentLink} fullWidthOnMobile>
          <Button color="dark" variant="filled">
            {t("buttonGoToLastPayment")}
          </Button>
        </Link>
      )}
      <Button
        disabled={!extension}
        tooltip={{
          label: t("noSelectExtension"),
        }}
        type="submit"
      >
        {submitButtonLabel}
      </Button>
    </>
  );

  const contentInputs = (
    <>
      <Title center order={2} pb={24}>
        {isNewListing ? t("titleNewExtension") : t("titleExtension")}
      </Title>
      <InputWrapper>
        <SelectListingExtension form={form} required />
        {companyHasAvailableCard && (
          <Checkbox
            key={form.key(formNames.checkboxListingUseCompanyCard)}
            name={formNames.checkboxListingUseCompanyCard}
            required={false}
            {...form.getInputProps(formNames.checkboxListingUseCompanyCard, {
              type: "checkbox",
            })}
            disabled={!extension}
          />
        )}
        <Tooltip
          disabled={
            typeof extension === "number" ? !disabledCheckboxUsePoints : true
          }
          fullWidth
          label={tCommon("tooltipNotEnoughPoints")}
        >
          <Checkbox
            description={
              neededPointsToPayment
                ? t("descriptionCheckboxListingUsePoints", {
                    countCurrentPoints: isCompany
                      ? (user?.company?.points?.balance ?? 0)
                      : (user?.points?.balance ?? 0),
                    countPoints: neededPointsToPayment || "-",
                  })
                : ""
            }
            disabled={disabledCheckboxUsePoints}
            key={form.key(formNames.checkboxListingUsePoints)}
            name={formNames.checkboxListingUsePoints}
            pointerEventsForTooltipOnDisabled
            required={false}
            {...form.getInputProps(formNames.checkboxListingUsePoints, {
              type: "checkbox",
            })}
          />
        </Tooltip>
      </InputWrapper>
      <Collapse fullWith opened={typeof extension === "number"}>
        <CardSummary amount={neededPriceToPayment} pt={48} />
      </Collapse>
    </>
  );

  const alertLabel = (() => {
    if (!isActive || !listing.expiresAt) {
      return t("alert");
    }

    if (isHidden) {
      return t("hidden");
    }

    return;
  })();

  let buttons: React.ReactNode;

  if (isFreeListingConfiguration) {
    buttons = (
      <>
        {contentButtonGoBack}
        <Button
          disabled={isActive && !isActiveAndExpiresInOneMonth}
          tooltip={{ label: t("tooltipFreeExtend") }}
          type="submit"
        >
          {isActive ? t("buttonExtend") : t("buttonReAdd")}
        </Button>
      </>
    );
  } else if (showCompanyExtend) {
    buttons = contentButtonGoBack;
  } else {
    buttons = (
      <>
        {contentButtonGoBack}
        {contentButtons}
      </>
    );
  }

  return (
    <>
      <ModalCondition
        onClose={handleCloseModalConfirmExtend}
        onSuccess={handleOnConfirmExtend}
        opened={showModalConfirmExtend && isCompany && !!user?.company}
      />
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
          buttons={buttons}
          description={
            isFreeListingConfiguration
              ? t("descriptionFreeListings")
              : undefined
          }
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
          title={t("title")}
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
          withMinHeight={!showCompanyExtend}
        >
          {!isFreeListingConfiguration && !showCompanyExtend && contentInputs}
        </Section>
        {!isFreeListingConfiguration && showCompanyExtend && (
          <>
            <Section
              backgroundSecondary
              withMinHeight={false}
              withPageMeta={false}
            >
              <Box pb={48}>
                <Title center order={2} withTextsToUi>
                  {t("extendByMonths", {
                    count:
                      user?.company?.activePlanInSubscriptionOrFreeTrial
                        ?.listingDurationMonths ?? 0,
                  })}
                </Title>
                <Text center mt={12} size="md" withTextsToUi>
                  {t("availableSlots", {
                    countAvailableListings:
                      user?.company?.availableSlotToCreateNewListing,
                  })}
                </Text>
                <Flex align="center" justify="center" w="100%">
                  <Button
                    color="dark"
                    mt={48}
                    onClick={handleExtendListing}
                    size="md"
                    variant="filled"
                    w={300}
                  >
                    {isNewListing ? t("buttonAdd") : t("buttonExtend")}
                  </Button>
                </Flex>
              </Box>
            </Section>
            <Section
              buttons={contentButtons}
              size="sm"
              title=""
              withMinHeight
              withPageMeta={false}
            >
              {contentInputs}
            </Section>
          </>
        )}
      </Form>
    </>
  );
};
