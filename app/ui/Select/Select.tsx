/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { BoxProps, ComboboxItem, MantineSize } from "@mantine/core";
import {
  Box,
  CloseButton,
  NativeSelect as MantineNativeSelect,
  Select as MantineSelect,
} from "@mantine/core";
import type { ReactNode } from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useActionData } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { useLayout } from "~/hooks/useLayout";
import type { T_FormNames } from "~/lib/zodFormValidator";
import type { T_ResponseOnFailure } from "~/models/response";
import {
  countSpaces,
  disableBodyScroll,
  enableBodyScroll,
} from "~/utilities/functions";

export type T_SelectOptions = {
  icon?: ReactNode;
  label: string;
  priority?: number;
  value: string;
};

export type T_SelectOptionsGroup = {
  group: string;
  id?: null | string;
  items: T_SelectOptions[];
  priority?: number;
};

export type T_SelectVariant = "default" | "filled" | "unstyled";

type T_Select = {
  allowDeselect?: boolean;
  clearable?: boolean;
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  error?: string;
  label?: string;
  name: T_FormNames;
  onChange?: (option: ComboboxItem | null | string) => void;
  options: T_SelectOptions[] | T_SelectOptionsGroup[];
  placeholder?: string;
  pointerEventsForTooltipOnDisabled?: boolean;
  required?: boolean;
  rightSection?: ReactNode;
  searchable?: boolean;
  size?: MantineSize | (string & {}); // NOSONAR
  value?: string;
  variant?: T_SelectVariant;
  withCheckIcon?: boolean;
  withManagePageScroll?: boolean;
  withNativeSelect?: boolean;
  withoutDescription?: boolean;
  withSort?: boolean;
} & BoxProps;

const Select = ({
  allowDeselect,
  clearable,
  defaultValue,
  description,
  disabled,
  disabledWithOpacity = false,
  error,
  label,
  name,
  onChange,
  options = [],
  placeholder,
  pointerEventsForTooltipOnDisabled,
  required = true,
  rightSection,
  searchable = false,
  size = "md",
  value,
  variant = "filled",
  w = "100%",
  withCheckIcon = true,
  withManagePageScroll = true,
  withNativeSelect = true,
  withoutDescription = false,
  withSort = true,
  ...restProps
}: T_Select) => {
  const [selectKey, setSelectKey] = useState(0);
  const selectReference = useRef<HTMLInputElement>(null);
  const [globalError, setGlobalError] = useState<string | undefined>();
  const actionData = useActionData<T_ResponseOnFailure>();
  const { t } = useTranslation(namespaces.notifications);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { isMobileDevice } = useLayout();

  const selectLabel = label ?? tCommon(`inputs.${name}`);
  const selectDescription = withoutDescription
    ? null
    : (description ?? tCommon(`inputsDescription.${name}`));

  const errorValue: string | undefined = (() => {
    if (globalError) {
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

  const handleChange = (_value: null | string, option: ComboboxItem) => {
    onChange?.(option?.value ?? "");
    setGlobalError(undefined);
  };

  const handleClearSelect = useCallback(() => {
    if (selectReference.current) {
      selectReference.current.value = "";
    }
    onChange?.("");
  }, []);

  useEffect(() => {
    if (value === undefined) {
      return;
    }

    if (!value) {
      setSelectKey(previous => previous + 1);
    }
  }, [value, options]);

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

  let leftSectionFromOptions: null | ReactNode = null;
  if (options) {
    for (const item of options) {
      if ("items" in item) {
        const selectedItem = item.items.find(
          itemSelect => itemSelect.value === value,
        );

        if (selectedItem) {
          leftSectionFromOptions = selectedItem?.icon ?? null;
          continue;
        }
      } else if (item.value === value) {
        leftSectionFromOptions = item?.icon ?? null;
        continue;
      }
    }
  }

  const selectContent = (
    <MantineSelect
      key={selectKey}
      {...restProps}
      allowDeselect={allowDeselect}
      clearable={clearable}
      comboboxProps={{
        transitionProps: { duration: 200, transition: "pop" },
      }}
      data={
        allowDeselect
          ? [
              {
                label: tCommon("select.selectNone"),
                value: "",
              },
              ...options,
            ]
          : options
      }
      defaultValue={value ? undefined : defaultValue}
      description={selectDescription}
      disabled={disabled}
      error={errorValue}
      label={selectLabel}
      leftSection={leftSectionFromOptions ?? undefined}
      onChange={handleChange}
      onDropdownClose={() => {
        if (withManagePageScroll && !isMobileDevice) {
          enableBodyScroll();
        }
      }}
      onDropdownOpen={() => {
        if (withManagePageScroll && !isMobileDevice) {
          disableBodyScroll();
        }
      }}
      opacity={disabled && disabledWithOpacity ? 0.3 : 1}
      placeholder={
        placeholder ?? (required ? undefined : tCommon("inputs.optional"))
      }
      radius="md"
      ref={selectReference}
      required={required}
      rightSection={rightSection}
      searchable={searchable}
      size={size}
      style={{
        ...(pointerEventsForTooltipOnDisabled && disabled
          ? { pointerEvents: "none" }
          : {}),
      }}
      styles={{
        dropdown: { maxHeight: 200, overflowY: "auto" },
        input: {
          height: 42,
        },
      }}
      value={defaultValue ? undefined : value}
      variant={variant}
      w={w}
      withCheckIcon={withCheckIcon}
      withScrollArea={false}
    />
  );

  if (!withNativeSelect || disabled) {
    return selectContent;
  }

  return (
    <Box w={w}>
      {isMobileDevice ? (
        <MantineNativeSelect
          key={selectKey}
          {...restProps}
          data={
            allowDeselect || isMobileDevice
              ? [
                  {
                    label: tCommon("select.selectNone"),
                    value: "",
                  },
                  ...options,
                ]
              : options
          }
          defaultValue={(() => {
            if (value) {
              return;
            }
            if (defaultValue === null) {
              return "";
            }
            return defaultValue;
          })()}
          description={selectDescription}
          disabled={disabled}
          error={errorValue}
          label={selectLabel}
          onChange={event => {
            const findOption = options.find(item => {
              if ("value" in item) {
                return item.value === event.currentTarget.value;
              }
              return item.items.some(
                itemInItems => itemInItems.value === event.currentTarget.value,
              );
            });

            if (!findOption) {
              onChange?.(null);
            } else if ("value" in findOption) {
              onChange?.(findOption?.value);
            } else {
              const findItemInOption = findOption.items.find(
                item => item.value === event.currentTarget.value,
              );
              onChange?.(findItemInOption?.value ?? null);
            }

            setGlobalError(undefined);
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
          radius="md"
          // @ts-ignore
          ref={selectReference}
          required={required}
          rightSection={
            clearable ? (
              <CloseButton
                aria-label="Clear input"
                onClick={handleClearSelect}
              />
            ) : (
              rightSection
            )
          }
          rightSectionPointerEvents={clearable ? "painted" : undefined}
          size={size}
          style={{
            ...(pointerEventsForTooltipOnDisabled && disabled
              ? { pointerEvents: "none" }
              : {}),
          }}
          styles={{
            input: {
              height: 42,
            },
          }}
          value={(() => {
            if (defaultValue) {
              return;
            }
            if (value === null) {
              return "";
            }
            return value;
          })()}
          variant="filled"
          w="100%"
        />
      ) : (
        selectContent
      )}
    </Box>
  );
};

export default memo(Select);
