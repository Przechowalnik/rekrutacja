import { PropsWithChildren } from "react";

import { code } from "./styles.server";

export const Code = ({ children }: PropsWithChildren) => {
  return <code style={code}>{children}</code>;
};
