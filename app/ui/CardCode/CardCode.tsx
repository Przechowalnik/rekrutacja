import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { Card, Flex } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { useLayout } from "~/hooks/useLayout";
import { formatReferralCode } from "~/utilities/functions";

import { Button } from "../Button";
import { IconSeo } from "../IconSeo";
import { Text } from "../Text";
import { Tooltip } from "../Tooltip";

type T_CardCode = {
  code: string;
};

const CardCodeToMemoize = ({ code }: T_CardCode) => {
  const { t } = useTranslation(namespaces.common);
  const { t: tSeo } = useTranslation(namespaces.seo);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { platformColor } = useLayout();

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      notifications.show({
        color: "green",
        message: tNotifications(`successCopyCode.message`),
        title: tNotifications(`successCopyCode.title`),
      });
      return;
    } catch {
      notifications.show({
        color: "red",
        message: tNotifications(`somethingWentWrong.message`),
        title: tNotifications(`somethingWentWrong.title`),
      });
      return;
    }
  }, [code]);

  return (
    <Card bg={platformColor} p="sm" pr={0} w={300}>
      <Flex align="center" gap={8} justify="center">
        <Text
          c="white"
          center
          fw="bold"
          style={{
            letterSpacing: "2px",
          }}
        >
          {formatReferralCode(code)}
        </Text>
        <Tooltip label={t("cardCode.copy")} visibleFrom="xs" w={64}>
          <Button
            ariaLabel={tSeo("imagesAlt.cardCode.button")}
            onClick={handleCopyCode}
            variant="light"
            w={64}
          >
            <IconSeo color={colorsMantine.whiteText} icon={faCopy} />
          </Button>
        </Tooltip>
      </Flex>
    </Card>
  );
};

export const CardCode = memo(CardCodeToMemoize);
