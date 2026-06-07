import { PropsWithChildren } from "react";

import { T_Text, Text } from "../Text";

type T_Title = T_Text & {
  order?: 1 | 2 | 3 | 4 | 5 | 6;
};

export const Title = ({
  children,
  fw = "bold",
  order = 2,
  ...restProps
}: PropsWithChildren<T_Title>) => {
  return (
    <Text {...restProps} component={`h${order}`} fw={fw}>
      {children}
    </Text>
  );
};
