import type { SwitchProps } from "@mantine/core";
import { Switch as MantineSwitch } from "@mantine/core";
import type { ChangeEvent } from "react";
import { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useActionData } from "react-router";

import { namespaces } from "~/constants/namespaces";
import type { T_FormNames } from "~/lib/zodFormValidator";
import type { T_ResponseOnFailure } from "~/models/response";
import { countSpaces } from "~/utilities/functions";

type T_Switch = {
  error?: string;
  name?: T_FormNames;
  onChange?: (value: ChangeEvent<HTMLInputElement>) => void;
  pointerEventsForTooltipOnDisabled?: boolean;
  required?: boolean;
  withoutDescription?: boolean;
} & SwitchProps;

const Switch = ({
  disabled,
  error,
  name,
  onChange,
  pointerEventsForTooltipOnDisabled,
  required = false,
  w = "100%",
  withoutDescription = false,
  ...properties
}: T_Switch) => {
  const [globalError, setGlobalError] = useState<string | undefined>();
  const actionData = useActionData<T_ResponseOnFailure>();

  const { t } = useTranslation(namespaces.notifications);
  const { t: tCommon } = useTranslation(namespaces.common);

  let inputDescription: null | React.ReactNode = null;

  if (!withoutDescription) {
    if (properties.description != null) {
      inputDescription = properties.description;
    } else if (name) {
      inputDescription = tCommon(`inputsDescription.${name}`);
    } else {
      inputDescription = "";
    }
  }

  const inputLabel =
    properties.label ?? (name ? tCommon(`inputs.${name}`) : "");
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

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    setGlobalError(undefined);
  };

  return (
    <MantineSwitch
      w={w}
      {...properties}
      description={inputDescription}
      disabled={disabled}
      error={errorValue}
      label={inputLabel}
      offLabel="OFF"
      onChange={handleOnChange}
      onLabel="ON"
      required={required}
      style={{
        ...(pointerEventsForTooltipOnDisabled && disabled
          ? { pointerEvents: "none" }
          : {}),
      }}
    />
  );
};

export default memo(Switch);
