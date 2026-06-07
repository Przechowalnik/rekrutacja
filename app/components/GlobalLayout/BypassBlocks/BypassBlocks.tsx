import { Box } from "@mantine/core";
import { memo, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { idKey } from "~/constants/queryAndHashes";
import { Button } from "~/ui/Button";

const BypassBlocksToMemoize = () => {
  const buttonReference = useRef<HTMLDivElement>(null);
  const clickedReference = useRef(false);
  const shownReference = useRef(false);
  const { pathname } = useLocation();

  const { t } = useTranslation(namespaces.common);

  useEffect(() => {
    clickedReference.current = false;
    shownReference.current = false;
  }, [pathname]);

  useEffect(() => {
    const handleClick = () => {
      clickedReference.current = true;
      if (shownReference.current && buttonReference.current) {
        shownReference.current = false;
        buttonReference.current.style.display = "none";
        if (buttonReference.current) {
          buttonReference.current.setAttribute("tabIndex", "-1");
          buttonReference.current.focus();
          buttonReference.current.removeAttribute("tabIndex");
        }
      }
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (
        event.key === "Tab" &&
        !clickedReference.current &&
        !shownReference.current &&
        buttonReference.current
      ) {
        shownReference.current = true;
        buttonReference.current.style.display = "inline-block";
      }
    };

    globalThis.addEventListener("click", handleClick);
    globalThis.addEventListener("keydown", handleKeydown);

    return () => {
      globalThis.removeEventListener("click", handleClick);
      globalThis.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  const handleClick = useCallback(() => {
    const sections = [
      ...document.querySelectorAll("section:not(#breadcrumbs)"),
    ];

    const focusableSelectors = [
      `a[href]:not([tabindex="-1"]):not(#${idKey.skipFocus})`,
      `a[href]:not([tabindex="-1"]):not(#${idKey.skipFocus})`,
      `button:not([disabled]):not([tabindex="-1"]):not(#${idKey.skipFocus})`,
      `input:not([disabled]):not([type="hidden"]):not([tabindex="-1"]):not(#${idKey.skipFocus})`,
      `select:not([disabled]):not([tabindex="-1"]):not(#${idKey.skipFocus})`,
      `textarea:not([disabled]):not([tabindex="-1"]):not(#${idKey.skipFocus})`,
      `[tabindex]:not([tabindex="-1"]):not(#${idKey.skipFocus})`,
    ].join(",");

    for (const section of sections) {
      const focusableElements = [
        ...section.querySelectorAll(focusableSelectors),
      ] as HTMLElement[];

      if (focusableElements.length > 0) {
        const firstFocusable = focusableElements[0];
        if (!firstFocusable) {
          break;
        }

        firstFocusable.setAttribute("tabIndex", "-1");
        firstFocusable.focus();
        firstFocusable.removeAttribute("tabIndex");
        break;
      }
    }
  }, []);

  const handleClose = useCallback(() => {
    clickedReference.current = true;
    if (shownReference.current && buttonReference.current) {
      shownReference.current = false;
      buttonReference.current.style.display = "none";
    }
  }, []);

  return (
    <Box
      display="none"
      left={8}
      pos="absolute"
      ref={buttonReference}
      style={{
        zIndex: 1001,
      }}
      top={8}
    >
      <Button
        onBlur={handleClose}
        onClick={handleClick}
        size="xl"
        variant="default"
      >
        {t("bypassBlocks.button")}
      </Button>
    </Box>
  );
};

export const BypassBlocks = memo(BypassBlocksToMemoize);
