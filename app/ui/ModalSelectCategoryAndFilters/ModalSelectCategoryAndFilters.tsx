import { Box } from "@mantine/core";
import { FormErrors, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { PropsWithChildren, SyntheticEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import {
  T_SearchListingLive,
  T_SearchListingsCategoryAndFilters,
  T_SearchListingsExtraFilters,
} from "~/context/SearchListingsContext";
import { useLayout } from "~/hooks/useLayout";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import {
  E_ListingCategory,
  E_ListingType,
  T_ListingCategory,
  T_ListingCondition,
  T_ListingContainerType,
  T_ListingParkingType,
  T_ListingPlotType,
  T_ListingType,
  T_ListingUnitType,
} from "~/models/enums";
import { showAllErrorsForm } from "~/utilities/form";
import { compareObjects } from "~/utilities/functions";

import { ButtonArrowLeft } from "../ButtonArrowLeft";
import { ButtonSave } from "../ButtonSave";
import { Collapse } from "../Collapse";
import { Form } from "../Form";
import { Modal } from "../Modal";
import { Section } from "../Section";
import { SelectListingCategory } from "../SelectListingCategory";
import { SelectListingCondition } from "../SelectListingCondition";
import { SelectListingContainerTypes } from "../SelectListingContainerTypes";
import { SelectListingParkingTypes } from "../SelectListingParkingTypes";
import { SelectListingPlotTypes } from "../SelectListingPlotTypes";
import { SelectListingType } from "../SelectListingType";
import { SelectListingUnitTypes } from "../SelectListingUnitTypes";
import { WrapperRemoveOnHidden } from "../WrapperRemoveOnHidden";

type T_ModalSelectCategoryAndParkingType = {
  defaultValues: {
    category: null | T_ListingCategory;
    condition: null | T_ListingCondition;
    containerTypes: T_ListingContainerType[];
    parkingTypes: T_ListingParkingType[];
    plotTypes: T_ListingPlotType[];
    type: null | T_ListingType;
    unitTypes: T_ListingUnitType[];
  };
  onClose?: () => void;
  onSuccess: (
    properties: T_SearchListingsCategoryAndFilters &
      T_SearchListingsExtraFilters,
  ) => void;
  opened: boolean;
  searchListingLive: T_SearchListingLive | undefined;
};

const ModalSelectCategoryAndFilters = ({
  defaultValues,
  onClose,
  onSuccess,
  opened,
  searchListingLive,
}: T_ModalSelectCategoryAndParkingType) => {
  const [isReady, setIsReady] = useState(false);
  const [selectedListingType, setSelectedListingType] =
    useState<null | T_ListingType>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<null | T_ListingCategory>(null);
  const [haveChanges, setHaveChanges] = useState(false);

  const { t } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { platformColor } = useLayout();

  const initialValues = {
    [formNames.listingCategory]: defaultValues.category ?? "",
    [formNames.listingCondition]: defaultValues.condition ?? "",
    [formNames.listingContainerTypes]: defaultValues.containerTypes ?? [],
    [formNames.listingParkingTypes]: defaultValues.parkingTypes ?? [],
    [formNames.listingPlotTypes]: defaultValues.plotTypes ?? [],
    [formNames.listingType]: defaultValues.type ?? "",
    [formNames.listingUnitTypes]: defaultValues.unitTypes ?? [],
  };

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues,
    mode: "uncontrolled",
    onValuesChange(values) {
      const {
        listingCategory: listingCategoryOnUpdate,
        listingCondition,
        listingContainerTypes,
        listingParkingTypes,
        listingPlotTypes,
        listingType,
        listingUnitTypes,
      } = values;

      const isObjectsTheSame = compareObjects({
        object1: initialValues,
        object2: {
          [formNames.listingCategory]: listingCategoryOnUpdate ?? "",
          [formNames.listingCondition]: listingCondition ?? "",
          [formNames.listingContainerTypes]: listingContainerTypes ?? [],
          [formNames.listingParkingTypes]: listingParkingTypes ?? [],
          [formNames.listingPlotTypes]: listingPlotTypes ?? [],
          [formNames.listingType]: listingType ?? "",
          [formNames.listingUnitTypes]: listingUnitTypes ?? [],
        },
      });

      setHaveChanges(!isObjectsTheSame);

      const { listingCategory } = values;

      setSelectedListingType(
        listingType ? (listingType as T_ListingType) : null,
      );
      setSelectedCategory(
        listingCategory ? (listingCategory as T_ListingCategory) : null,
      );
    },
    validate: {
      [formNames.listingCategory]: value =>
        checkFormValidator({
          formName: formNames.listingCategory,
          optional: true,
          value,
        }),
      [formNames.listingCondition]: value =>
        checkFormValidator({
          formName: formNames.listingCondition,
          optional: true,
          value,
        }),
      [formNames.listingContainerTypes]: value =>
        checkFormValidator({
          formName: formNames.listingContainerTypes,
          optional: true,
          value,
        }),
      [formNames.listingParkingTypes]: value =>
        checkFormValidator({
          formName: formNames.listingParkingTypes,
          optional: true,
          value,
        }),
      [formNames.listingPlotTypes]: value =>
        checkFormValidator({
          formName: formNames.listingPlotTypes,
          optional: true,
          value,
        }),
      [formNames.listingType]: value =>
        checkFormValidator({
          formName: formNames.listingType,
          optional: true,
          value,
        }),
      [formNames.listingUnitTypes]: value =>
        checkFormValidator({
          formName: formNames.listingUnitTypes,
          optional: true,
          value,
        }),
    },
  });

  useEffect(() => {
    if (
      selectedListingType !== E_ListingType.SALE ||
      !selectedCategory ||
      !isReady
    ) {
      return;
    }

    notifications.show({
      color: platformColor,
      message: tNotifications("listingTypeChangeAlert.message"),
      title: tNotifications("listingTypeChangeAlert.title"),
    });
    form.setFieldValue(formNames.listingCategory, "");
  }, [selectedListingType]);

  useEffect(() => {
    if (selectedCategory === E_ListingCategory.PARKING) {
      form.setFieldValue(
        formNames.listingParkingTypes,
        searchListingLive?.listingParkingTypes ?? [],
      );

      return;
    }

    form.setFieldValue(formNames.listingParkingTypes, []);
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedCategory === E_ListingCategory.CONTAINER) {
      form.setFieldValue(
        formNames.listingContainerTypes,
        searchListingLive?.listingContainerTypes ?? [],
      );

      return;
    }

    form.setFieldValue(formNames.listingContainerTypes, []);
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedCategory === E_ListingCategory.PLOT) {
      form.setFieldValue(
        formNames.listingPlotTypes,
        searchListingLive?.listingPlotTypes ?? [],
      );

      return;
    }

    form.setFieldValue(formNames.listingPlotTypes, []);
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedCategory === E_ListingCategory.UNIT) {
      form.setFieldValue(
        formNames.listingUnitTypes,
        searchListingLive?.listingUnitTypes ?? [],
      );

      return;
    }

    form.setFieldValue(formNames.listingUnitTypes, []);
  }, [selectedCategory]);

  useEffect(() => {
    if (!opened) {
      return;
    }

    setIsReady(true);

    form.setFieldValue(
      formNames.listingType,
      defaultValues.type as T_ListingType,
    );
    form.setFieldValue(
      formNames.listingCategory,
      defaultValues.category ? (defaultValues.category as never) : "",
    );
    form.setFieldValue(
      formNames.listingCondition,
      defaultValues.condition ? (defaultValues.condition as never) : "",
    );
    form.setFieldValue(
      formNames.listingParkingTypes,
      defaultValues.parkingTypes as never[],
    );
    form.setFieldValue(
      formNames.listingContainerTypes,
      defaultValues.containerTypes as never[],
    );
    form.setFieldValue(
      formNames.listingPlotTypes,
      defaultValues.plotTypes as never[],
    );
    form.setFieldValue(
      formNames.listingUnitTypes,
      defaultValues.unitTypes as never[],
    );
    setSelectedCategory(defaultValues.category as T_ListingCategory);
  }, [defaultValues, opened]);

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
      listingCategory,
      listingCondition,
      listingContainerTypes,
      listingParkingTypes,
      listingPlotTypes,
      listingType,
      listingUnitTypes,
    } = values;

    onSuccess({
      category: (listingCategory ?? null) as null | T_ListingCategory,
      condition: listingCategory
        ? (listingCondition as T_ListingCondition)
        : null,
      containerTypes:
        listingCategory === E_ListingCategory.CONTAINER
          ? listingContainerTypes
          : [],
      parkingTypes:
        listingCategory === E_ListingCategory.PARKING
          ? listingParkingTypes
          : [],
      plotTypes:
        listingCategory === E_ListingCategory.PLOT ? listingPlotTypes : [],
      type: listingType as T_ListingType,
      unitTypes:
        listingCategory === E_ListingCategory.UNIT ? listingUnitTypes : [],
    });
  };

  return (
    <Modal onClickOutside={onClose} opened={opened} size="lg" zIndex={2020}>
      <Form onSubmit={form.onSubmit(handleSubmit, handleSubmitErrors)}>
        <Section
          buttons={
            <>
              {onClose && (
                <ButtonArrowLeft onClick={onClose} size="sm" textGoBack />
              )}
              <ButtonSave
                disabled={!haveChanges}
                size="sm"
                tooltip={{
                  label: t("buttonSaveTooltip"),
                }}
                type="submit"
              />
            </>
          }
          description={t("modalSelectCategories.description")}
          isInModal
          title={t("modalSelectCategories.title")}
        >
          <Box pb={24} w="100%">
            <SelectListingType
              allowDeselect
              form={form}
              required={false}
              withManagePageScroll={false}
            />
          </Box>
          <Box pb={24} w="100%">
            <SelectListingCondition
              allowDeselect
              form={form}
              required={false}
              withManagePageScroll={false}
            />
          </Box>
          <SelectListingCategory
            allowDeselect
            form={form}
            listingType={selectedListingType ?? E_ListingType.RENT}
            required={false}
            withManagePageScroll={false}
          />
          <Collapse
            fullWith
            opened={selectedCategory === E_ListingCategory.PARKING}
          >
            <Box pt={24} w="100%">
              <SelectListingParkingTypes form={form} required={false} />
            </Box>
          </Collapse>
          <Collapse
            fullWith
            opened={selectedCategory === E_ListingCategory.CONTAINER}
          >
            <Box pt={24} w="100%">
              <SelectListingContainerTypes form={form} required={false} />
            </Box>
          </Collapse>
          <Collapse
            fullWith
            opened={selectedCategory === E_ListingCategory.PLOT}
          >
            <Box pt={24} w="100%">
              <SelectListingPlotTypes
                form={form}
                listingType={selectedListingType ?? undefined}
                required={false}
              />
            </Box>
          </Collapse>
          <Collapse
            fullWith
            opened={selectedCategory === E_ListingCategory.UNIT}
          >
            <Box pt={24} w="100%">
              <SelectListingUnitTypes form={form} required={false} />
            </Box>
          </Collapse>
        </Section>
      </Form>
    </Modal>
  );
};

export const ModalWrapper = (
  properties: PropsWithChildren<T_ModalSelectCategoryAndParkingType>,
) => {
  return (
    <WrapperRemoveOnHidden opened={properties.opened}>
      {({ visible }) => (
        <ModalSelectCategoryAndFilters {...properties} opened={visible} />
      )}
    </WrapperRemoveOnHidden>
  );
};
