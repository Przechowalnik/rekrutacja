import { Box, Flex } from "@mantine/core";
import { FormErrors, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { SyntheticEvent, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { inputMaxLength } from "~/constants/input";
import { namespaces } from "~/constants/namespaces";
import { E_Routes, routesExtra } from "~/constants/routes";
import { dynamic } from "~/hoc/dynamic";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSubmitWithActions } from "~/hooks/useSubmitWithActions";
import { useUser } from "~/hooks/useUser";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import {
  E_Country,
  E_ListingStatus,
  T_ListingDeleteReason,
} from "~/models/enums";
import { T_Listing } from "~/models/listing";
import { AutocompleteAddress } from "~/ui/AutocompleteAddress";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { Checkbox } from "~/ui/Checkbox";
import { Fieldset } from "~/ui/Fieldset";
import { Form } from "~/ui/Form";
import { Input } from "~/ui/Input";
import { InputCalendar } from "~/ui/InputCalendar";
import { InputPhone } from "~/ui/InputPhone";
import { InputWrapper } from "~/ui/InputWrapper";
import { Link } from "~/ui/Link";
import { ModalAuthenticator } from "~/ui/ModalAuthenticator";
import { ModalCondition } from "~/ui/ModalCondition";
import { Section } from "~/ui/Section";
import { T_SelectImagesUploaded } from "~/ui/SelectImages";
import { SelectListingCategory } from "~/ui/SelectListingCategory";
import { SelectWorkMode } from "~/ui/SelectWorkMode";
import { TextEditor } from "~/ui/TextEditor";
import {
  hasDateExpired,
  isExpiringIn,
  replaceDateToYearMonthHoursMinutesInWordsDay,
} from "~/utilities/date";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";
import {
  compareObjects,
  generateLocationAddressLastCity,
} from "~/utilities/functions";

const ModalDeleteListingReason = dynamic(() =>
  import("~/ui/ModalDeleteListingReason").then(module => ({
    default: module.ModalDeleteListingReason,
  })),
);

type T_ReusableListingsEditPage = {
  isCompany: boolean;
  listing: T_Listing;
};

export const ReusableListingsEditPage = ({
  isCompany,
  listing,
}: T_ReusableListingsEditPage) => {
  const { getLocalizedRoute } = useLocalizedRoute();
  const [uploadImagesGroupId] = useState<string>(() => crypto.randomUUID());
  const [authenticatorDeleteOpen, setAuthenticatorDeleteOpen] = useState(false);
  const [deleteReasonModalOpen, setDeleteReasonModalOpen] = useState(false);
  const [pendingDeleteReason, setPendingDeleteReason] =
    useState<null | T_ListingDeleteReason>(null);
  const [showModalConfirm, setShowModalConfirm] = useState(false);
  const [updatedImages] = useState<{
    removed: string[];
    uploaded: T_SelectImagesUploaded[];
  }>({
    removed: [],
    uploaded: [],
  });
  const [haveChanges, setHaveChanges] = useState(false);

  const { t } = useTranslation(
    isCompany ? namespaces.companyListingsEdit : namespaces.accountListingsEdit,
  );
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { user } = useUser();
  const submit = useSubmitWithActions();

  const phoneCountryCodeValue = (() => {
    if (isCompany) {
      return user?.company?.phone?.countryCode
        ? (user.company.phone.countryCode.toString() ?? "")
        : "";
    }
    return user?.phone?.countryCode
      ? (user.phone.countryCode.toString() ?? "")
      : "";
  })();

  const phoneNumberValue = (() => {
    if (isCompany) {
      return user?.company?.phone?.number
        ? Number(user.company.phone.number)
        : "";
    }
    return user?.phone?.number ? Number(user.phone.number) : "";
  })();

  const hasVerifiedPhone = isCompany
    ? !!user?.company?.phone?.verifiedAt
    : !!user?.phone?.verifiedAt;

  const initialValues = {
    [formNames.country]: listing?.location?.country ?? E_Country.POLAND,
    [formNames.flatNumber]: listing?.location?.flatNumber ?? "",
    [formNames.listingAvailableFrom]: listing.availableFrom
      ? new Date(listing.availableFrom)
      : "",
    [formNames.listingCategory]: listing.category,
    [formNames.listingCity]:
      listing?.location?.city?.nameSearch ??
      listing?.location?.cityCustom ??
      "",
    [formNames.listingDescription]: listing.description ?? "",
    [formNames.listingDistrict]: listing?.location?.district?.nameSearch ?? "",
    [formNames.listingHasAvailableDistricts]: false,
    [formNames.listingSalaryFrom]:
      typeof listing.salaryFrom === "number" ? listing.salaryFrom : "",
    [formNames.listingSalaryTo]:
      typeof listing.salaryTo === "number" ? listing.salaryTo : "",
    [formNames.listingShowEmail]: hasVerifiedPhone ? listing.showEmail : true,
    [formNames.listingShowPhone]: hasVerifiedPhone ? listing.showPhone : false,
    [formNames.listingTitle]: listing.title,
    [formNames.listingWorkMode]: listing.workMode,
    [formNames.phoneCountryCode]: phoneCountryCodeValue,
    [formNames.phoneNumber]: phoneNumberValue,
    [formNames.postalCode]: listing?.location?.postalCode ?? "",
    [formNames.streetName]: listing?.location?.streetName ?? "",
    [formNames.streetNumber]: listing?.location?.streetNumber ?? "",
  };

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues,
    mode: "uncontrolled",
    onValuesChange(values) {
      const isDataTheSame = compareObjects({
        ignoreCaseInsensitive: true,
        object1: values,
        object2: initialValues,
      });

      setHaveChanges(!isDataTheSame);
    },
    validate: {
      [formNames.listingAvailableFrom]: value =>
        checkFormValidator({
          formName: formNames.listingAvailableFrom,
          optional: true,
          value,
        }),
      [formNames.listingCategory]: value =>
        checkFormValidator({ formName: formNames.listingCategory, value }),
      [formNames.listingCity]: value =>
        checkFormValidator({ formName: formNames.listingCity, value }),
      [formNames.listingDescription]: value =>
        checkFormValidator({ formName: formNames.listingDescription, value }),
      [formNames.listingDistrict]: value =>
        checkFormValidator({
          formName: formNames.listingDistrict,
          optional: true,
          value,
        }),
      [formNames.listingSalaryFrom]: value =>
        checkFormValidator({ formName: formNames.listingSalaryFrom, value }),
      [formNames.listingSalaryTo]: value =>
        checkFormValidator({ formName: formNames.listingSalaryTo, value }),
      [formNames.listingTitle]: value =>
        checkFormValidator({ formName: formNames.listingTitle, value }),
      [formNames.listingWorkMode]: value =>
        checkFormValidator({ formName: formNames.listingWorkMode, value }),
    },
  });

  const validHaveChanges =
    haveChanges ||
    updatedImages.removed.length > 0 ||
    updatedImages.uploaded.length > 0;

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

  const linkCurrent = getLocalizedRoute({
    extraPath: `/${listing.slug ?? listing.id}`,
    route: isCompany
      ? E_Routes.companyListingsEdit
      : E_Routes.accountListingsEdit,
  });

  const paymentExtraPath = isCompany
    ? routesExtra[E_Routes.companyListings].payments
    : routesExtra[E_Routes.accountListings].payments;

  const linkPayment = getLocalizedRoute({
    extraPath: `/${listing.slug ?? listing.id}${paymentExtraPath}`,
    route: isCompany
      ? E_Routes.companyListingsEdit
      : E_Routes.accountListingsEdit,
  });

  const handleSubmit = (
    values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();

    if (
      !values[formNames.listingShowPhone] &&
      !values[formNames.listingShowEmail]
    ) {
      notifications.show({
        color: "red",
        message: tNotifications(`noListingContactMethod.message`),
        title: tNotifications(`noListingContactMethod.title`),
      });
      return;
    }

    if (!updatedImages.uploaded.every(item => item.uploaded)) {
      notifications.show({
        color: "red",
        message: tNotifications(`waitForImagesUpload.message`),
        title: tNotifications(`waitForImagesUpload.title`),
      });
      return;
    }

    setShowModalConfirm(true);
  };

  const handleSubmitErrors = (
    validationErrors: FormErrors,
    _values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();
    showAllErrorsForm({ tNotifications, validationErrors });
  };

  // TODO: image upload temporarily disabled
  // const handleUpdateImages = useCallback(
  //   ({ removed, uploaded }: T_SelectImagesOnChange) => {
  //     setUpdatedImages({
  //       removed,
  //       uploaded,
  //     });
  //   },
  //   [],
  // );

  const handleCloseModalConfirm = useCallback(() => {
    setShowModalConfirm(false);
  }, []);

  const handleOnConfirm = () => {
    const values = form.getValues();

    submit(
      convertToFormData({
        ...values,
        [formNames.listingImagesNew]: updatedImages.uploaded.map(
          item => item.path,
        ),
        [formNames.listingImagesToRemove]: updatedImages.removed,
        [formNames.uploadImagesGroupId]: uploadImagesGroupId,
      }),
      {
        action: linkCurrent,
        method: "post",
      },
    );

    setShowModalConfirm(false);
  };

  const handleDeleteListing = useCallback(() => {
    setDeleteReasonModalOpen(true);
  }, []);

  const handleCloseDeleteReasonModal = useCallback(() => {
    setDeleteReasonModalOpen(false);
  }, []);

  const handleDeleteReasonOnSuccess = useCallback(
    (reason: T_ListingDeleteReason) => {
      setPendingDeleteReason(reason);
      setDeleteReasonModalOpen(false);
      setAuthenticatorDeleteOpen(true);
    },
    [],
  );

  const handleCloseAuthenticatorDelete = useCallback(() => {
    setAuthenticatorDeleteOpen(false);
  }, []);

  const handleAuthenticatorDeleteOnSuccess = useCallback(
    async (authenticator: number | string) => {
      setAuthenticatorDeleteOpen(false);

      submit(
        convertToFormData({
          [formNames.authenticator]: authenticator,
          [formNames.listingDeleteReason]: pendingDeleteReason,
          [formNames.listingId]: listing.id,
        }),
        {
          action: linkCurrent,
          method: "delete",
        },
      );
    },
    [linkCurrent, pendingDeleteReason, listing.id],
  );

  const sectionAlert = isActive ? undefined : t("alert", { link: linkPayment });

  const sectionInformation = (() => {
    if (
      isActive &&
      !isActiveAndExpiresInThreeDays &&
      !isActiveAndExpiresInOneMonth
    ) {
      return t("informationFreeListing", {
        contactInteractions: listing?._count?.contacts ?? 0,
        date: listing?.expiresAt
          ? replaceDateToYearMonthHoursMinutesInWordsDay({
              date: listing?.expiresAt?.toString(),
            })
          : "-",
        viewsInteractions: listing?._count?.views ?? 0,
      });
    }
    return t("contactInteractions", {
      contactInteractions: listing?._count?.contacts ?? 0,
      viewsInteractions: listing?._count?.views ?? 0,
    });
  })();

  const sectionWarning = (() => {
    if (isActiveAndExpiresInThreeDays) {
      return t("warningSoon", {
        link: linkPayment,
      });
    }
    if (isActiveAndExpiresInOneMonth) {
      return t("warning", {
        date: listing?.expiresAt
          ? replaceDateToYearMonthHoursMinutesInWordsDay({
              date: listing?.expiresAt?.toString(),
            })
          : "-",
        link: linkPayment,
      });
    }
  })();

  return (
    <>
      <ModalDeleteListingReason
        onClose={handleCloseDeleteReasonModal}
        onSuccess={handleDeleteReasonOnSuccess}
        opened={deleteReasonModalOpen}
      />
      <ModalCondition
        onClose={handleCloseModalConfirm}
        onSuccess={handleOnConfirm}
        opened={showModalConfirm}
      />
      <ModalAuthenticator
        onClose={handleCloseAuthenticatorDelete}
        onSuccess={handleAuthenticatorDeleteOnSuccess}
        opened={authenticatorDeleteOpen}
      />
      <Form onSubmit={form.onSubmit(handleSubmit, handleSubmitErrors)}>
        <Section
          alert={sectionAlert}
          breadcrumbs={
            isCompany
              ? [
                  E_Routes.home,
                  E_Routes.company,
                  E_Routes.companyListings,
                  E_Routes.companyListingsEdit,
                ]
              : [
                  E_Routes.home,
                  E_Routes.account,
                  E_Routes.accountListings,
                  E_Routes.accountListingsEdit,
                ]
          }
          buttons={
            <>
              <ButtonArrowLeft
                routeTo={
                  isCompany
                    ? E_Routes.companyListings
                    : E_Routes.accountListings
                }
              />
              <Button color="red" onClick={handleDeleteListing} variant="light">
                {t("buttonDelete")}
              </Button>
              {(listing.status === E_ListingStatus.ACTIVE ||
                listing.status === E_ListingStatus.EXPIRED ||
                listing.status === E_ListingStatus.INACTIVE ||
                listing.status === E_ListingStatus.UNPAID) && (
                <Link fullWidthOnMobile to={linkPayment}>
                  <Button color="dark" variant="filled">
                    {t("buttonPayment")}
                  </Button>
                </Link>
              )}
              <Button
                disabled={!validHaveChanges}
                tooltip={{
                  label: tCommon("buttonSaveTooltip"),
                }}
                type="submit"
              >
                {t("buttonAdd")}
              </Button>
            </>
          }
          information={sectionInformation}
          pageMeta={{
            route: isCompany
              ? E_Routes.companyListingsEdit
              : E_Routes.accountListingsEdit,
          }}
          size="md"
          title={t("title")}
          warning={sectionWarning}
          withHTML={false}
          withTextsToUi
        >
          <InputWrapper>
            {/* TODO: image upload temporarily disabled
            <Fieldset legend={t("fieldsetImages")}>
              <SelectImages
                defaultImages={listing.images ?? []}
                limit={3}
                maxSizeMB={5}
                maxWidthOrHeight={1920}
                name={formNames.fileImages5MB}
                onChange={handleUpdateImages}
                uploadImagesGroupId={uploadImagesGroupId}
              />
            </Fieldset>
            */}
            <AutocompleteAddress
              defaultValue={
                listing?.location
                  ? generateLocationAddressLastCity({
                      location: {
                        city: listing.location.city ?? null,
                        cityCustom: listing.location.cityCustom ?? null,
                        district: listing.location.district ?? null,
                        flatNumber: listing.location.flatNumber ?? null,
                        streetName: listing.location.streetName,
                        streetNumber: listing.location.streetNumber,
                      },
                    })
                  : ""
              }
              form={form}
              label={t("fieldsetLocation")}
            />
            <Fieldset legend={t("fieldsetInformation")}>
              <Input
                key={form.key(formNames.listingTitle)}
                name={formNames.listingTitle}
                required
                {...form.getInputProps(formNames.listingTitle)}
                clearable
                maxLength={100}
              />
              <TextEditor
                defaultValue={listing.description ?? ""}
                error={form.getInputProps(formNames.listingDescription).error}
                name={formNames.listingDescription}
                onChange={htmlValue =>
                  form.setFieldValue(formNames.listingDescription, htmlValue)
                }
                required
              />
              <Box w="100%">
                <Flex align="flex-start" gap={24} w="100%" wrap="wrap">
                  <Box w={{ base: "100%", xs: "calc(50% - 14px)" }}>
                    <SelectListingCategory form={form} required />
                  </Box>
                  <Box w={{ base: "100%", xs: "calc(50% - 14px)" }}>
                    <SelectWorkMode form={form} required />
                  </Box>
                </Flex>
              </Box>
              <Box w="100%">
                <Flex align="flex-start" gap={24} w="100%" wrap="wrap">
                  <Box w={{ base: "100%", xs: "calc(50% - 14px)" }}>
                    <Input
                      key={form.key(formNames.listingSalaryFrom)}
                      name={formNames.listingSalaryFrom}
                      required
                      type="number"
                      {...form.getInputProps(formNames.listingSalaryFrom)}
                      max={inputMaxLength.listingSalary}
                    />
                  </Box>
                  <Box w={{ base: "100%", xs: "calc(50% - 14px)" }}>
                    <Input
                      key={form.key(formNames.listingSalaryTo)}
                      name={formNames.listingSalaryTo}
                      required
                      type="number"
                      {...form.getInputProps(formNames.listingSalaryTo)}
                      max={inputMaxLength.listingSalary}
                    />
                  </Box>
                </Flex>
              </Box>
              <InputCalendar
                key={form.key(formNames.listingAvailableFrom)}
                {...form.getInputProps(formNames.listingAvailableFrom)}
                clearable
                disabledWithOpacity={false}
                minDate={new Date()}
                name={formNames.listingAvailableFrom}
                required={false}
                withoutDescription
              />
            </Fieldset>
            <Fieldset
              description={t("fieldsetPhoneDescription")}
              legend={t("fieldsetPhone")}
            >
              <InputPhone
                disabled
                form={form}
                isCompanyPhone={isCompany}
                required={false}
              />
            </Fieldset>
            <Fieldset
              description={t("fieldsetContactDescription")}
              legend={t("fieldsetContact")}
            >
              <Flex
                align="flex-start"
                direction="column"
                gap={8}
                justify="flex-start"
                w="100%"
              >
                {hasVerifiedPhone && (
                  <Checkbox
                    key={form.key(formNames.listingShowPhone)}
                    label={tCommon("inputs.listingShowPhone")}
                    name={formNames.listingShowPhone}
                    required={false}
                    {...form.getInputProps(formNames.listingShowPhone, {
                      type: "checkbox",
                    })}
                  />
                )}
                <Checkbox
                  key={form.key(formNames.listingShowEmail)}
                  label={tCommon("inputs.listingShowEmail")}
                  name={formNames.listingShowEmail}
                  required={false}
                  {...form.getInputProps(formNames.listingShowEmail, {
                    type: "checkbox",
                  })}
                />
              </Flex>
            </Fieldset>
          </InputWrapper>
        </Section>
      </Form>
    </>
  );
};
