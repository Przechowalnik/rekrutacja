import type { BoxProps, MantineSize } from "@mantine/core";
import {
  CloseButton,
  MultiSelect as MantineSelectMultiple,
} from "@mantine/core";
import type { ReactNode } from "react";
import { memo, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useActionData } from "react-router";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { useLayout } from "~/hooks/useLayout";
import type { T_FormNames } from "~/lib/zodFormValidator";
import type { T_ResponseOnFailure } from "~/models/response";
import {
  countSpaces,
  disableBodyScroll,
  enableBodyScroll,
} from "~/utilities/functions";

type T_SelectMultipleOptions = {
  icon?: ReactNode;
  label: string;
  priority?: number;
  value: string;
};

export type T_SelectMultipleOptionsGroup = {
  group: string;
  id?: null | string;
  items: T_SelectMultipleOptions[];
  priority?: number;
};

export type T_SelectMultipleVariant = "default" | "filled" | "unstyled";

type T_SelectMultiple = {
  clearable?: boolean;
  closeOptionOnClick?: boolean;
  defaultValue?: string[];
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  error?: string;
  label?: string;
  leftSection?: ReactNode;
  name: T_FormNames;
  onChange?: (values: string[]) => void;
  options: T_SelectMultipleOptions[] | T_SelectMultipleOptionsGroup[];
  placeholder?: string;
  required?: boolean;
  rightSection?: ReactNode;
  searchable?: boolean;
  size?: MantineSize | (string & {}); // NOSONAR
  value?: string[];
  variant?: T_SelectMultipleVariant;
  withCheckIcon?: boolean;
  withoutDescription?: boolean;
  withSort?: boolean;
} & BoxProps;

const SelectMultiple = ({
  clearable,
  closeOptionOnClick,
  defaultValue,
  description,
  disabled,
  disabledWithOpacity = false,
  error,
  label,
  leftSection,
  name,
  onChange,
  options = [],
  placeholder,
  required = true,
  rightSection,
  searchable = false,
  size = "md",
  value,
  variant = "filled",
  withCheckIcon = true,
  withoutDescription = false,
  withSort = true,
  ...restProps
}: T_SelectMultiple) => {
  const [opened, setOpened] = useState(false);
  const selectMultipleReference = useRef<HTMLInputElement>(null);
  const [globalError, setGlobalError] = useState<string | undefined>();

  const actionData = useActionData<T_ResponseOnFailure>();
  const { t } = useTranslation(namespaces.notifications);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { isMobileDevice } = useLayout();

  const selectMultipleLabel = label ?? tCommon(`inputs.${name}`);
  const selectMultipleDescription = withoutDescription
    ? null
    : (description ?? tCommon(`inputsDescription.${name}`));

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

  const handleChange = (value: string[]) => {
    if (closeOptionOnClick) {
      setOpened(false);
    }
    onChange?.(value);
    setGlobalError(undefined);
  };

  const handleClearSelectMultiple = () => {
    if (selectMultipleReference.current) {
      selectMultipleReference.current.value = "";
    }
  };

  if (withSort) {
    for (const option of options) {
      if ("items" in option) {
        option.items.sort((a, b) => {
          if ("priority" in a && "priority" in b) {
            return (b.priority ?? -1) - (a.priority ?? -1);
          }
          return a.label.localeCompare(b.label);
        });
      }
    }

    options.sort((a, b) => {
      if ("priority" in a && "priority" in b) {
        return (b.priority ?? -1) - (a.priority ?? -1);
      }
      if ("label" in a && "label" in b) {
        return a.label.localeCompare(b.label);
      }
      return 0;
    });
  }

  return (
    <MantineSelectMultiple
      {...restProps}
      comboboxProps={{
        transitionProps: { duration: 200, transition: "pop" },
      }}
      data={options}
      defaultValue={defaultValue}
      description={selectMultipleDescription}
      disabled={disabled}
      dropdownOpened={opened}
      error={errorValue}
      label={selectMultipleLabel}
      leftSection={leftSection}
      onChange={handleChange}
      onDropdownClose={() => {
        setOpened(false);
        if (!isMobileDevice) {
          enableBodyScroll();
        }
      }}
      onDropdownOpen={() => {
        setOpened(true);
        if (!isMobileDevice) {
          disableBodyScroll();
        }
      }}
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
      radius="md"
      ref={selectMultipleReference}
      required={required}
      rightSection={
        clearable ? (
          <CloseButton
            aria-label="Clear input"
            onClick={handleClearSelectMultiple}
          />
        ) : (
          rightSection
        )
      }
      searchable={searchable}
      size={size}
      styles={{
        dropdown: { maxHeight: 200, overflowY: "auto" },
        pill: {
          backgroundColor: colorsMantine.primary,
          color: colorsMantine.whiteText,
        },
      }}
      value={value}
      variant={variant}
      w="100%"
      withCheckIcon={withCheckIcon}
      withScrollArea={false}
    />
  );
};

export default memo(SelectMultiple);
