import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { Box, BoxProps, Flex } from "@mantine/core";
import cx from "clsx";
import type { MouseEvent } from "react";
import {
  memo,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from "react";

import { colorsMantine } from "~/constants/colorsMantine";
import { globalClasses } from "~/constants/styles";

import { Collapse } from "../Collapse";
import { IconSeo } from "../IconSeo";
import { T_TextComponent, Text } from "../Text";

type T_AccordionCustom = {
  onClick?: () => void;
  open?: boolean;
  title: string;
  titleComponent?: T_TextComponent;
} & BoxProps;

const AccordionCustomToMemoize = ({
  children,
  onClick,
  open,
  title,
  titleComponent = "h2",
  ...restProps
}: PropsWithChildren<T_AccordionCustom>) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof open !== "boolean") {
      return;
    }

    setIsOpen(open);
  }, [open]);

  const handleToggle = () => {
    onClick?.();
    if (typeof open === "boolean") {
      return;
    }

    setIsOpen(previousState => !previousState);
  };

  const handleResetClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  }, []);

  return (
    <Box
      className={cx(
        !isOpen && globalClasses.accordionCustom,
        isOpen && globalClasses.accordionCustomActive,
      )}
      w="100%"
      {...restProps}
    >
      <Flex
        align="center"
        gap={8}
        justify="space-between"
        onClick={handleToggle}
        pl={16}
        py={14}
        style={{
          cursor: "pointer",
        }}
        w="100%"
      >
        <Box w="calc(100% - 55px)">
          <Text
            c={
              isOpen
                ? `light-dark(${colorsMantine.primary}, ${colorsMantine.primary4})`
                : undefined
            }
            component={titleComponent}
            fw="bold"
            size="md"
            style={{
              userSelect: "none",
            }}
          >
            {title}
          </Text>
        </Box>
        <Flex align="center" justify="center" w="55px">
          <IconSeo
            color={colorsMantine.normalText}
            icon={faChevronDown}
            rotation={isOpen ? 180 : undefined}
            size="1x"
          />
        </Flex>
      </Flex>
      {children && (
        <Collapse fullWith opened={isOpen} transitionDuration={200}>
          <Box onClick={handleResetClick} pb={14} px={16} w="100%">
            {children}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

export const AccordionCustom = memo(AccordionCustomToMemoize);
