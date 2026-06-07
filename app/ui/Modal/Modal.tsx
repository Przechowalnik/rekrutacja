import type { MantineSize } from "@mantine/core";
import { Box, Flex } from "@mantine/core";
import { FocusTrap } from "focus-trap-react";
import type { PropsWithChildren } from "react";
import { memo, useEffect, useRef, useState } from "react";

import { colorsMantine } from "~/constants/colorsMantine";
import { disableBodyScroll, enableBodyScroll } from "~/utilities/functions";

import { WrapperRemoveOnHidden } from "../WrapperRemoveOnHidden";

type T_Modal = {
  onClickOutside?: () => void;
  opened?: boolean;
  size?: MantineSize;
  withDisableScroll?: boolean;
  withFocusTrap?: boolean;
  withWindowSize?: boolean;
  zIndex?: 100 | 1020 | 2020 | 3020;
};

export const ModalWithoutClearup = ({
  children,
  onClickOutside,
  opened,
  size = "md",
  withDisableScroll = true,
  withFocusTrap = true,
  withWindowSize = true,
  zIndex = 1020,
}: PropsWithChildren<T_Modal>) => {
  const [isFocusTrapActive, setIsFocusTrapActive] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const referenceIsReady = useRef(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (modalOpened && withFocusTrap) {
      timer = setTimeout(() => setIsFocusTrapActive(true), 320);
    } else {
      setIsFocusTrapActive(false);
    }

    return () => clearTimeout(timer);
  }, [modalOpened, withFocusTrap]);

  useEffect(() => {
    setModalOpened(!!opened);

    if (!withDisableScroll) {
      return;
    }

    if (opened) {
      disableBodyScroll();
      referenceIsReady.current = true;
      return;
    }

    if (referenceIsReady.current) {
      enableBodyScroll();
    }
  }, [opened]);

  const content = withFocusTrap ? (
    <FocusTrap
      active={isFocusTrapActive && modalOpened && withFocusTrap}
      focusTrapOptions={{
        allowOutsideClick: true,
        escapeDeactivates: true,
      }}
    >
      <div>{children}</div>
    </FocusTrap>
  ) : (
    children
  );

  return (
    <Flex
      align="center"
      bg={`light-dark(${colorsMantine.blackOpacity5}, ${colorsMantine.blackOpacity7})`}
      bottom={0}
      justify="center"
      left={0}
      onClick={onClickOutside}
      pos="fixed"
      px={20}
      py={44}
      right={0}
      style={{
        opacity: modalOpened ? 1 : 0,
        transform: `translateX(${modalOpened ? "0" : "100%"})`,
        transition: "transform 0.3s ease, opacity 0.1s ease",
        zIndex,
      }}
      top={0}
    >
      {withWindowSize ? (
        <Box
          maw="100%"
          onClick={event => {
            event.stopPropagation();
          }}
          pos="relative"
          style={{
            borderRadius: "8px",
            overflow: "hidden",
          }}
          w={{ lg: 620, md: 440, sm: 380, xl: 780, xs: 320 }[size] ?? 320}
        >
          {content}
        </Box>
      ) : (
        <Flex
          align="center"
          justify="center"
          onClick={event => {
            event.stopPropagation();
          }}
          w="100%"
        >
          {content}
        </Flex>
      )}
    </Flex>
  );
};

const ModalWrapper = (properties: PropsWithChildren<T_Modal>) => {
  return (
    <WrapperRemoveOnHidden opened={properties.opened}>
      {({ visible }) => (
        <ModalWithoutClearup {...properties} opened={visible} />
      )}
    </WrapperRemoveOnHidden>
  );
};

export default memo(ModalWrapper);
