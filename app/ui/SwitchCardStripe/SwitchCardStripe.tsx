import { Divider, Flex } from "@mantine/core";
import type { ChangeEvent } from "react";
import { memo, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { useLayout } from "~/hooks/useLayout";
import { useUser } from "~/hooks/useUser";
import { formNames } from "~/lib/zodFormValidator";

import { CardStripe } from "../CardStripe";
import { Collapse } from "../Collapse";
import { Switch } from "../Switch";
import { Text } from "../Text";
import { Title } from "../Title";
import { Tooltip } from "../Tooltip";

type T_SwitchCardStripe = {
  checked: boolean;
  onChange: (value: boolean) => void;
};

const SwitchCardStripe = ({ checked, onChange }: T_SwitchCardStripe) => {
  const { t } = useTranslation(namespaces.common);
  const { platformColor } = useLayout();
  const { user } = useUser();

  const isDefaultChecked = !user?.company?.stripe?.customerHasCard;

  useEffect(() => {
    onChange(isDefaultChecked);
  }, []);

  const handleChangeSwitch = useCallback(
    (properties: ChangeEvent<HTMLInputElement>) => {
      onChange(isDefaultChecked ? true : properties.target.checked);
    },
    [user],
  );

  return (
    <>
      <Tooltip
        disabled={!isDefaultChecked}
        label={t("switchCardStripe.tooltip")}
      >
        <Switch
          checked={isDefaultChecked ? true : checked}
          disabled={isDefaultChecked}
          mt={24}
          name={formNames.checkboxSwitchCard}
          onChange={handleChangeSwitch}
          pointerEventsForTooltipOnDisabled
          size="md"
        />
      </Tooltip>
      <Collapse opened={checked}>
        <Title center order={2} pt={24}>
          {t("switchCardStripe.dataToCard")}
        </Title>
        <Flex align="center" direction="column" justify="center">
          {user?.company?.stripe?.costumerCardLast4Numbers && (
            <Text c="gray" center size="md" withTextsToUi>
              {t("switchCardStripe.cardInfo", {
                cardLast4Numbers:
                  user?.company?.stripe?.costumerCardLast4Numbers,
              })}
            </Text>
          )}
          <Divider
            color={platformColor}
            mb={0}
            mt={8}
            radioGroup="m"
            size={2}
            w="50px"
          />
          <CardStripe mt={24} />
        </Flex>
      </Collapse>
    </>
  );
};

export default memo(SwitchCardStripe);
