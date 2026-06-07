import { Group } from "@mantine/core";
import { memo, type PropsWithChildren } from "react";

type T_ButtonWrapper = {
  backgroundColor?: string;
  gap?: number;
  isInModal?: boolean;
  p?: number;
  withMobileReverse?: boolean;
  withTopPadding?: boolean;
};

const ButtonWrapperToMemoize = ({
  backgroundColor,
  children,
  gap = 10,
  isInModal,
  p = 10,
  withMobileReverse = true,
  withTopPadding = true,
}: PropsWithChildren<T_ButtonWrapper>) => {
  return (
    <>
      <Group
        align="center"
        gap={gap}
        justify="flex-end"
        maw="100%"
        p={p}
        pt={withTopPadding ? 24 : 12}
        style={{
          backgroundColor: backgroundColor ?? "var(--background-color-normal)",
          flexDirection: "row",
        }}
        visibleFrom="xs"
        w="100%"
      >
        {children}
      </Group>
      <Group
        align="center"
        gap={gap}
        hiddenFrom="xs"
        justify="flex-end"
        maw="100%"
        p={p}
        pb={isInModal ? p : p + gap}
        pt={withTopPadding || isInModal ? 12 : 0}
        style={{
          backgroundColor: backgroundColor ?? "var(--background-color-normal)",
          flexDirection: withMobileReverse ? "column-reverse" : "column",
        }}
        w="100%"
      >
        {children}
      </Group>
    </>
  );
};

export const ButtonWrapper = memo(ButtonWrapperToMemoize);
