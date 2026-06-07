import { Text as TextReactEmail } from "@react-email/components";
import { PropsWithChildren } from "react";

import { text } from "./styles.server";

type T_Text = {
  center?: boolean;
};

export const Text = ({ center, children }: PropsWithChildren<T_Text>) => {
  return (
    <TextReactEmail
      style={{
        ...text,
        ...(center ? { textAlign: "center" } : {}),
      }}
    >
      {children}
    </TextReactEmail>
  );
};
