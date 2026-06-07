import { faChevronUp } from "@fortawesome/free-solid-svg-icons";
import type { MantineSize } from "@mantine/core";
import { Box, Button, Flex } from "@mantine/core";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { Collapse } from "~/ui/Collapse";
import { Text } from "~/ui/Text";

import { IconSeo } from "../IconSeo";
import { generateMinHeightFromSize } from "./utilities";

type T_TextShowMore = {
  size?: MantineSize;
  text?: string;
  withDelay?: boolean;
};

const TextShowMore = ({
  size = "sm",
  text,
  withDelay = false,
}: T_TextShowMore) => {
  const [isReady, setIsReady] = useState(false);
  const [isShowMore, setIsShowMore] = useState(true);
  const [isShowLineClamp, setIsShowLineClamp] = useState(false);
  const [maxHeight, setMaxHeight] = useState<null | number>(null);

  const reference = useRef<HTMLDivElement | null>(null);
  const referenceTimerIsShowLineClap = useRef<null | ReturnType<
    typeof setTimeout
  >>(null);
  const referenceTimerSetMaxHeight = useRef<null | ReturnType<
    typeof setTimeout
  >>(null);

  const { t } = useTranslation(namespaces.common);
  const generatedMinHeight = generateMinHeightFromSize({ size });

  const handleSetMaxHeight = useCallback(() => {
    if (reference?.current) {
      setMaxHeight(reference?.current?.clientHeight);
      setIsShowMore(false);
      setIsReady(true);
    }
  }, [withDelay, isReady]);

  const handleMaxHeight = useCallback(() => {
    if (reference?.current) {
      if (withDelay) {
        referenceTimerSetMaxHeight.current = setTimeout(() => {
          if (reference?.current) {
            handleSetMaxHeight();
          }
        }, 300);
      } else {
        handleSetMaxHeight();
      }
    }
  }, [withDelay, isReady]);

  useEffect(() => {
    if (!reference?.current) {
      return;
    }

    handleMaxHeight();

    return () => {
      if (referenceTimerIsShowLineClap.current) {
        clearTimeout(referenceTimerIsShowLineClap.current);
      }
      if (referenceTimerSetMaxHeight.current) {
        clearTimeout(referenceTimerSetMaxHeight.current);
      }
    };
  }, [withDelay]);

  useEffect(() => {
    if (isShowMore) {
      setIsShowLineClamp(true);
    } else {
      referenceTimerIsShowLineClap.current = setTimeout(() => {
        setIsShowLineClamp(false);
      }, 110);

      return () => {
        if (referenceTimerIsShowLineClap.current) {
          clearTimeout(referenceTimerIsShowLineClap.current);
        }
      };
    }
  }, [isShowMore]);

  const handleOnShowMore = useCallback(() => {
    setIsShowMore(previousState => !previousState);
  }, []);

  return (
    <Flex
      align="flex-end"
      direction="column"
      justify="flex-start"
      pt={24}
      w="100%"
    >
      <Box
        h={maxHeight ? "auto" : `${generatedMinHeight}px`}
        style={{
          overflow: "hidden",
        }}
        w="100%"
      >
        <Box ref={reference} w="100%">
          <Box
            pos="relative"
            style={{
              height: (() => {
                if (!isShowMore) {
                  return `${generatedMinHeight}px`;
                }
                if (maxHeight) {
                  return `${maxHeight}px`;
                }
                return "auto";
              })(),
              overflow: "hidden",
              transition: "height 0.1s ease",
            }}
            w="100%"
          >
            <Text
              lineClamp={(() => {
                if (!maxHeight) {
                  return;
                }
                if (isShowLineClamp) {
                  return;
                }
                return 4;
              })()}
              opacity={maxHeight ? 1 : 0}
              size={size}
              w="100%"
            >
              {text}
            </Text>
            <Text
              left={0}
              lineClamp={4}
              opacity={maxHeight ? 0 : 1}
              pos="absolute"
              right={0}
              size={size}
              top={0}
            >
              {text}
            </Text>
          </Box>
        </Box>
      </Box>
      <Collapse
        opened={
          typeof maxHeight === "number" && maxHeight >= generatedMinHeight
        }
      >
        <Box pt={4}>
          <Button
            onClick={handleOnShowMore}
            rightSection={
              <IconSeo
                icon={faChevronUp}
                rotation={isShowMore ? undefined : 180}
                size="lg"
              />
            }
            size="xs"
            variant="subtle"
            w="auto"
          >
            {isShowMore
              ? t("textShowMore.buttonShowLess")
              : t("textShowMore.buttonShowMore")}
          </Button>
        </Box>
      </Collapse>
    </Flex>
  );
};

export default memo(TextShowMore);
