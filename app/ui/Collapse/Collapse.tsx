import { Collapse as CollapseMantine } from "@mantine/core";
import type { PropsWithChildren } from "react";
import { memo, useEffect, useRef } from "react";

type T_Collapse = {
  fullWith?: boolean;
  opened: boolean;
  removeCustomComponents?: string;
  transitionDuration?: number;
};

const CollapseToMemoize = ({
  children,
  fullWith,
  opened,
  removeCustomComponents,
  transitionDuration = 300,
}: PropsWithChildren<T_Collapse>) => {
  const contentReference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = contentReference.current;
    if (!container) {
      return;
    }

    const selector =
      removeCustomComponents ||
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';

    const focusableElements = container.querySelectorAll<HTMLElement>(selector);

    for (const element of focusableElements) {
      if (opened) {
        if (element.dataset.prevTabindex === undefined) {
          element.removeAttribute("tabindex");
        } else {
          const previous = element.dataset.prevTabindex;
          if (previous === "") {
            element.removeAttribute("tabindex");
          } else {
            element.setAttribute("tabindex", previous);
          }
          delete element.dataset.prevTabindex;
        }
      } else {
        if (!element.dataset.prevTabindex) {
          element.dataset.prevTabindex = element.getAttribute("tabindex") ?? "";
        }
        element.setAttribute("tabindex", "-1");
      }
    }
  }, [opened, removeCustomComponents]);

  return (
    <CollapseMantine
      in={opened}
      ref={contentReference}
      transitionDuration={transitionDuration}
      w={fullWith ? "100%" : undefined}
    >
      {children}
    </CollapseMantine>
  );
};

export const Collapse = memo(CollapseToMemoize);
