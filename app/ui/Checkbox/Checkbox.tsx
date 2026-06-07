import type { BoxProps, MantineSize } from "@mantine/core";
import { Box, Checkbox as MantineCheckbox, Flex } from "@mantine/core";
import type { ChangeEvent, ReactNode } from "react";
import { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useActionData } from "react-router";

import { namespaces } from "~/constants/namespaces";
import type { T_FormNames } from "~/lib/zodFormValidator";
import type { T_ResponseOnFailure } from "~/models/response";
import { countSpaces } from "~/utilities/functions";

import { Text } from "../Text";

type T_Checkbox = {
  checked?: boolean;
  defaultChecked?: boolean;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  error?: string;
  label?: ReactNode;
  name: T_FormNames;
  onChange?: (value: boolean) => void;
  pointerEventsForTooltipOnDisabled?: boolean;
  required?: boolean;
  size?: MantineSize | (string & {}); // NOSONAR
  withAsterisk?: boolean;
  withoutDescription?: boolean;
} & BoxProps;

const CheckboxToMemoize = ({
  checked,
  defaultChecked,
  description,
  disabled,
  disabledWithOpacity = false,
  error,
  label,
  name,
  onChange,
  pointerEventsForTooltipOnDisabled,
  required = true,
  size = "md",
  withAsterisk,
  withoutDescription = false,
  ...restProps
}: T_Checkbox) => {
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

  const opacity = (() => {
    if (!disabled) {
      return 1;
    }
    if (disabledWithOpacity) {
      return 0.3;
    }
    return 1;
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

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.currentTarget.checked);
    setGlobalError(undefined);
  };

  return (
    <MantineCheckbox
      {...restProps}
      checked={checked}
      defaultChecked={defaultChecked}
      description={inputDescription}
      disabled={disabled}
      error={errorValue}
      label={
        required || withAsterisk ? (
          <Flex>
            <Text c="red" fw="bold" pr={4} size={size}>
              {tCommon("checkbox.required")}
            </Text>
            <Box>{inputLabel}</Box>
          </Flex>
        ) : (
          inputLabel
        )
      }
      name={name}
      onChange={handleOnChange}
      opacity={opacity}
      required={required}
      size={size}
      style={{
        ...(pointerEventsForTooltipOnDisabled && disabled
          ? { pointerEvents: "none" }
          : {}),
        cursor: "default",
      }}
      w="100%"
    />
  );
};

export const Checkbox = memo(CheckboxToMemoize);
