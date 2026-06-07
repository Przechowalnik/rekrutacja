import { Flex } from "@mantine/core";
import cx from "clsx";
import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";

import { globalClasses } from "~/constants/styles";

export const RespectClientSideRendering = ({ children }: PropsWithChildren) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <Flex
      className={cx(globalClasses.flexGrow1, globalClasses.fadePage)}
      direction="column"
    >
      {children}
    </Flex>
  );
};
