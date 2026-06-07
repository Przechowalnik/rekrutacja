import type { PinInputProps } from "@mantine/core";
import { Center, PinInput } from "@mantine/core";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { useLayout } from "~/hooks/useLayout";
import type { T_FormNames } from "~/lib/zodFormValidator";

import { Text } from "../Text";

type T_InputCode = {
  name: T_FormNames;
} & PinInputProps;

const InputCode = ({ name, ...restProps }: T_InputCode) => {
  const { t: tCommon } = useTranslation(namespaces.common);
  const { isMobile } = useLayout();

  const inputLabel = tCommon(`inputs.${name}`);
  const inputDescription = tCommon(`inputsDescription.${name}`);

  return (
    <Center>
      <label>
        <Text
          fw="bold"
          size="md"
          style={{
            marginBottom: 4,
          }}
        >
          {inputLabel}
          <span
            style={{
              color: colorsMantine.error,
              paddingLeft: 4,
            }}
          >
            *
          </span>
        </Text>
        <Text
          size="md"
          style={{
            color: colorsMantine.dimmed,
            marginBottom: 3,
          }}
        >
          {inputDescription}
        </Text>
        {!isMobile && (
          <PinInput
            {...restProps}
            inputMode="numeric"
            inputType="number"
            length={6}
            name={name}
            placeholder="●"
            size="md"
            type={/^\d*$/}
            variant="filled"
            visibleFrom="xs"
          />
        )}
        {isMobile && (
          <PinInput
            {...restProps}
            hiddenFrom="xs"
            inputMode="numeric"
            inputType="number"
            length={6}
            name={name}
            placeholder="●"
            size="sm"
            type={/^\d*$/}
            variant="filled"
          />
        )}
      </label>
    </Center>
  );
};

export default memo(InputCode);
