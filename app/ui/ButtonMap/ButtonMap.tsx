import { Box, Flex } from "@mantine/core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";

import { Text } from "../Text";
import { getTileUrl } from "./utilities";

type T_ButtonMap = {
  location?: {
    lat: number;
    lng: number;
  } | null;
  onClick?: () => void;
  zoom?: number;
};

export const ButtonMap = ({ location, onClick, zoom = 12 }: T_ButtonMap) => {
  const { t } = useTranslation(namespaces.common);

  const tileUrl = useMemo(() => {
    if (!location) {
      return "";
    }

    return getTileUrl(location.lat, location.lng, zoom);
  }, [location, zoom]);

  return (
    <Box
      onClick={onClick}
      style={{
        borderRadius: "var(--mantine-radius-md)",
        cursor: "pointer",
        overflow: "hidden",
        position: "relative",
      }}
      w="100%"
    >
      <Box
        h={200}
        style={{
          backgroundImage: `url(${tileUrl})`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          filter: "grayscale(1) opacity(0.4)",
        }}
        w="100%"
      />
      <Flex
        align="center"
        bg={colorsMantine.blackOpacity6}
        direction="column"
        gap={8}
        justify="center"
        style={{
          bottom: 0,
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
        }}
      >
        <Text c={colorsMantine.white} fw="bold" size="xl">
          {t("buttonMap.label")}
        </Text>
      </Flex>
    </Box>
  );
};
