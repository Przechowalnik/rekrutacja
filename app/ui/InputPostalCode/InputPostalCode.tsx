/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BoxProps, MantineColor, MantineSize } from "@mantine/core";
import { Box, CloseButton, Input as MantineInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import type { ChangeEvent, ReactNode } from "react";
import { memo, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useActionData } from "react-router";

import { namespaces } from "~/constants/namespaces";
import type { T_FormNames } from "~/lib/zodFormValidator";
import type { T_ResponseOnFailure } from "~/models/response";
import { countSpaces } from "~/utilities/functions";

export type T_InputPostalCode = {
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
  min?: number;
  name?: T_FormNames;
  onChange?: (value: number | string) => void;
  placeholder?: string;
  required?: boolean;
  rightSection?: ReactNode;
  size?: MantineSize | (string & {}); // NOSONAR
  value?: number | string;
  variant?: "default" | "filled";
  withoutDescription?: boolean;
} & BoxProps;

const InputPostalCode = ({
  borderColor,
  clearable,
  component,
  defaultValue,
  description,
  disabled,
  disabledWithOpacity = false,
  error,
  form,
  id,
  label,
  leftSection,
  maw,
  name,
  onChange,
  placeholder,
  required = true,
  rightSection,
  size = "md",
  value,
  variant = "filled",
  withoutDescription = false,
  ...restProps
}: T_InputPostalCode) => {
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

  const handleClearInput = () => {
    if (inputReference.current) {
      inputReference.current.value = "";
    }
    if (form && name) {
      form.setFieldValue(name, "");
    }

    onChange?.("");
  };

  const handleOnChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
    let newValue = event.currentTarget.value;

    newValue = newValue.replaceAll(/[^\d-]/g, "");

    newValue = [...newValue]
      .filter((char, index) => char !== "-" || index === 2)
      .join("");

    if (newValue.indexOf("-") !== 2) {
      newValue = newValue.replaceAll("-", "");
    }

    if (newValue.includes("-")) {
      if (newValue.length > 6) {
        newValue = newValue.slice(0, 6);
      }
    } else if (newValue.length > 5) {
      newValue = newValue.slice(0, 5);
    }

    if (!newValue.includes("-") && newValue.length > 2) {
      newValue = newValue.slice(0, 2) + "-" + newValue.slice(2);
    }

    if (inputReference.current) {
      inputReference.current.value = newValue;
    }
    onChange?.(newValue);
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

  let inputRightSection: ReactNode = rightSection;
  if (disabled) {
    inputRightSection = undefined;
  } else if (clearable) {
    inputRightSection = (
      <CloseButton aria-label="Clear input" onClick={handleClearInput} />
    );
  }

  return (
    <Box maw={maw} w="100%">
      <MantineInput.Wrapper
        description={inputDescription}
        error={errorValue}
        label={inputLabel}
        maw={maw}
        opacity={opacity}
        required={required}
        size={size}
        style={{
          transitionDuration: "0.15s",
          transitionProperty: "height",
          transitionTimingFunction: "ease",
        }}
        w={restProps?.w ?? "100%"}
      >
        <MantineInput
          component={component}
          defaultValue={defaultValue}
          disabled={disabled}
          error={errorValue}
          id={id}
          leftSection={leftSection}
          maw={maw}
          maxLength={6}
          name={name}
          placeholder={
            placeholder ?? (required ? undefined : tCommon("inputs.optional"))
          }
          radius="md"
          ref={inputReference}
          required={required}
          rightSection={inputRightSection}
          rightSectionPointerEvents="painted"
          size={size}
          styles={{
            input: {
              borderColor,
            },
          }}
          type="text"
          value={value}
          variant={variant}
          w="100%"
          {...restProps}
          onChange={handleOnChangeInput}
        />
      </MantineInput.Wrapper>
    </Box>
  );
};

export default memo(InputPostalCode);
