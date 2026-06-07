import { Link as LinkReactEmail } from "@react-email/components";
import { PropsWithChildren } from "react";

import { link } from "./styles.server";

type T_Link = {
  href: string;
};

export const Link = ({ children, href }: PropsWithChildren<T_Link>) => {
  return (
    <LinkReactEmail href={href} style={link}>
      {children}
    </LinkReactEmail>
  );
};
