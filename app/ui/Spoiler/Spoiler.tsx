import { faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { Box, Divider, Flex } from "@mantine/core";
import type { PropsWithChildren } from "react";
import { memo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { globalIds } from "~/constants/styles";
import { useLayout } from "~/hooks/useLayout";

import { Button } from "../Button";
import { Collapse } from "../Collapse";
import { IconSeo } from "../IconSeo";

const Spoiler = ({ children }: PropsWithChildren) => {
  const [expanded, setExpanded] = useState(false);

  const { t } = useTranslation(namespaces.common);
  const { platformColor } = useLayout();

  const handleToggleExpanded = useCallback(() => {
    setExpanded(previousState => !previousState);
  }, []);

  return (
    <>
      <div id={globalIds.dnd}>
        <Collapse opened={expanded}>
          <Box
            bd={`2px solid ${colorsMantine.gray}`}
            bg={`light-dark(${colorsMantine.gray1}, ${colorsMantine.dark6})`}
            pb={30}
            style={{
              borderBottom: 0,
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "8px",
            }}
          >
            {children}
          </Box>
        </Collapse>
      </div>
      <Box
        pos="relative"
        style={{
          transform: expanded ? "translateY(-20px)" : "translateY(0px)",
          transition: "transform 0.3s ease-out",
        }}
      >
        <Flex align="center" justify="center" pos="relative">
          <Button
            color={platformColor}
            component="div"
            onClick={handleToggleExpanded}
            rightSection={
              <IconSeo
                icon={faChevronUp}
                rotation={expanded ? undefined : 180}
                size="lg"
              />
            }
            size="sm"
            style={{
              zIndex: 1,
            }}
            variant="filled"
          >
            {expanded ? t("spoiler.hide") : t("spoiler.show")}
          </Button>
          <Box
            bottom="16px"
            left={0}
            pos="absolute"
            right={0}
            style={{
              zIndex: 0,
            }}
          >
            <Divider
              color="gray"
              mb={0}
              onClick={handleToggleExpanded}
              radioGroup="m"
              size={2}
              w="100%"
            />
          </Box>
        </Flex>
      </Box>
    </>
  );
};

export default memo(Spoiler);
