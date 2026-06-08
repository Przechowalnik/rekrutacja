import { Box, Flex, Modal, Paper, Stack, Switch } from "@mantine/core";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { useCookieConsent } from "~/hooks/useCookieConsent";
import { Button } from "~/ui/Button";
import { Text } from "~/ui/Text";
import { Title } from "~/ui/Title";

export const CookieConsent = () => {
  const { t } = useTranslation(namespaces.common);
  const {
    analyticsConsent,
    closeSettings,
    hasDecision,
    isReady,
    isSettingsOpen,
    saveConsent,
  } = useCookieConsent();

  const [analyticsChecked, setAnalyticsChecked] = useState(analyticsConsent);

  useEffect(() => {
    if (isSettingsOpen) {
      setAnalyticsChecked(analyticsConsent);
    }
  }, [isSettingsOpen, analyticsConsent]);

  if (!isReady) {
    return null;
  }

  const showBanner = !hasDecision && !isSettingsOpen;

  return (
    <>
      {showBanner && (
        <Paper
          bottom={0}
          left={0}
          p={{ base: 16, sm: 24 }}
          pos="fixed"
          radius={0}
          right={0}
          shadow="md"
          style={{ zIndex: 2000 }}
          withBorder
        >
          <Flex
            align={{ base: "stretch", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap={16}
            justify="space-between"
            maw={1200}
            mx="auto"
          >
            <Box>
              <Title fw="bold" order={3} pb={4}>
                {t("cookieConsent.bannerTitle")}
              </Title>
              <Text c="dimmed" size="sm">
                {t("cookieConsent.bannerText")}
              </Text>
            </Box>
            <Flex direction={{ base: "column", sm: "row" }} gap={8} wrap="wrap">
              <Button
                onClick={() => saveConsent({ analytics: false })}
                variant="light"
              >
                {t("cookieConsent.rejectAll")}
              </Button>
              <Button onClick={() => saveConsent({ analytics: true })}>
                {t("cookieConsent.acceptAll")}
              </Button>
            </Flex>
          </Flex>
        </Paper>
      )}
      <Modal
        centered
        onClose={closeSettings}
        opened={isSettingsOpen}
        size="lg"
        title={t("cookieConsent.settingsTitle")}
        zIndex={2100}
      >
        <Stack gap={20}>
          <Box>
            <Switch
              checked
              description={t("cookieConsent.categoryNecessaryText")}
              disabled
              label={t("cookieConsent.categoryNecessaryTitle")}
            />
          </Box>
          <Box>
            <Switch
              checked={analyticsChecked}
              description={t("cookieConsent.categoryAnalyticsText")}
              label={t("cookieConsent.categoryAnalyticsTitle")}
              onChange={event =>
                setAnalyticsChecked(event.currentTarget.checked)
              }
            />
          </Box>
          <Flex direction={{ base: "column", sm: "row" }} gap={8}>
            <Button
              fullWidth
              onClick={() => saveConsent({ analytics: false })}
              variant="light"
            >
              {t("cookieConsent.rejectAll")}
            </Button>
            <Button
              fullWidth
              onClick={() => saveConsent({ analytics: analyticsChecked })}
            >
              {t("cookieConsent.save")}
            </Button>
            <Button fullWidth onClick={() => saveConsent({ analytics: true })}>
              {t("cookieConsent.acceptAll")}
            </Button>
          </Flex>
        </Stack>
      </Modal>
    </>
  );
};
