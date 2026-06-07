/* eslint-disable @typescript-eslint/ban-ts-comment */
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { BadgeProps, Box, BoxProps, Flex } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { memo, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useActionData } from "react-router";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { useLayout } from "~/hooks/useLayout";
import { T_FormNames } from "~/lib/zodFormValidator";
import { T_ResponseOnFailure } from "~/models/response";
import { countSpaces } from "~/utilities/functions";

import { Badge } from "../Badge";
import { Button } from "../Button";
import { IconSeo, T_IconSeo } from "../IconSeo";
import { Text } from "../Text";

type T_SelectMultipleBadgeOption = {
  icon?: T_IconSeo;
  label: string;
  priority?: number;
  value: string;
};

type T_SelectMultipleBadge = {
  badgeProps?: BadgeProps;
  clearable?: boolean;
  defaultValue?: string[];
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  error?: string;
  form?: UseFormReturnType<unknown>;
  gap?: number;
  label?: string;
  name: T_FormNames;
  onBlur?: () => void;
  onChange?: (option: string[]) => void;
  onFocus?: () => void;
  options: T_SelectMultipleBadgeOption[];
  required?: boolean;
  variant?: "default" | "filled";
  withoutDescription?: boolean;
  withSort?: boolean;
} & BoxProps;

const SelectMultipleBadge = ({
  badgeProps = {
    size: "lg",
  },
  clearable = true,
  defaultValue = [],
  description,
  disabled,
  disabledWithOpacity = false,
  error,
  form,
  gap = 6,
  label,
  name,
  onBlur,
  onChange,
  onFocus,
  options,
  required,
  variant = "filled",
  w = "100%",
  withoutDescription = false,
  withSort,
  ...restProps
}: T_SelectMultipleBadge) => {
  const [isFocused, setIsFocused] = useState(false);
  const [activeValues, setActiveValues] = useState<string[]>(defaultValue);
  const [globalError, setGlobalError] = useState<string | undefined>();

  const { t } = useTranslation(namespaces.notifications);
  const { t: tSeo } = useTranslation(namespaces.seo);
  const { t: tCommon } = useTranslation(namespaces.common);
  const actionData = useActionData<T_ResponseOnFailure>();
  const { platformColor } = useLayout();

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
    setTimeout(() => {
      if (form) {
        form.setFieldValue(name, activeValues);
      }
    }, 1000);
  }, [activeValues]);

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

  const handleClick = useCallback(
    (clickedValue: string) => {
      setActiveValues(previous =>
        previous.includes(clickedValue)
          ? previous.filter(value => value !== clickedValue)
          : [...previous, clickedValue],
      );

      const newValues = activeValues.includes(clickedValue)
        ? activeValues.filter(value => value !== clickedValue)
        : [...activeValues, clickedValue];

      onChange?.(newValues);
    },
    [activeValues],
  );

  const handleClear = useCallback(() => {
    setActiveValues([]);
    onChange?.([]);
  }, []);

  const handleOnFocus = () => {
    onFocus?.();
    setIsFocused(true);
  };

  const handleOnBlur = () => {
    onBlur?.();
    setIsFocused(false);
  };

  if (withSort) {
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

  const mapOptions = options?.map(item => {
    const isActive = activeValues.includes(item.value);

    return (
      <Badge
        c={
          isActive
            ? undefined
            : `light-dark(${colorsMantine.black}, ${colorsMantine.white})`
        }
        color={
          isActive
            ? platformColor
            : `light-dark(${colorsMantine.white}, ${colorsMantine.dark6})`
        }
        key={`badge_${item.value}`}
        leftSection={
          item?.icon ? (
            <IconSeo color={colorsMantine.primary} {...item.icon} />
          ) : undefined
        }
        onClick={() => handleClick(item.value)}
        p="sm"
        style={{
          border: `1px solid ${isActive ? colorsMantine.primary : `light-dark(${colorsMantine.dark2}, ${colorsMantine.dark3})`}`,
          cursor: disabled ? "no-drop" : "pointer",
        }}
        w={{
          base: "100%",
          xs: "auto",
        }}
        {...badgeProps}
      >
        {item.label}
      </Badge>
    );
  });

  return (
    <Box
      w={w}
      {...restProps}
      onBlur={handleOnBlur}
      onFocus={handleOnFocus}
      opacity={disabled && disabledWithOpacity ? 0.5 : 1}
      tabIndex={0}
    >
      <label>
        <Text fw="bold" size="md">
          {selectLabel}
          {required && (
            <span
              style={{
                color: colorsMantine.error,
                paddingLeft: 4,
              }}
            >
              *
            </span>
          )}
        </Text>
        <Text
          size="md"
          style={{
            color: colorsMantine.dimmed,
            marginBottom: 2,
          }}
        >
          {selectDescription}
        </Text>
        <Box
          bg={
            variant === "default"
              ? `light-dark(${colorsMantine.white}, ${colorsMantine.dark6})`
              : `light-dark(${colorsMantine.gray1}, ${colorsMantine.dark5})`
          }
          p={gap}
          pos="relative"
          pr={clearable ? 42 : gap}
          style={{
            border: `2px solid ${(() => {
              if (isFocused) {
                return colorsMantine.primary;
              }
              if (errorValue) {
                return colorsMantine.error;
              }
              if (variant === "default") {
                return `light-dark(${colorsMantine.gray4}, ${colorsMantine.dark4})`;
              }
              return `light-dark(${colorsMantine.gray1}, ${colorsMantine.dark5})`;
            })()} `,
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <Flex align="flex-start" gap={gap} justify="flex-start" wrap="wrap">
            {mapOptions}
          </Flex>
          {clearable && (
            <Button
              ariaLabel={tSeo("imagesAlt.clear")}
              bg={`light-dark(${colorsMantine.gray0}, ${colorsMantine.dark6})`}
              bottom={0}
              component="div"
              h="100%"
              onClick={handleClear}
              p={0}
              pos="absolute"
              right={0}
              top={0}
              variant="light"
              w={42}
            >
              <IconSeo
                color={colorsMantine.gray6}
                icon={faXmark}
                size="sm"
                width={42}
              />
            </Button>
          )}
        </Box>
        {errorValue && (
          <Text c="red" pt={2} size="sm">
            {errorValue}
          </Text>
        )}
      </label>
    </Box>
  );
};

export default memo(SelectMultipleBadge);
