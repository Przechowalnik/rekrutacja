import { Box } from "@mantine/core";
import { FormErrors, useForm } from "@mantine/form";
import dayjs from "dayjs";
import { PropsWithChildren, SyntheticEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { inputMaxLength, inputMinLength } from "~/constants/input";
import { namespaces } from "~/constants/namespaces";
import { globalClasses } from "~/constants/styles";
import {
  T_SearchListingsCalendar,
  T_SearchListingsExtraFilters,
} from "~/context/SearchListingsContext";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { E_ListingType } from "~/models/enums";
import {
  resetFormFieldsAndShowNotification,
  showAllErrorsForm,
} from "~/utilities/form";
import { compareObjects } from "~/utilities/functions";

import { ButtonArrowLeft } from "../ButtonArrowLeft";
import { ButtonSave } from "../ButtonSave";
import { Checkbox } from "../Checkbox";
import { Collapse } from "../Collapse";
import { Form } from "../Form";
import { Input } from "../Input";
import { InputDatePicker } from "../InputDatePicker";
import { InputWrapper } from "../InputWrapper";
import { Modal } from "../Modal";
import { Section } from "../Section";
import { Text } from "../Text";
import { WrapperRemoveOnHidden } from "../WrapperRemoveOnHidden";

type T_ModalSelectListingDate = {
  defaultValues: {
    availableFrom: null | string;
    longTerm: boolean;
    rentalDays: null | number;
    shortTerm: boolean;
  };
  onClose?: () => void;
  onSuccess: (properties: T_SearchListingsCalendar) => void;
  opened: boolean;
  searchListingsExtraFilters: T_SearchListingsExtraFilters;
};

const ModalSelectListingDate = ({
  defaultValues,
  onClose,
  onSuccess,
  opened,
  searchListingsExtraFilters,
}: T_ModalSelectListingDate) => {
  const [selectedShortTerm, setSelectedShortTerm] = useState(
    defaultValues.shortTerm,
  );
  const [selectedLongTerm, setSelectedLongTerm] = useState(
    defaultValues.longTerm,
  );
  const [haveChanges, setHaveChanges] = useState(false);

  const { t } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);

  const validRent =
    searchListingsExtraFilters?.type === E_ListingType.RENT &&
    selectedShortTerm;

  const initialValues = {
    [formNames.checkboxListingLongTerm]: defaultValues.longTerm,
    [formNames.checkboxListingShortTerm]: defaultValues.shortTerm,
    [formNames.listingAvailableFrom]: defaultValues.availableFrom
      ? dayjs(defaultValues.availableFrom).format("YYYY-MM-DD")
      : null,
    [formNames.listingRentalDays]: defaultValues.rentalDays,
  };

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues,
    mode: "uncontrolled",
    onValuesChange(values) {
      const isObjectsTheSame = compareObjects({
        object1: initialValues,
        object2: values,
      });

      setSelectedLongTerm(values[formNames.checkboxListingLongTerm]);
      setSelectedShortTerm(values[formNames.checkboxListingShortTerm]);
      setHaveChanges(!isObjectsTheSame);
    },
    validate: {
      [formNames.checkboxListingLongTerm]: value =>
        checkFormValidator({
          formName: formNames.checkboxListingLongTerm,
          optional: true,
          value,
        }),
      [formNames.checkboxListingShortTerm]: value =>
        checkFormValidator({
          formName: formNames.checkboxListingShortTerm,
          optional: true,
          value,
        }),
      [formNames.listingAvailableFrom]: value =>
        checkFormValidator({
          formName: formNames.listingAvailableFrom,
          optional: true,
          value,
        }),
      [formNames.listingRentalDays]: value =>
        checkFormValidator({
          formName: formNames.listingRentalDays,
          optional: true,
          value,
        }),
    },
  });

  useEffect(() => {
    if (!selectedLongTerm) {
      return;
    }

    resetFormFieldsAndShowNotification({
      fieldsToReset: [formNames.checkboxListingShortTerm],
      form,
    });
  }, [selectedLongTerm]);

  useEffect(() => {
    if (!selectedShortTerm) {
      return;
    }

    resetFormFieldsAndShowNotification({
      fieldsToReset: [formNames.checkboxListingLongTerm],
      form,
    });
  }, [selectedShortTerm]);

  useEffect(() => {
    if (!opened) {
      return;
    }

    form.setFieldValue(
      formNames.listingAvailableFrom,
      defaultValues.availableFrom
        ? (defaultValues.availableFrom as never)
        : null,
    );
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
      checkboxListingLongTerm,
      checkboxListingShortTerm,
      listingAvailableFrom,
      listingRentalDays,
    } = values;

    onSuccess({
      availableFrom: listingAvailableFrom ?? null,
      longTerm: checkboxListingLongTerm,
      rentalDays: checkboxListingShortTerm ? listingRentalDays || null : null,
      shortTerm: checkboxListingShortTerm,
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
          description={`${t("modalSelectListingDate.description")}`}
          isInModal
          title={t("modalSelectListingDate.title")}
        >
          <Text center fw="bold" pb={24}>
            {searchListingsExtraFilters?.type
              ? t("modalSelectListingDate.informationSelected", {
                  name: t(`listingType.${searchListingsExtraFilters.type}`),
                })
              : t("modalSelectListingDate.informationNoSelected")}
          </Text>
          <InputWrapper>
            <InputDatePicker
              key={form.key(formNames.listingAvailableFrom)}
              {...form.getInputProps(formNames.listingAvailableFrom)}
              clearable
              disabledWithOpacity={false}
              label={t("modalSelectLocation.inputCalendar")}
              minDate={dayjs().toDate()}
              name={formNames.listingAvailableFrom}
              popoverProps={{
                zIndex: 2300,
              }}
              required={false}
              withoutDescription
            />
            {searchListingsExtraFilters?.type === E_ListingType.RENT && (
              <Checkbox
                key={form.key(formNames.checkboxListingLongTerm)}
                name={formNames.checkboxListingLongTerm}
                required={false}
                {...form.getInputProps(formNames.checkboxListingLongTerm, {
                  type: "checkbox",
                })}
              />
            )}
            <Box w="100%">
              {searchListingsExtraFilters?.type === E_ListingType.RENT && (
                <Checkbox
                  key={form.key(formNames.checkboxListingShortTerm)}
                  name={formNames.checkboxListingShortTerm}
                  required={false}
                  {...form.getInputProps(formNames.checkboxListingShortTerm, {
                    type: "checkbox",
                  })}
                />
              )}
              <Collapse fullWith opened={validRent}>
                <Box
                  className={globalClasses.fadePage}
                  pl={38}
                  pt={12}
                  w="100%"
                >
                  <Input
                    key={form.key(formNames.listingRentalDays)}
                    name={formNames.listingRentalDays}
                    required={false}
                    {...form.getInputProps(formNames.listingRentalDays)}
                    clearable
                    max={inputMaxLength.listingRentalDays}
                    min={inputMinLength.listingRentalDays}
                    type="number"
                  />
                </Box>
              </Collapse>
            </Box>
          </InputWrapper>
        </Section>
      </Form>
    </Modal>
  );
};

export const ModalWrapper = (
  properties: PropsWithChildren<T_ModalSelectListingDate>,
) => {
  return (
    <WrapperRemoveOnHidden opened={properties.opened}>
      {({ visible }) => (
        <ModalSelectListingDate {...properties} opened={visible} />
      )}
    </WrapperRemoveOnHidden>
  );
};
