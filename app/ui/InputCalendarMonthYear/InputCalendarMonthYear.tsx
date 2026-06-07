import { faCalendar } from "@fortawesome/free-regular-svg-icons";
import { type BoxProps, type MantineSize } from "@mantine/core";
import type { DateValue } from "@mantine/dates";
import { MonthPickerInput } from "@mantine/dates";
import type { ReactNode } from "react";
import { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useActionData } from "react-router";

import { namespaces } from "~/constants/namespaces";
import type { T_FormNames } from "~/lib/zodFormValidator";
import type { T_ResponseOnFailure } from "~/models/response";
import { countSpaces } from "~/utilities/functions";

import { IconSeo } from "../IconSeo";

type T_InputCalendarMonthYear = {
  clearable?: boolean;
  defaultValue?: Date;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  error?: string;
  label?: ReactNode;
  name: T_FormNames;
  onChange?: (value: DateValue) => void;
  placeholder?: string;
  required?: boolean;
  size?: MantineSize;
  value?: DateValue;
  variant?: "default" | "filled";
  withoutDescription?: boolean;
} & BoxProps;

const InputCalendarMonthYear = ({
  clearable = false,
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
  size = "md",
  value,
  variant = "filled",
  withoutDescription = false,
  ...restProps
}: T_InputCalendarMonthYear) => {
  const [globalError, setGlobalError] = useState<string | undefined>();

  const actionData = useActionData<T_ResponseOnFailure>();
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

  const handleOnChangeInput = (event: DateValue) => {
    onChange?.(event);
    setGlobalError(undefined);
  };

  const opacity = (() => {
    if (!disabled) {
      return 1;
    }
    if (disabledWithOpacity) {
      return 0.3;
    }
    return 1;
  })();

  return (
    <MonthPickerInput
      {...restProps}
      clearable={clearable}
      defaultValue={defaultValue}
      description={inputDescription}
      disabled={disabled}
      error={errorValue}
      label={inputLabel}
      name={name}
      onChange={handleOnChangeInput}
      opacity={opacity}
      placeholder={
        placeholder ?? (required ? undefined : tCommon("inputs.optional"))
      }
      required={required}
      rightSection={<IconSeo icon={faCalendar} size="1x" />}
      rightSectionPointerEvents="none"
      size={size}
      style={{
        cursor: "default",
      }}
      value={value}
      valueFormat="MMMM YYYY"
      variant={variant}
      w="100%"
    />
  );
};

export default memo(InputCalendarMonthYear);
