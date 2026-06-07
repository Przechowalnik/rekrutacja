import type { DateTimePickerProps, DateValue } from "@mantine/dates";
import { DateTimePicker as MantineDateTimePicker } from "@mantine/dates";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useActionData } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { useLayout } from "~/hooks/useLayout";
import type { T_FormNames } from "~/lib/zodFormValidator";
import type { T_ResponseOnFailure } from "~/models/response";
import { countSpaces } from "~/utilities/functions";

type T_DateTimePicker = {
  defaultValue?: Dayjs;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  error?: string;
  label?: string;
  name: T_FormNames;
  onChange?: (value: DateValue) => void;
  placeholder?: string;
  required?: boolean;
  showDaysBefore?: boolean;
  valueFormat?: "DD-MM-YYYY" | "DD-MM-YYYY HH:mm";
  withoutDescription?: boolean;
};

const handleExcludeDate = (date: string) => {
  const today = dayjs().startOf("day");
  return dayjs(date).isBefore(today);
};

const DateTimePickerToMemoize = ({
  defaultValue,
  description,
  disabled,
  disabledWithOpacity = false,
  error,
  label,
  name,
  onChange,
  placeholder,
  required = true,
  showDaysBefore,
  size = "md",
  valueFormat = "DD-MM-YYYY HH:mm",
  withoutDescription,
  ...restProps
}: T_DateTimePicker & DateTimePickerProps) => {
  const [globalError, setGlobalError] = useState<string | undefined>();

  const actionData = useActionData<T_ResponseOnFailure>();
  const { platformColor } = useLayout();
  const { t } = useTranslation(namespaces.notifications);
  const { t: tCommon } = useTranslation(namespaces.common);

  const inputDescription = withoutDescription
    ? null
    : (description ?? tCommon(`inputsDescription.${name}`));

  const inputLabel = label ?? tCommon(`inputs.${name}`);

  const errorValue: string | undefined = (() => {
    if (globalError) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return t(`${globalError}.message`);
    }
    if (error) {
      if (countSpaces(error) > 0) {
        return error;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return tCommon(`formValidator.${error}` as any);
    }
    return;
  })();

  useEffect(() => {
    if (actionData?.formErrors && Array.isArray(actionData?.formErrors)) {
      const findFieldInFormErrors = actionData?.formErrors.find(
        item => item?.field === name,
      );
      if (findFieldInFormErrors) {
        setGlobalError(findFieldInFormErrors?.message);
        return;
      }
    }

    setGlobalError(undefined);
  }, [actionData]);

  const handleOnChangeInput = (value: DateValue) => {
    onChange?.(value);
    setGlobalError(undefined);
  };

  return (
    <MantineDateTimePicker
      {...restProps}
      defaultValue={defaultValue ? defaultValue.toDate() : undefined}
      description={inputDescription}
      disabled={disabled}
      error={errorValue}
      excludeDate={showDaysBefore ? undefined : handleExcludeDate}
      highlightToday
      label={inputLabel}
      name={name}
      onChange={handleOnChangeInput}
      opacity={disabled && disabledWithOpacity ? 0.3 : 1}
      placeholder={
        placeholder ?? (required ? undefined : tCommon("inputs.optional"))
      }
      radius="md"
      required={required}
      size={size}
      styles={theme => ({
        calendarHeaderLevel: {
          fontWeight: "bold",
        },
        weekday: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          color: theme.colors[platformColor][5],
          fontWeight: "bold",
        },
      })}
      valueFormat={valueFormat}
      variant="filled"
      w="100%"
    />
  );
};

export const DateTimePicker = memo(DateTimePickerToMemoize);
