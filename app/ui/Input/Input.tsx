/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import type { BoxProps, MantineColor, MantineSize } from "@mantine/core";
import {
  Box,
  CloseButton,
  Flex,
  NumberInput as MantineNumberInput,
  PasswordInput as MantinePasswordInput,
  TextInput as MantineInput,
} from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import type {
  ChangeEvent,
  HTMLInputAutoCompleteAttribute,
  HTMLInputTypeAttribute,
  ReactNode,
  SyntheticEvent,
} from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useActionData } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { globalIds } from "~/constants/styles";
import type { T_FormNames } from "~/lib/zodFormValidator";
import type { T_ResponseOnFailure } from "~/models/response";
import { countSpaces } from "~/utilities/functions";

import { IconSeo } from "../IconSeo";
import { Text } from "../Text";

export type T_Input = {
  allowNegative?: boolean;
  autoComplete?: HTMLInputAutoCompleteAttribute;
  borderColor?: MantineColor;
  clearable?: boolean;
  component?: any;
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  error?: string;
  form?: UseFormReturnType<any>;
  id?: string;
  label?: string;
  leftSection?: ReactNode;
  max?: number;
  maxLength?: number;
  min?: number;
  name?: T_FormNames;
  onChange?: (value: number | string) => void;
  onInput?: (event: SyntheticEvent) => void;
  placeholder?: string;
  required?: boolean;
  rightSection?: ReactNode;
  size?: MantineSize | (string & {}); // NOSONAR
  type?: HTMLInputTypeAttribute;
  value?: number | string;
  variant?: "default" | "filled";
  withNumberSeparator?: boolean;
  withoutDescription?: boolean;
} & BoxProps;

