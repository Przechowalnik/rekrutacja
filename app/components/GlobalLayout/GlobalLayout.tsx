import { Box, Flex } from "@mantine/core";
import { type PropsWithChildren, useEffect, useRef } from "react";
import { useLocation } from "react-router";

import { colorsMantine } from "~/constants/colorsMantine";
import { globalClasses } from "~/constants/styles";
import { dynamic } from "~/hoc/dynamic";
import { useLayout } from "~/hooks/useLayout";
import { enableBodyScroll } from "~/utilities/functions";

import { BottomMenu } from "./BottomMenu";
import { Footer } from "./Footer";
import { GlobalLoader } from "./GlobalLoader";
import { Navigation } from "./Navigation";

const GlobalModals = dynamic(() =>
  import("~/components/GlobalLayout/GlobalModals").then(module => ({
    default: module.GlobalModals,
  })),
);

const GlobalGeneratedModal = dynamic(() =>
  import("~/components/GlobalLayout/GlobalGeneratedModal").then(module => ({
    default: module.GlobalGeneratedModal,
  })),
);

const GlobalRoutesAlerts = dynamic(() =>
  import("~/components/GlobalLayout/GlobalRoutesAlerts").then(module => ({
    default: module.GlobalRoutesAlerts,
  })),
);

const Confetti = dynamic(() =>
  import("~/components/GlobalLayout/Confetti").then(module => ({
    default: module.Confetti,
  })),
);

const BypassBlocks = dynamic(() =>
  import("~/components/GlobalLayout/BypassBlocks").then(module => ({
    default: module.BypassBlocks,
  })),
);

export const GlobalLayout = ({ children }: PropsWithChildren) => {
  const reference = useRef<HTMLDivElement>(null);
  const mainReference = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { isDesktop, isIOS, isMobile, isTablet } = useLayout();

  useEffect(() => {
    enableBodyScroll();
    if (reference.current) {
      reference.current.setAttribute("tabIndex", "-1");
      reference.current.focus();
      reference.current.removeAttribute("tabIndex");
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!mainReference.current || !isIOS) {
      return;
    }

    mainReference.current.style.maxWidth = `${mainReference.current.clientWidth}px`;
  }, [isIOS, isDesktop, isMobile, isTablet]);

  return (
    <>
      <Confetti />
      <Box
        bg={colorsMantine.background}
        className={globalClasses.flexGrow1}
        h="100%"
        ref={reference}
        w="100%"
      >
        <BypassBlocks />
        <Navigation />
        <Flex
          // ref={mainReference}
          className={globalClasses.flexGrow1}
          component="main"
          direction="column"
          mih="100%"
          pt={90}
        >
          {children}
        </Flex>
        <BottomMenu />
        <Footer />
      </Box>
      <GlobalLoader />
      <GlobalRoutesAlerts />
      <GlobalModals />
      <GlobalGeneratedModal />
    </>
  );
};
