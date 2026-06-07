import { faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { Box, BoxProps, Flex, MantineSize } from "@mantine/core";
import cx from "clsx";
import {
  memo,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from "react";

import { colorsMantine } from "~/constants/colorsMantine";
import { useLayout } from "~/hooks/useLayout";
import { T_TextComponent, Text } from "~/ui/Text";

import { Collapse } from "../Collapse";
import { IconSeo } from "../IconSeo";

type T_Bar = {
  component?: T_TextComponent;
  defaultOpened?: boolean;
  label: string;
  onClick?: () => void;
  opened?: boolean;
  size?: MantineSize | (string & {}); // NOSONAR
  textCenter?: boolean;
  withBarMargin?: boolean;
  withCollapse?: boolean;
} & BoxProps;

const BarToMemoize = ({
  c = "white",
  children,
  className,
  component = "p",
  defaultOpened = true,
  label,
  onClick,
  opened,
  size = "lg",
  textCenter,
  withBarMargin = false,
  withCollapse = true,
  ...restProps
}: PropsWithChildren<T_Bar>) => {
  const [collapseOpened, setCollapseOpened] = useState(defaultOpened);

  const { platformColor } = useLayout();

  useEffect(() => {
    if (typeof opened === "boolean") {
      setCollapseOpened(opened);
    }
  }, [opened]);

  const handleClickBar = useCallback(() => {
    if (typeof opened !== "boolean") {
      setCollapseOpened(previousState => !previousState);
    }
    onClick?.();
  }, []);

  return (
    <>
      <Box
        bg={platformColor}
        className={cx(className)}
        ml={withBarMargin ? 24 : undefined}
        mr={withBarMargin ? 24 : undefined}
        onClick={withCollapse ? handleClickBar : undefined}
        pl={textCenter ? 50 : undefined}
        pos="relative"
        pr={children ? 50 : undefined}
        px={24}
        py={12}
        style={{
          ...(children
            ? {
                borderRadius: "8px",
                cursor: "pointer",
              }
            : {
                borderRadius: "8px",
              }),
        }}
        {...restProps}
      >
        <Text
          c={c}
          center={textCenter}
          component={component}
          fw="bold"
          size={size}
          style={{
            userSelect: "none",
          }}
        >
          {label}
        </Text>
        {children && withCollapse && (
          <Flex
            align="center"
            bottom={0}
            justify="center"
            pos="absolute"
            right={0}
            style={{
              transform: collapseOpened ? undefined : "rotate(180deg)",
              transition: "transform 0.3s ease",
            }}
            top={0}
            w={50}
          >
            <IconSeo
              color={typeof c === "string" ? c : colorsMantine.white}
              icon={faChevronUp}
              size="lg"
            />
          </Flex>
        )}
      </Box>
      {children && (
        <Collapse opened={collapseOpened || !withCollapse}>{children}</Collapse>
      )}
    </>
  );
};

export const Bar = memo(BarToMemoize);
