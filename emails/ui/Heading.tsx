import { Heading as HeadingReactEmail } from "@react-email/components";
import { PropsWithChildren } from "react";

import { heading } from "./styles.server";

export const Heading = ({ children }: PropsWithChildren) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return <HeadingReactEmail style={heading}>{children}</HeadingReactEmail>;
};
