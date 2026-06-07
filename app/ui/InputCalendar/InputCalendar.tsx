import { faCalendar } from "@fortawesome/free-regular-svg-icons";
import { type BoxProps, type MantineSize, PopoverProps } from "@mantine/core";
import type { DateValue } from "@mantine/dates";
import { DateInput as MantineInputDate } from "@mantine/dates";
import dayjs from "dayjs";
import type { ReactNode } from "react";
import { memo, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useActionData } from "react-router";

import { namespaces } from "~/constants/namespaces";
import type { T_FormNames } from "~/lib/zodFormValidator";
import type { T_ResponseOnFailure } from "~/models/response";
import { countSpaces } from "~/utilities/functions";

import { IconSeo } from "../IconSeo";

type T_InputCalendar = {
  clearable?: boolean;
  clearOnSelect?: boolean;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  error?: string;
  label?: ReactNode;
  maxDate?: Date;
  minDate?: Date;
  name: T_FormNames;
  onChange?: (value: null | string) => void;
  placeholder?: string;
  popoverProps?: PopoverProps;
  required?: boolean;
  size?: MantineSize;
  value?: DateValue;
  withoutDescription?: boolean;
} & BoxProps;

const InputCalendar = ({
  clearable = false,
  clearOnSelect = true,
  description,
  disabled,
  disabledWithOpacity = false,
  error,
  label,
  maxDate,
  minDate,
  name,
  onChange,
  placeholder,
  popoverProps,
  required = true,
  size = "md",
  value,
  withoutDescription = false,
  ...restProps
}: T_InputCalendar) => {
  const [globalError, setGlobalError] = useState<string | undefined>();

  const actionData = useActionData<T_ResponseOnFailure>();
  const { t } = useTranslation(namespaces.notifications);
  const { t: tCommon } = useTranslation(namespaces.common);
  const inputReference = useRef<HTMLInputElement>(null);

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
    if (clearOnSelect) {
      inputReference.current?.blur();
    }
    onChange?.(event ? dayjs(event).startOf("day").toISOString() : "");
    setGlobalError(undefined);
  };

  return (
    <MantineInputDate
      {...restProps}
      clearable={clearable}
      description={inputDescription}
      disabled={disabled}
      error={errorValue}
      highlightToday
      label={inputLabel}
      maxDate={maxDate ? dayjs(maxDate).format("YYYY-MM-DD") : undefined}
      minDate={minDate ? dayjs(minDate).format("YYYY-MM-DD") : undefined}
      name={name}
      onChange={handleOnChangeInput}
      opacity={(() => {
        if (!disabled) {
          return 1;
        }
        if (disabledWithOpacity) {
          return 0.3;
        }
        return 1;
      })()}
      placeholder={
        placeholder ?? (required ? undefined : tCommon("inputs.optional"))
      }
      popoverProps={popoverProps}
      ref={inputReference}
      required={required}
      rightSection={<IconSeo icon={faCalendar} size="1x" />}
      rightSectionPointerEvents="none"
      size={size}
      style={{
        cursor: "default",
      }}
      value={value}
      valueFormat="DD MMMM YYYY"
      variant="filled"
      w="100%"
    />
  );
};

export default memo(InputCalendar);
