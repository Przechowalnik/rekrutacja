import { Box, Flex } from "@mantine/core";
import { FormErrors, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import {
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import { inputMaxLength } from "~/constants/input";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { globalClasses } from "~/constants/styles";
import { useLayout } from "~/hooks/useLayout";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSubmitWithActions } from "~/hooks/useSubmitWithActions";
import { useUser } from "~/hooks/useUser";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import {
  allListingCategoryRent,
  allListingCategorySale,
  E_Country,
  E_ListingCategory,
  E_ListingContractType,
  E_ListingType,
  T_ListingCategory,
  T_ListingContractType,
  T_ListingType,
} from "~/models/enums";
import { AutocompleteAddress } from "~/ui/AutocompleteAddress";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { Checkbox } from "~/ui/Checkbox";
import { Collapse } from "~/ui/Collapse";
import { Fieldset } from "~/ui/Fieldset";
import { Form } from "~/ui/Form";
import { Input } from "~/ui/Input";
import { InputCalendar } from "~/ui/InputCalendar";
import { InputPhone } from "~/ui/InputPhone";
import { InputWrapper } from "~/ui/InputWrapper";
import { Link } from "~/ui/Link";
import { Section } from "~/ui/Section";
import {
  SelectImages,
  T_SelectImagesOnChange,
  T_SelectImagesUploaded,
} from "~/ui/SelectImages";
import { SelectListingAccess } from "~/ui/SelectListingAccess";
import { SelectListingCategory } from "~/ui/SelectListingCategory";
import { SelectListingComfortOption } from "~/ui/SelectListingComfortOption";
import { SelectListingCondition } from "~/ui/SelectListingCondition";
import { SelectListingContainerType } from "~/ui/SelectListingContainerType";
import { SelectListingContractType } from "~/ui/SelectListingContractType";
import { SelectListingEntryOption } from "~/ui/SelectListingEntryOption";
import { SelectListingFloorLevel } from "~/ui/SelectListingFloorLevel";
import { SelectListingParkingType } from "~/ui/SelectListingParkingType";
import { SelectListingPlotType } from "~/ui/SelectListingPlotType";
import { SelectListingSecurityOption } from "~/ui/SelectListingSecurityOption";
import { SelectListingType } from "~/ui/SelectListingType";
import { SelectListingUnitType } from "~/ui/SelectListingUnitType";
import { SelectListingUsageOption } from "~/ui/SelectListingUsageOption";
import { SelectListingUtilityOption } from "~/ui/SelectListingUtilityOption";
import { Textarea } from "~/ui/Textarea";
import { isFreeListings } from "~/utilities/flags";
import {
  convertToFormData,
  resetFormFieldsAndShowNotification,
  showAllErrorsForm,
} from "~/utilities/form";
import { checkCompanySubscriptionIsActive } from "~/utilities/functions";
import { generateOptionsForListingCategory } from "~/utilities/listing";
import { generateListingPriceFromTypeAndContractType } from "~/utilities/price";

type T_ReusableListingsNewPage = {
  isCompany: boolean;
};

export const ReusableListingsNewPage = ({
  isCompany,
}: T_ReusableListingsNewPage) => {
  const [uploadImagesGroupId] = useState<string>(() => crypto.randomUUID());
  const [updatedImages, setUpdatedImages] = useState<{
    removed: string[];
    uploaded: T_SelectImagesUploaded[];
  }>({
    removed: [],
    uploaded: [],
  });
  const [selectedListingAvailableFrom, setSelectedListingAvailableFrom] =
    useState<null | string>(null);
  const [selectedListingAvailableTo, setSelectedListingAvailableTo] = useState<
    null | string
  >(null);
  const [selectedListingType, setSelectedListingType] =
    useState<null | T_ListingType>(null);
  const [selectedListingContractType, setSelectedListingContractType] =
    useState<null | T_ListingContractType>(E_ListingContractType.LONG_TERM);
  const [selectedListingCategory, setSelectedListingCategory] =
    useState<null | T_ListingCategory>(null);

  const { t } = useTranslation(
    isCompany ? namespaces.companyListingsNew : namespaces.accountListingsNew,
  );
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { user } = useUser();
  const { platformColor } = useLayout();
  const submit = useSubmitWithActions();
  const { getLocalizedRoute } = useLocalizedRoute();

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

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {
      [formNames.checkboxAcceptRegulations]: false,
      [formNames.checkboxCreateListing]: false,
      [formNames.checkboxListingNegotiable]: false,
      [formNames.country]: E_Country.POLAND,
      [formNames.flatNumber]: "",
      [formNames.listingAccess]: "",
      [formNames.listingArea]: "",
      [formNames.listingAvailableFrom]: dayjs().startOf("day").toDate(),
      [formNames.listingAvailableTo]: "",
      [formNames.listingCategory]: "",
      [formNames.listingCity]: "",
      [formNames.listingComfortOption]: [],
      [formNames.listingCondition]: "",
      [formNames.listingContainerType]: "",
      [formNames.listingContractType]: "",
      [formNames.listingDescription]: "",
      [formNames.listingDistrict]: "",
      [formNames.listingEntryOption]: [],
      [formNames.listingFloorLevel]: "",
      [formNames.listingHasAvailableDistricts]: false,
      [formNames.listingMinimumRentalDays]: "",
      [formNames.listingParkingType]: "",
      [formNames.listingPlotType]: "",
      [formNames.listingPrice]: "",
      [formNames.listingSecurityOption]: [],
      [formNames.listingTitle]: "",
      [formNames.listingType]: "",
      [formNames.listingUnitType]: "",
      [formNames.listingUsageOption]: [],
      [formNames.listingUtilityOption]: [],
      [formNames.phoneCountryCode]: phoneCountryCodeValue,
      [formNames.phoneNumber]: phoneNumberValue,
      [formNames.postalCode]: "",
      [formNames.streetName]: "",
      [formNames.streetNumber]: "",
    },
    mode: "uncontrolled",
    onValuesChange(values) {
      const {
        listingAvailableFrom,
        listingAvailableTo,
        listingCategory,
        listingContractType,
        listingType,
      } = values;

      setSelectedListingAvailableTo(
        listingAvailableTo
          ? dayjs(listingAvailableTo).format("YYYY-MM-DD")
          : null,
      );

      setSelectedListingAvailableFrom(
        dayjs(listingAvailableFrom).format("YYYY-MM-DD"),
      );

      setSelectedListingType((listingType as T_ListingType) || null);
      setSelectedListingContractType(
        (listingContractType as T_ListingContractType) || null,
      );
      setSelectedListingCategory(
        (listingCategory as T_ListingCategory) || null,
      );
    },
    validate: {
      [formNames.checkboxAcceptRegulations]: value =>
        checkFormValidator({
          formName: formNames.checkboxAcceptRegulations,
          value,
        }),
      [formNames.checkboxCreateListing]: value =>
        checkFormValidator({
          formName: formNames.checkboxCreateListing,
          value,
        }),
      [formNames.checkboxListingNegotiable]: value =>
        checkFormValidator({
          formName: formNames.checkboxListingNegotiable,
          optional: true,
          value,
        }),
      [formNames.country]: value =>
        checkFormValidator({
          formName: formNames.country,
          value,
        }),
      [formNames.flatNumber]: value =>
        checkFormValidator({
          formName: formNames.flatNumber,
          optional: true,
          value,
        }),
      [formNames.listingAccess]: value =>
        checkFormValidator({
          formName: formNames.listingAccess,
          optional: true,
          value,
        }),
      [formNames.listingArea]: value =>
        checkFormValidator({
          formName: formNames.listingArea,
          optional: true,
          value,
        }),
      [formNames.listingAvailableFrom]: value =>
        checkFormValidator({
          formName: formNames.listingAvailableFrom,
          value,
        }),
      [formNames.listingAvailableTo]: value =>
        checkFormValidator({
          formName: formNames.listingAvailableTo,
          optional: true,
          value,
        }),
      [formNames.listingCategory]: value =>
        checkFormValidator({
          formName: formNames.listingCategory,
          value,
        }),
      [formNames.listingCity]: value =>
        checkFormValidator({
          formName: formNames.listingCity,
          value,
        }),
      [formNames.listingComfortOption]: value =>
        checkFormValidator({
          formName: formNames.listingComfortOption,
          optional: true,
          value,
        }),
      [formNames.listingCondition]: value =>
        checkFormValidator({
          formName: formNames.listingCondition,
          optional: true,
          value,
        }),
      [formNames.listingContainerType]: value =>
        checkFormValidator({
          formName: formNames.listingContainerType,
          optional: true,
          value,
        }),
      [formNames.listingContractType]: value =>
        checkFormValidator({
          formName: formNames.listingContractType,
          optional: true,
          value,
        }),
      [formNames.listingDescription]: value =>
        checkFormValidator({
          formName: formNames.listingDescription,
          optional: true,
          value,
        }),
      [formNames.listingDistrict]: value =>
        checkFormValidator({
          formName: formNames.listingDistrict,
          optional: true,
          value,
        }),
      [formNames.listingEntryOption]: value =>
        checkFormValidator({
          formName: formNames.listingEntryOption,
          optional: true,
          value,
        }),
      [formNames.listingFloorLevel]: value =>
        checkFormValidator({
          formName: formNames.listingFloorLevel,
          optional: true,
          value,
        }),
      [formNames.listingHasAvailableDistricts]: value =>
        checkFormValidator({
          formName: formNames.listingHasAvailableDistricts,
          optional: true,
          value,
        }),
      [formNames.listingMinimumRentalDays]: value =>
        checkFormValidator({
          formName: formNames.listingMinimumRentalDays,
          optional: true,
          value,
        }),
      [formNames.listingParkingType]: value =>
        checkFormValidator({
          formName: formNames.listingParkingType,
          optional: true,
          value,
        }),
      [formNames.listingPlotType]: value =>
        checkFormValidator({
          formName: formNames.listingPlotType,
          optional: true,
          value,
        }),
      [formNames.listingPrice]: value =>
        checkFormValidator({
          formName: formNames.listingPrice,
          value,
        }),
      [formNames.listingSecurityOption]: value =>
        checkFormValidator({
          formName: formNames.listingSecurityOption,
          optional: true,
          value,
        }),
      [formNames.listingTitle]: value =>
        checkFormValidator({
          formName: formNames.listingTitle,
          value,
        }),
      [formNames.listingType]: value =>
        checkFormValidator({
          formName: formNames.listingType,
          value,
        }),
      [formNames.listingUnitType]: value =>
        checkFormValidator({
          formName: formNames.listingUnitType,
          optional: true,
          value,
        }),
      [formNames.listingUsageOption]: value =>
        checkFormValidator({
          formName: formNames.listingUsageOption,
          optional: true,
          value,
        }),
      [formNames.listingUtilityOption]: value =>
        checkFormValidator({
          formName: formNames.listingUtilityOption,
          optional: true,
          value,
        }),
      [formNames.postalCode]: value =>
        checkFormValidator({
          formName: formNames.postalCode,
          value,
        }),
      [formNames.streetName]: value =>
        checkFormValidator({
          formName: formNames.streetName,
          value,
        }),
      [formNames.streetNumber]: value =>
        checkFormValidator({
          formName: formNames.streetNumber,
          value,
        }),
    },
  });

  const isFreeListingConfiguration = isFreeListings();

  const availableToCreateFreeListing =
    user?.company?.isAvailableSlotsToCreateNewListing &&
    checkCompanySubscriptionIsActive({ company: user?.company });

  const validContractTypeRent = selectedListingType === E_ListingType.RENT;

  const validShortTermsRent =
    validContractTypeRent &&
    selectedListingContractType === E_ListingContractType.SHORT_TERM;

  const validCategoryGarage =
    selectedListingCategory === E_ListingCategory.PARKING;

  const validCategoryContainer =
    selectedListingCategory === E_ListingCategory.CONTAINER;

  const validCategoryUnit = selectedListingCategory === E_ListingCategory.UNIT;

  const validCategoryPlot = selectedListingCategory === E_ListingCategory.PLOT;

  const validArea =
    selectedListingCategory === E_ListingCategory.ATTIC ||
    selectedListingCategory === E_ListingCategory.BASEMENT ||
    selectedListingCategory === E_ListingCategory.ROOM ||
    selectedListingCategory === E_ListingCategory.STORAGE_UNIT ||
    selectedListingCategory === E_ListingCategory.BANQUET_HALL ||
    selectedListingCategory === E_ListingCategory.CONTAINER ||
    selectedListingCategory === E_ListingCategory.PLOT ||
    selectedListingCategory === E_ListingCategory.UNIT ||
    selectedListingCategory === E_ListingCategory.WAREHOUSE;

  const validCondition =
    selectedListingCategory === E_ListingCategory.ROOM ||
    selectedListingCategory === E_ListingCategory.ATTIC ||
    selectedListingCategory === E_ListingCategory.BASEMENT ||
    selectedListingCategory === E_ListingCategory.WAREHOUSE ||
    selectedListingCategory === E_ListingCategory.UNIT;

  const {
    accessOptions,
    comfortOptions,
    conditions,
    entryOptions,
    levels,
    securityOptions,
    usageOptions,
    utilityOptions,
  } = useMemo(
    () =>
      generateOptionsForListingCategory({
        listingCategory: selectedListingCategory,
      }),
    [selectedListingCategory],
  );

  const validAccess = !!selectedListingCategory && accessOptions.length > 0;

  useEffect(() => {
    resetFormFieldsAndShowNotification({
      fieldsToReset: [
        formNames.listingParkingType,
        formNames.listingContainerType,
        formNames.listingFloorLevel,
        formNames.listingAccess,
        formNames.listingSecurityOption,
        formNames.listingComfortOption,
        formNames.listingUtilityOption,
        formNames.listingEntryOption,
        formNames.listingUsageOption,
        formNames.listingMinimumRentalDays,
        formNames.listingCondition,
        formNames.listingPlotType,
        formNames.listingUnitType,
        formNames.listingCondition,
      ],
      form,
      notification: () => {
        notifications.show({
          color: platformColor,
          message: tNotifications("categoryChangeAlert.message"),
          title: tNotifications("categoryChangeAlert.title"),
        });
      },
    });
  }, [selectedListingCategory]);

  useEffect(() => {
    resetFormFieldsAndShowNotification({
      fieldsToReset: [
        formNames.listingContractType,
        formNames.listingPrice,
        formNames.checkboxListingNegotiable,
        formNames.listingMinimumRentalDays,
      ],
      form,
      notification: () => {
        notifications.show({
          color: platformColor,
          message: tNotifications("contractTypeChangeAlert.message"),
          title: tNotifications("contractTypeChangeAlert.title"),
        });
      },
    });
  }, [selectedListingType]);

  useEffect(() => {
    resetFormFieldsAndShowNotification({
      fieldsToReset: [
        formNames.listingPrice,
        formNames.checkboxListingNegotiable,
        formNames.listingMinimumRentalDays,
      ],
      form,
      notification: () => {
        notifications.show({
          color: platformColor,
          message: tNotifications("listingTypeChangeAlert.message"),
          title: tNotifications("listingTypeChangeAlert.title"),
        });
      },
    });
  }, [selectedListingContractType]);

  useEffect(() => {
    if (!selectedListingAvailableTo) {
      return;
    }

    notifications.show({
      color: platformColor,
      message: tNotifications("listingChangeAvailableTo.message"),
      title: tNotifications("listingChangeAvailableTo.title"),
    });
    form.setFieldValue(formNames.listingAvailableTo, "");
  }, [selectedListingAvailableFrom]);

  useEffect(() => {
    if (!selectedListingCategory) {
      return;
    }

    notifications.show({
      color: platformColor,
      message: tNotifications("listingTypeChangeAlert.message"),
      title: tNotifications("listingTypeChangeAlert.title"),
    });
    form.setFieldValue(formNames.listingCategory, "");
  }, [selectedListingType]);

  const handleSubmit = (
    values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();
    const {
      checkboxAcceptRegulations,
      checkboxCreateListing,
      listingCategory,
      listingCondition,
      listingContractType,
      listingDistrict,
      listingHasAvailableDistricts,
      listingMinimumRentalDays,
      listingPlotType,
      listingType,
      listingUnitType,
    } = values;

    if (listingHasAvailableDistricts && !listingDistrict) {
      notifications.show({
        color: "red",
        message: tNotifications(`districtMissing.message`),
        title: tNotifications(`districtMissing.title`),
      });
      return;
    }

    const isListingCategoryInSelectedType = (() => {
      if (!listingCategory) {
        return false;
      }
      if (listingType === E_ListingType.RENT) {
        return allListingCategoryRent.includes(
          listingCategory as T_ListingCategory,
        );
      }
      if (listingType === E_ListingType.SALE) {
        return allListingCategorySale.includes(
          listingCategory as T_ListingCategory,
        );
      }
      return false;
    })();

    if (!isListingCategoryInSelectedType) {
      notifications.show({
        color: "red",
        message: tNotifications(`noListingCategoryInListingType.message`),
        title: tNotifications(`noListingCategoryInListingType.title`),
      });
      return;
    }

    if (
      listingContractType === E_ListingContractType.SHORT_TERM &&
      !listingMinimumRentalDays
    ) {
      notifications.show({
        color: "red",
        message: tNotifications(`noListingMinimumRentalDays.message`),
        title: tNotifications(`noListingMinimumRentalDays.title`),
      });
      return;
    }

    if (listingCategory === E_ListingCategory.UNIT && !listingUnitType) {
      notifications.show({
        color: "red",
        message: tNotifications(`noListingUnitType.message`),
        title: tNotifications(`noListingUnitType.title`),
      });
      return;
    }

    if (listingCategory === E_ListingCategory.PLOT && !listingPlotType) {
      notifications.show({
        color: "red",
        message: tNotifications(`noListingPlotType.message`),
        title: tNotifications(`noListingPlotType.title`),
      });
      return;
    }

    if (!checkboxAcceptRegulations) {
      notifications.show({
        color: "red",
        message: "",
        title: tNotifications(`noCheckedCheckboxRegulations.title`),
      });
      return;
    }

    if (!checkboxCreateListing) {
      notifications.show({
        color: "red",
        message: "",
        title: tNotifications(`noCheckedCheckboxCreateListing.title`),
      });
      return;
    }

    if (validCondition && !listingCondition) {
      notifications.show({
        color: "red",
        message: tNotifications(`noSelectedListingCondition.message`),
        title: tNotifications(`noSelectedListingCondition.title`),
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
        action: getLocalizedRoute({
          route: isCompany
            ? E_Routes.companyListingsNew
            : E_Routes.accountListingsNew,
        }),
        encType: "multipart/form-data",
        method: "post",
      },
    );
  };

  const handleSubmitErrors = (
    validationErrors: FormErrors,
    _values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();
    showAllErrorsForm({ tNotifications, validationErrors });
  };

  const handleUpdateImages = useCallback(
    (dataImages: T_SelectImagesOnChange) => {
      setUpdatedImages({
        removed: dataImages.removed,
        uploaded: dataImages.uploaded,
      });
    },
    [],
  );

  const sectionInformation = (() => {
    if (isFreeListingConfiguration) {
      return t("information");
    }
    if (user?.company && isCompany) {
      return t("informationCompany", {
        countMonths:
          user?.company?.activePlanInSubscriptionOrFreeTrial
            ?.listingDurationMonths ?? 0,
      });
    }
  })();

  const sectionWarning = (() => {
    if (isFreeListingConfiguration) {
      return;
    }
    if (isCompany && user?.company?.isAvailableSlotsToCreateNewListing) {
      return t("warning", {
        countPlanLimit:
          user?.company?.activePlanInSubscriptionOrFreeTrial
            ?.maximumListingsInMonth || "",
        countUsed:
          typeof user?.company?.createdListingsInCurrentMonth === "number"
            ? user?.company?.createdListingsInCurrentMonth
            : "",
      });
    }
  })();

  return (
    <Form onSubmit={form.onSubmit(handleSubmit, handleSubmitErrors)}>
      <Section
        breadcrumbs={
          isCompany
            ? [
                E_Routes.home,
                E_Routes.company,
                E_Routes.companyListings,
                E_Routes.companyListingsNew,
              ]
            : [
                E_Routes.home,
                E_Routes.account,
                E_Routes.accountListings,
                E_Routes.accountListingsNew,
              ]
        }
        buttons={
          <>
            <ButtonArrowLeft
              routeTo={
                isCompany ? E_Routes.companyListings : E_Routes.accountListings
              }
            />
            <Button type="submit">
              {availableToCreateFreeListing || isFreeListingConfiguration
                ? t("buttonAdd")
                : t("buttonPay")}
            </Button>
          </>
        }
        information={sectionInformation}
        pageMeta={{
          route: isCompany
            ? E_Routes.companyListingsNew
            : E_Routes.accountListingsNew,
        }}
        size="md"
        title={t("title")}
        warning={sectionWarning}
        withHTML={false}
        withTextsToUi
      >
        <InputWrapper>
          <AutocompleteAddress
            form={form}
            label={t("fieldsetLocation")}
            required
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
            <Textarea
              key={form.key(formNames.listingDescription)}
              {...form.getInputProps(formNames.listingDescription)}
              maxLength={5000}
              name={formNames.listingDescription}
              required={false}
            />
            <InputCalendar
              key={form.key(formNames.listingAvailableFrom)}
              {...form.getInputProps(formNames.listingAvailableFrom)}
              disabledWithOpacity={false}
              minDate={new Date()}
              name={formNames.listingAvailableFrom}
              required
            />
            <InputCalendar
              key={form.key(formNames.listingAvailableTo)}
              {...form.getInputProps(formNames.listingAvailableTo)}
              clearable
              disabledWithOpacity={false}
              minDate={
                selectedListingAvailableFrom
                  ? new Date(selectedListingAvailableFrom)
                  : new Date()
              }
              name={formNames.listingAvailableTo}
              required={false}
              withoutDescription
            />
            <SelectImages
              limit={6}
              maxSizeMB={5}
              maxWidthOrHeight={1920}
              name={formNames.fileImages5MB}
              onChange={handleUpdateImages}
              uploadImagesGroupId={uploadImagesGroupId}
            />
          </Fieldset>
          <Fieldset
            className={globalClasses.fadePage}
            legend={t("fieldsetInformationFilters")}
          >
            <Box w="100%">
              <Flex align="center" gap={24} w="100%" wrap="wrap">
                <Box
                  w={{
                    base: "100%",
                    xs: "calc(50% - 14px)",
                  }}
                >
                  <SelectListingType form={form} required />
                </Box>
                <Box
                  w={{
                    base: "100%",
                    xs: "calc(50% - 14px)",
                  }}
                >
                  <SelectListingCategory
                    form={form}
                    listingType={selectedListingType}
                    required
                  />
                </Box>
              </Flex>
              <Collapse fullWith opened={validContractTypeRent}>
                {validContractTypeRent && (
                  <Box className={globalClasses.fadePage} pt={16} w="100%">
                    <SelectListingContractType
                      disabledWithOpacity={false}
                      form={form}
                      required
                    />
                  </Box>
                )}
              </Collapse>
              <Collapse fullWith opened={validShortTermsRent}>
                {validShortTermsRent && (
                  <Box className={globalClasses.fadePage} pt={16} w="100%">
                    <Input
                      key={form.key(formNames.listingMinimumRentalDays)}
                      name={formNames.listingMinimumRentalDays}
                      required
                      {...form.getInputProps(
                        formNames.listingMinimumRentalDays,
                      )}
                      clearable
                      max={1000}
                      min={1}
                      type="number"
                    />
                  </Box>
                )}
              </Collapse>
              <Collapse fullWith opened={validCategoryGarage}>
                {validCategoryGarage && (
                  <Box className={globalClasses.fadePage} pt={16} w="100%">
                    <SelectListingParkingType
                      form={form}
                      required={
                        selectedListingCategory === E_ListingCategory.PARKING
                      }
                    />
                  </Box>
                )}
              </Collapse>
              <Collapse fullWith opened={validCategoryContainer}>
                {validCategoryContainer && (
                  <Box className={globalClasses.fadePage} pt={16} w="100%">
                    <SelectListingContainerType
                      form={form}
                      required={
                        selectedListingCategory === E_ListingCategory.CONTAINER
                      }
                    />
                  </Box>
                )}
              </Collapse>
              <Collapse fullWith opened={validCategoryPlot}>
                {validCategoryPlot && (
                  <Box className={globalClasses.fadePage} pt={16} w="100%">
                    <SelectListingPlotType
                      form={form}
                      listingType={selectedListingType ?? undefined}
                      required={
                        selectedListingCategory === E_ListingCategory.PLOT
                      }
                    />
                  </Box>
                )}
              </Collapse>
              <Collapse fullWith opened={validCategoryUnit}>
                {validCategoryUnit && (
                  <Box className={globalClasses.fadePage} pt={16} w="100%">
                    <SelectListingUnitType
                      form={form}
                      required={
                        selectedListingCategory === E_ListingCategory.UNIT
                      }
                    />
                  </Box>
                )}
              </Collapse>
              <Collapse
                fullWith
                opened={conditions.length > 0 && validCondition}
              >
                {conditions.length > 0 && (
                  <Box className={globalClasses.fadePage} pt={16} w="100%">
                    <SelectListingCondition
                      form={form}
                      options={conditions}
                      required={validCondition}
                    />
                  </Box>
                )}
              </Collapse>
              <Collapse fullWith opened={validArea}>
                {validArea && (
                  <Box className={globalClasses.fadePage} pt={16} w="100%">
                    <Input
                      key={form.key(formNames.listingArea)}
                      max={inputMaxLength.listingArea}
                      name={formNames.listingArea}
                      required={false}
                      type="number"
                      {...form.getInputProps(formNames.listingArea)}
                    />
                  </Box>
                )}
              </Collapse>
              <Collapse fullWith opened={!!levels}>
                {levels && (
                  <Box className={globalClasses.fadePage} pt={16} w="100%">
                    <SelectListingFloorLevel
                      form={form}
                      levels={levels}
                      required
                    />
                  </Box>
                )}
              </Collapse>
              <Collapse fullWith opened={validAccess}>
                {validAccess && (
                  <Box className={globalClasses.fadePage} pt={16} w="100%">
                    <SelectListingAccess
                      form={form}
                      options={accessOptions}
                      required
                    />
                  </Box>
                )}
              </Collapse>
              <Collapse fullWith opened={securityOptions.length > 0}>
                {securityOptions.length > 0 && (
                  <Box className={globalClasses.fadePage} pt={16} w="100%">
                    <SelectListingSecurityOption
                      form={form}
                      options={securityOptions}
                      required={false}
                    />
                  </Box>
                )}
              </Collapse>
              <Collapse fullWith opened={utilityOptions.length > 0}>
                {utilityOptions.length > 0 && (
                  <Box className={globalClasses.fadePage} pt={16} w="100%">
                    <SelectListingUtilityOption
                      form={form}
                      options={utilityOptions}
                      required={false}
                    />
                  </Box>
                )}
              </Collapse>
              <Collapse fullWith opened={comfortOptions.length > 0}>
                {comfortOptions.length > 0 && (
                  <Box className={globalClasses.fadePage} pt={16} w="100%">
                    <SelectListingComfortOption
                      form={form}
                      options={comfortOptions}
                      required={false}
                    />
                  </Box>
                )}
              </Collapse>
              <Collapse fullWith opened={entryOptions.length > 0}>
                {entryOptions.length > 0 && (
                  <Box className={globalClasses.fadePage} pt={16} w="100%">
                    <SelectListingEntryOption
                      form={form}
                      options={entryOptions}
                      required={false}
                    />
                  </Box>
                )}
              </Collapse>
              <Collapse fullWith opened={usageOptions.length > 0}>
                {usageOptions.length > 0 && (
                  <Box className={globalClasses.fadePage} pt={16} w="100%">
                    <SelectListingUsageOption
                      form={form}
                      options={usageOptions}
                      required={false}
                    />
                  </Box>
                )}
              </Collapse>
            </Box>
          </Fieldset>
          <Fieldset legend={t("fieldsetPrice")}>
            <Input
              key={form.key(formNames.listingPrice)}
              label={generateListingPriceFromTypeAndContractType({
                contractType: selectedListingContractType,
                tCommon,
                type: selectedListingType,
              })}
              name={formNames.listingPrice}
              required
              type="number"
              {...form.getInputProps(formNames.listingPrice)}
              max={inputMaxLength.listingPrice}
            />
            <Box className={globalClasses.fadePage} w="100%">
              <Checkbox
                key={form.key(formNames.checkboxListingNegotiable)}
                name={formNames.checkboxListingNegotiable}
                required={false}
                {...form.getInputProps(formNames.checkboxListingNegotiable, {
                  type: "checkbox",
                })}
              />
            </Box>
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
          <div>
            <Checkbox
              key={form.key(formNames.checkboxAcceptRegulations)}
              label={
                <>
                  {tCommon("inputs.checkboxAcceptRegulationsText")}{" "}
                  <Link
                    fw="bold"
                    onDisabledWithUnderline
                    rel="noreferrer"
                    target="_blank"
                    text
                    to={getLocalizedRoute({
                      route: E_Routes.termsAndConditions,
                    })}
                    withUnderline
                  >
                    {tCommon("inputs.checkboxAcceptTermsAndRegulationsLink")}
                  </Link>{" "}
                  {tCommon("inputs.checkboxAcceptRegulationsAnd")}{" "}
                  <Link
                    fw="bold"
                    onDisabledWithUnderline
                    rel="noreferrer"
                    target="_blank"
                    text
                    to={getLocalizedRoute({
                      route: E_Routes.privacyPolicy,
                    })}
                    withUnderline
                  >
                    {tCommon("inputs.checkboxAcceptPrivacyPolicyLink")}
                  </Link>
                </>
              }
              mb={24}
              mt={12}
              name={formNames.checkboxAcceptRegulations}
              w="100%"
              withAsterisk
              {...form.getInputProps(formNames.checkboxAcceptRegulations, {
                type: "checkbox",
              })}
            />
            <Checkbox
              key={form.key(formNames.checkboxCreateListing)}
              name={formNames.checkboxCreateListing}
              required
              {...form.getInputProps(formNames.checkboxCreateListing, {
                type: "checkbox",
              })}
            />
          </div>
        </InputWrapper>
      </Section>
    </Form>
  );
};
