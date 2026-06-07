import type { BoxProps, MantineSize } from "@mantine/core";
import { Box, Flex, Textarea as MantineTextarea } from "@mantine/core";
import type { ChangeEvent, ReactNode } from "react";
import { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useActionData } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { globalIds } from "~/constants/styles";
import { type T_FormNames } from "~/lib/zodFormValidator";
import type { T_ResponseOnFailure } from "~/models/response";
import { Text } from "~/ui/Text";
import { countSpaces } from "~/utilities/functions";

type T_Textarea = {
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  error?: string;
  id?: string;
  label?: ReactNode;
  maxLength: null | number;
  minRows?: number;
  name: T_FormNames;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  size?: MantineSize | (string & {}); // NOSONAR
  value?: string;
  variant?: "default" | "filled";
  withoutDescription?: boolean;
} & BoxProps;

const Textarea = ({
  defaultValue,
  description,
  disabled,
  disabledWithOpacity = false,
  error,
  id,
  label,
  maxLength,
  minRows = 4,
  name,
  onChange,
  placeholder,
  required = true,
  size = "md",
  value,
  variant = "filled",
  withoutDescription = false,
  ...restProps
}: T_Textarea) => {
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
  }, [actionData, name]);

  useEffect(() => {
    if (defaultValue && maxLength) {
      const textElement = document.querySelector(
        `#${globalIds.textareaCounter}_${name}`,
      );
      if (textElement) {
        textElement.textContent = (defaultValue ?? "").length.toString();
      }
    }
  }, [defaultValue]);

  const handleOnChangeTextarea = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (maxLength) {
      const textElement = document.querySelector(
        `#${globalIds.textareaCounter}_${name}`,
      );
      if (textElement) {
        textElement.textContent = (
          event.currentTarget.value ?? ""
        ).length.toString();
      }
    }

    onChange?.(event.currentTarget.value.toString());
    setGlobalError(undefined);
  };

  return (
    <Box w="100%">
      <MantineTextarea
        {...restProps}
        autosize
        defaultValue={defaultValue}
        description={inputDescription}
        disabled={disabled}
        error={errorValue}
        id={id}
        label={inputLabel}
        minRows={minRows}
        name={name}
        onChange={handleOnChangeTextarea}
        opacity={disabled && disabledWithOpacity ? 0.3 : 1}
        placeholder={
          placeholder ?? (required ? undefined : tCommon("inputs.optional"))
        }
        required={required}
        size={size}
        style={{
          cursor: "default",
        }}
        value={value}
        variant={variant}
        w="100%"
      />
      {maxLength && (
        <Flex align="center" gap={4} justify="flex-end" w="100%">
          <Text c="gray" id={`${globalIds.textareaCounter}_${name}`} size="sm">
            0
          </Text>
          <Text c="gray" size="sm">{`/ ${maxLength ?? 0}`}</Text>
        </Flex>
      )}
    </Box>
  );
};

export default memo(Textarea);
