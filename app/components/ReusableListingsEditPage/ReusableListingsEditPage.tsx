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
import { E_Routes, routesExtra } from "~/constants/routes";
import { globalClasses } from "~/constants/styles";
import { dynamic } from "~/hoc/dynamic";
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
  E_ListingStatus,
  E_ListingType,
  T_ListingCategory,
  T_ListingContractType,
  T_ListingDeleteReason,
  T_ListingType,
} from "~/models/enums";
import { T_Listing } from "~/models/listing";
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
import { ModalAuthenticator } from "~/ui/ModalAuthenticator";
import { ModalCondition } from "~/ui/ModalCondition";
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
import {
  hasDateExpired,
  isExpiringIn,
  replaceDateToYearMonthHoursMinutesInWordsDay,
} from "~/utilities/date";
import {
  convertToFormData,
  resetFormFieldsAndShowNotification,
  showAllErrorsForm,
} from "~/utilities/form";
import {
  compareObjects,
  generateLocationAddressLastCity,
} from "~/utilities/functions";
import { generateOptionsForListingCategory } from "~/utilities/listing";
import {
  formatAmountToNumber,
  generateListingPriceFromTypeAndContractType,
} from "~/utilities/price";

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
  const [isReadyToClearFields, setIsReadyToClearFields] = useState(false);
  const [selectedListingType, setSelectedListingType] =
    useState<null | T_ListingType>(listing.type);
  const [selectedListingContractType, setSelectedListingContractType] =
    useState<null | T_ListingContractType>(
      listing.type === E_ListingType.SALE
        ? null
        : (listing.contractType ?? E_ListingContractType.LONG_TERM),
    );
  const [selectedListingCategory, setSelectedListingCategory] =
    useState<null | T_ListingCategory>(listing.category);
  const [haveChanges, setHaveChanges] = useState(false);

  const { t } = useTranslation(
    isCompany ? namespaces.companyListingsEdit : namespaces.accountListingsEdit,
  );
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { platformColor } = useLayout();
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

  const initialValues = {
    [formNames.checkboxListingNegotiable]: listing.negotiable,
    [formNames.country]: listing?.location?.country ?? E_Country.POLAND,
    [formNames.flatNumber]: listing?.location?.flatNumber ?? "",
    [formNames.listingAccess]: listing.access ?? "",
    [formNames.listingArea]: listing.area ? Number(listing.area) : "",
    [formNames.listingAvailableFrom]: listing.availableFrom,
    [formNames.listingAvailableTo]: listing?.availableTo
      ? new Date(listing.availableTo)
      : "",
    [formNames.listingCategory]: listing.category,
    [formNames.listingCity]:
      listing?.location?.city?.nameSearch ??
      listing?.location?.cityCustom ??
      "",
    [formNames.listingComfortOption]: listing.comfortOptions ?? [],
    [formNames.listingCondition]: listing.condition ?? "",
    [formNames.listingContainerType]: listing.containerType ?? "",
    [formNames.listingContractType]:
      listing.type === E_ListingType.SALE
        ? ""
        : (listing.contractType ?? E_ListingContractType.LONG_TERM),
    [formNames.listingDescription]: listing.description ?? "",
    [formNames.listingDistrict]: listing?.location?.district?.nameSearch ?? "",
    [formNames.listingEntryOption]: listing.entryOptions ?? [],
    [formNames.listingFloorLevel]:
      typeof listing.floorLevel === "number"
        ? listing.floorLevel.toString()
        : "",
    [formNames.listingHasAvailableDistricts]: false,
    [formNames.listingMinimumRentalDays]: listing?.minimumRentalDays
      ? Number(listing.minimumRentalDays)
      : "",
    [formNames.listingParkingType]: listing.parkingType ?? "",
    [formNames.listingPlotType]:
      listing.category === E_ListingCategory.PLOT
        ? (listing?.plotType ?? "")
        : "",
    [formNames.listingPrice]: listing.price
      ? formatAmountToNumber(listing.price)
      : "",
    [formNames.listingSecurityOption]: listing.securityOptions ?? [],
    [formNames.listingTitle]: listing.title,
    [formNames.listingType]: listing.type,
    [formNames.listingUnitType]:
      listing.category === E_ListingCategory.UNIT
        ? (listing?.unitType ?? "")
        : "",
    [formNames.listingUsageOption]: listing.usageOptions ?? [],
    [formNames.listingUtilityOption]: listing.utilityOptions ?? [],
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
      const {
        listingAvailableFrom,
        listingAvailableTo,
        listingCategory,
        listingContractType,
        listingType,
      } = values;

      const isDataTheSame = compareObjects({
        ignoreCaseInsensitive: true,
        object1: values,
        object2: initialValues,
      });

      setSelectedListingAvailableTo(
        listingAvailableTo
          ? dayjs(listingAvailableTo).format("YYYY-MM-DD")
          : null,
      );

      setSelectedListingAvailableFrom(
        dayjs(listingAvailableFrom).format("YYYY-MM-DD"),
      );

      setSelectedListingType(listingType ?? null);
      setSelectedListingContractType(
        listingContractType
          ? (listingContractType as T_ListingContractType)
          : null,
      );
      setSelectedListingCategory(listingCategory ?? null);
      setIsReadyToClearFields(true);
      setHaveChanges(!isDataTheSame);
    },
    validate: {
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
          optional: true,
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

  const validHaveChanges =
    haveChanges ||
    updatedImages.removed.length > 0 ||
    updatedImages.uploaded.length > 0;

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

  const validCondition =
    selectedListingCategory === E_ListingCategory.ROOM ||
    selectedListingCategory === E_ListingCategory.ATTIC ||
    selectedListingCategory === E_ListingCategory.BASEMENT ||
    selectedListingCategory === E_ListingCategory.WAREHOUSE ||
    selectedListingCategory === E_ListingCategory.UNIT;

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
    if (!selectedListingCategory || !isReadyToClearFields) {
      return;
    }

    notifications.show({
      color: platformColor,
      message: tNotifications("listingTypeChangeAlert.message"),
      title: tNotifications("listingTypeChangeAlert.title"),
    });
    form.setFieldValue(formNames.listingCategory, "" as T_ListingCategory);
  }, [selectedListingType]);

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
    if (!isReadyToClearFields) {
      return;
    }

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
        formNames.listingContractType,
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
    if (!isReadyToClearFields) {
      return;
    }

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
    if (!isReadyToClearFields) {
      return;
    }

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

  const handleSubmit = (
    values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();
    const {
      listingCategory,
      listingContractType,
      listingDistrict,
      listingHasAvailableDistricts,
      listingMinimumRentalDays,
      listingType,
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
        return allListingCategoryRent.includes(listingCategory);
      }
      if (listingType === E_ListingType.SALE) {
        return allListingCategorySale.includes(listingCategory);
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

  const handleUpdateImages = useCallback(
    ({ removed, uploaded }: T_SelectImagesOnChange) => {
      setUpdatedImages({
        removed,
        uploaded,
      });
    },
    [],
  );

  const handleCloseModalConfirm = useCallback(() => {
    setShowModalConfirm(false);
  }, []);

  const handleOnConfirm = () => {
    const values = form.getValues();

    const {
      listingCategory,
      listingCondition,
      listingContractType,
      listingMinimumRentalDays,
      listingPlotType,
      listingType,
      listingUnitType,
    } = values;

    const isListingCategoryInSelectedType = (() => {
      if (!listingCategory) {
        return false;
      }
      if (listingType === E_ListingType.RENT) {
        return allListingCategoryRent.includes(listingCategory);
      }
      if (listingType === E_ListingType.SALE) {
        return allListingCategorySale.includes(listingCategory);
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

    if (validCondition && !listingCondition) {
      notifications.show({
        color: "red",
        message: tNotifications(`noSelectedListingCondition.message`),
        title: tNotifications(`noSelectedListingCondition.title`),
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
    [form, linkCurrent, pendingDeleteReason],
  );

  const sectionAlert = (() => {
    if (!isActive) {
      return t("alert", {
        link: linkPayment,
      });
    }
    if (isHidden) {
      return t("hidden");
    }
  })();

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
    if (
      isActive &&
      !isActiveAndExpiresInThreeDays &&
      !isActiveAndExpiresInOneMonth
    ) {
      return;
    }
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
                  <Button color="dark" type="submit" variant="filled">
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
                defaultImages={listing.images ?? []}
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
                          selectedListingCategory ===
                          E_ListingCategory.CONTAINER
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
          </InputWrapper>
        </Section>
      </Form>
    </>
  );
};
