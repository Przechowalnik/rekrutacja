import type { BoxProps, MantineSize, MantineSpacing } from "@mantine/core";
import { List as MantineList } from "@mantine/core";
import type { ReactNode } from "react";
import { memo } from "react";

import { safeHtml } from "~/utilities/functions";

type T_List = {
  center?: boolean;
  icon?: ReactNode;
  items: string[];
  listStyleType?:
    | "inherit"
    | "initial"
    | "none"
    | "revert-layer"
    | "revert"
    | "unset";
  size?: MantineSize;
  spacing?: MantineSpacing;
  type?: "ordered" | "unordered";
  withHTML?: boolean;
  withPadding?: boolean;
} & BoxProps;

const List = ({
  center,
  icon,
  items,
  listStyleType,
  size,
  spacing = "md",
  type,
  withHTML,
  withPadding,
  ...restProps
}: T_List) => {
  const mapItems = items.map(item => {
    if (withHTML) {
      return (
        <MantineList.Item key={`listItem_${item}`}>
          <div
            dangerouslySetInnerHTML={{
              __html: safeHtml({
                element: item,
              }),
            }}
          ></div>
        </MantineList.Item>
      );
    }

    return <MantineList.Item key={`listItem_${item}`}>{item}</MantineList.Item>;
  });

  return (
    <MantineList
      center={center}
      icon={icon}
      listStyleType={listStyleType}
      size={size}
      spacing={spacing}
      type={type}
      withPadding={withPadding}
      {...restProps}
    >
      {mapItems}
    </MantineList>
  );
};

export default memo(List);