const InputToMemoize = ({
  allowNegative = false,
  autoComplete,
  borderColor,
  clearable,
  component,
  description,
  disabled,
  disabledWithOpacity = false,
  error,
  form,
  id,
  label,
  leftSection,
  maw,
  max,
  maxLength,
  min,
  name,
  onChange,
  placeholder,
  required = true,
  rightSection,
  size = "md",
  type = "text",
  value,
  variant = "filled",
  withNumberSeparator = true,
  withoutDescription = false,
  ...restProps
}: T_Input) => {
  const [globalError, setGlobalError] = useState<string | undefined>();
  const actionData = useActionData<T_ResponseOnFailure>();
  const inputReference = useRef<HTMLInputElement>(null);
  const { t } = useTranslation(namespaces.notifications);
  const { t: tCommon } = useTranslation(namespaces.common);

  const defaultDescription = name ? tCommon(`inputsDescription.${name}`) : "";
  const inputDescription = withoutDescription
    ? null
    : (description ?? defaultDescription);

  const defaultLabel = name ? tCommon(`inputs.${name}`) : "";
  const inputLabel = typeof label === "string" ? label : defaultLabel;

  const errorValue: string | undefined = (() => {
    if (globalError) {
      // @ts-ignore
      return t(`${globalError}.message`);
    }
    if (error) {
      if (countSpaces(error) > 0) {
        return error;
      }
      return tCommon(`formValidator.${error}` as any);
    }
    return;
  })();

  useEffect(() => {
    if (actionData?.formErrors && Array.isArray(actionData.formErrors)) {
      const findFieldInFormErrors = actionData.formErrors.find(
        item => item?.field === name,
      );
      if (findFieldInFormErrors) {
        setGlobalError(findFieldInFormErrors?.message);
        return;
      }
    }

    setGlobalError(undefined);
  }, [actionData]);

  useEffect(() => {
    if (restProps.defaultValue && maxLength) {
      const textElement = document.querySelector(
        `#${globalIds.inputCounter}_${name}`,
      );
      if (textElement) {
        textElement.textContent = (
          restProps.defaultValue ?? ""
        ).length.toString();
      }
    }
  }, [restProps.defaultValue]);

  const handleClearInput = () => {
    if (inputReference.current) {
      inputReference.current.value = "";
    }
    if (form && name) {
      form.setFieldValue(name, "");
    }

    if (maxLength) {
      const textElement = document.querySelector(
        `#${globalIds.inputCounter}_${name}`,
      );
      if (textElement) {
        textElement.textContent = `0`;
      }
    }

    onChange?.("");
  };

  const handleOnChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
    if (maxLength) {
      const textElement = document.querySelector(
        `#${globalIds.inputCounter}_${name}`,
      );
      if (textElement) {
        textElement.textContent = (
          event.currentTarget.value ?? ""
        ).length.toString();
      }
    }

    onChange?.(event.currentTarget.value ?? "");
    setGlobalError(undefined);
  };

  const handleOnChangeNumberInput = (value: number | string) => {
    onChange?.(value ?? "");
    setGlobalError(undefined);
  };

  const handleNumberInput = (event: SyntheticEvent) => {
    if (max) {
      const target = event.currentTarget as HTMLInputElement;
      target.value = target.value
        .replaceAll(/\D/g, "")
        .slice(0, max.toString().length);
    }
  };

  const visibilityIcon = useCallback(
    ({ reveal }: { reveal: boolean }) => (
      <IconSeo icon={reveal ? faEye : faEyeSlash} size="md" />
    ),
    [],
  );

  const inputOpacity = (() => {
    if (!disabled) {
      return 1;
    }
    if (disabledWithOpacity) {
      return 0.3;
    }
    return 1;
  })();

  if (type === "number" || type === "tel") {
    return (
      <MantineNumberInput
        {...restProps}
        allowNegative={allowNegative}
        autoComplete={autoComplete}
        component={component}
        description={inputDescription}
        disabled={disabled}
        error={errorValue}
        hideControls
        id={id}
        label={inputLabel}
        leftSection={leftSection}
        max={max}
        min={min}
        name={name}
        onChange={handleOnChangeNumberInput}
        onInput={handleNumberInput}
        opacity={inputOpacity}
        placeholder={
          placeholder ?? (required ? undefined : tCommon("inputs.optional"))
        }
        radius="md"
        ref={inputReference}
        required={required}
        rightSectionPointerEvents="painted"
        size={size}
        style={{
          transitionDuration: "0.15s",
          transitionProperty: "height",
          transitionTimingFunction: "ease",
        }}
        thousandSeparator={withNumberSeparator ? " " : undefined}
        thousandsGroupStyle={withNumberSeparator ? "thousand" : undefined}
        type={type === "tel" ? "tel" : undefined}
        value={value}
        variant={variant}
        w={restProps?.w ?? "100%"}
        withKeyboardEvents={false}
      />
    );
  }

  const inputRightSection = (() => {
    if (disabled) {
      return;
    }

    if (clearable) {
      return (
        <CloseButton aria-label="Clear input" onClick={handleClearInput} />
      );
    }
    return rightSection;
  })();

  if (type === "password") {
    return (
      <MantinePasswordInput
        autoComplete={autoComplete}
        component={component}
        description={inputDescription}
        disabled={disabled}
        error={errorValue}
        id={id}
        label={inputLabel}
        leftSection={leftSection}
        maw={maw}
        max={max}
        name={name}
        onChange={handleOnChangeInput}
        opacity={inputOpacity}
        placeholder={
          placeholder ?? (required ? undefined : tCommon("inputs.optional"))
        }
        radius="md"
        ref={inputReference}
        required={required}
        size={size}
        style={{
          transitionDuration: "0.15s",
          transitionProperty: "height",
          transitionTimingFunction: "ease",
        }}
        styles={{
          input: {
            borderColor,
          },
        }}
        type={type}
        value={value}
        variant={variant}
        visibilityToggleIcon={visibilityIcon}
        w={restProps?.w ?? "100%"}
        {...restProps}
      />
    );
  }

  return (
    <Box w={restProps?.w ?? "100%"}>
      <MantineInput
        autoComplete={autoComplete}
        component={component}
        description={inputDescription}
        disabled={disabled}
        error={errorValue}
        id={id}
        label={inputLabel}
        leftSection={leftSection}
        maw={maw}
        max={max}
        name={name}
        onChange={handleOnChangeInput}
        opacity={inputOpacity}
        placeholder={
          placeholder ?? (required ? undefined : tCommon("inputs.optional"))
        }
        radius="md"
        ref={inputReference}
        required={required}
        rightSection={inputRightSection}
        rightSectionPointerEvents="painted"
        size={size}
        style={{
          transitionDuration: "0.15s",
          transitionProperty: "height",
          transitionTimingFunction: "ease",
        }}
        styles={{
          input: {
            borderColor,
          },
        }}
        type={type}
        value={value}
        variant={variant}
        w="100%"
        {...restProps}
      />
      {maxLength && (
        <Flex align="center" gap={4} justify="flex-end" w="100%">
          <Text c="gray" id={`${globalIds.inputCounter}_${name}`} size="sm">
            0
          </Text>
          <Text c="gray" size="sm">{`/ ${maxLength ?? 0}`}</Text>
        </Flex>
      )}
    </Box>
  );
};

export const Input = memo(InputToMemoize);
