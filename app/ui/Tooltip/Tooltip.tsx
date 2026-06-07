import type { BoxProps, FloatingPosition } from "@mantine/core";
import { Box, Tooltip as MantineTooltip } from "@mantine/core";
import { memo, type PropsWithChildren, useCallback, useState } from "react";

import { useLayout } from "~/hooks/useLayout";
import { safeHtml } from "~/utilities/functions";

type T_Tooltip = {
  disabled?: boolean;
  fontWeightBold?: boolean;
  fullWidth?: boolean;
  label: string;
  openDelay?: number;
  opened?: boolean;
  position?: FloatingPosition;
  withCursorNotAllowed?: boolean;
  withTextDecoration?: boolean;
} & BoxProps;

const Tooltip = ({
  children,
  disabled,
  display = "inline",
  fontWeightBold = false,
  fullWidth,
  label,
  openDelay,
  opened,
  position = "bottom",
  w,
  withCursorNotAllowed = true,
  withTextDecoration = false,
  ...restProps
}: PropsWithChildren<T_Tooltip>) => {
  const [openedTooltip, setOpenedTooltip] = useState(false);

  const { isMobile } = useLayout();

  const handleDisableTooltip = useCallback(() => {
    setOpenedTooltip(false);
  }, []);

  const handleOnClick = useCallback(() => {
    if (disabled) {
      return;
    }
    setOpenedTooltip(previousState => !previousState);
  }, [disabled, isMobile]);

  const handleOnHover = useCallback(() => {
    if (isMobile || disabled) {
      return;
    }

    setOpenedTooltip(true);
  }, [isMobile, disabled]);

  return (
    <MantineTooltip
      arrowSize={10}
      disabled={disabled}
      display={display}
      events={
        isMobile
          ? { focus: false, hover: false, touch: false }
          : { focus: true, hover: true, touch: true }
      }
      label={
        <span
          dangerouslySetInnerHTML={{
            __html: safeHtml({ element: label }),
          }}
        />
      }
      multiline
      openDelay={openDelay}
      opened={(opened || openedTooltip) && !disabled}
      position={position}
      styles={{
        tooltip: {
          maxWidth: "500px",
          whiteSpace: "normal",
          wordWrap: "break-word",
        },
      }}
      transitionProps={{ duration: 200, transition: "pop" }}
      withArrow
      withinPortal
      zIndex={3000}
    >
      <Box
        component="span"
        h="auto"
        w={
          fullWidth
            ? "100%"
            : (w ?? {
                base: "100%",
                xs: "auto",
              })
        }
        {...restProps}
        display={display}
        fw={fontWeightBold ? "bold" : undefined}
        onBlur={handleDisableTooltip}
        onClick={handleOnClick}
        onMouseEnter={handleOnHover}
        onMouseLeave={handleDisableTooltip}
        onTouchCancel={handleDisableTooltip}
        style={{
          ...(withCursorNotAllowed && disabled
            ? { cursor: "not-allowed" }
            : {}),
          ...(withTextDecoration
            ? {
                display: "inline-block",
                textDecoration: "underline",
              }
            : { display: "inline-block" }),
          pointerEvents: "auto",
        }}
      >
        {children}
      </Box>
    </MantineTooltip>
  );
};

export default memo(Tooltip);
