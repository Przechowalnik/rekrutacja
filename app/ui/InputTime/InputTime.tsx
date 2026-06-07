import { faClock } from "@fortawesome/free-regular-svg-icons";
import { ActionIcon, type BoxProps, type MantineSize } from "@mantine/core";
import { TimeInput as MantineInputTime } from "@mantine/dates";
import type { ChangeEvent, ReactNode } from "react";
import { memo, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useActionData } from "react-router";

import { namespaces } from "~/constants/namespaces";
import type { T_FormNames } from "~/lib/zodFormValidator";
import type { T_ResponseOnFailure } from "~/models/response";
import { countSpaces } from "~/utilities/functions";

import { IconSeo } from "../IconSeo";

type T_InputTime = {
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  error?: string;
  label?: ReactNode;
  maxTime?: string;
  minTime?: string;
  name: T_FormNames;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  size?: MantineSize | (string & {}); // NOSONAR
  value?: string;
  withoutDescription?: boolean;
} & BoxProps;

const InputTime = ({
  description,
  disabled,
  disabledWithOpacity = false,
  error,
  label,
  maxTime,
  minTime,
  name,
  onChange,
  placeholder,
  required = true,
  size = "md",
  value,
  withoutDescription = false,
  ...restProps
}: T_InputTime) => {
  const [globalError, setGlobalError] = useState<string | undefined>();

  const actionData = useActionData<T_ResponseOnFailure>();
  const { t } = useTranslation(namespaces.notifications);
  const { t: tCommon } = useTranslation(namespaces.common);
  const reference = useRef<HTMLInputElement>(null);

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

  const handleOnChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.currentTarget.value);
    setGlobalError(undefined);
  };

  const pickerControl = (
    <ActionIcon
      color="gray"
      onClick={() => reference.current?.showPicker()}
      variant="subtle"
    >
      <IconSeo icon={faClock} size="1x" />
    </ActionIcon>
  );

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
    <MantineInputTime
      {...restProps}
      description={inputDescription}
      disabled={disabled}
      error={errorValue}
      label={inputLabel}
      maxTime={maxTime}
      minTime={minTime}
      name={name}
      onChange={handleOnChangeInput}
      opacity={opacity}
      placeholder={
        placeholder ?? (required ? undefined : tCommon("inputs.optional"))
      }
      ref={reference}
      required={required}
      rightSection={pickerControl}
      size={size}
      style={{
        cursor: "default",
      }}
      value={value}
      variant="filled"
      w="100%"
    />
  );
};

export default memo(InputTime);
