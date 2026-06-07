import { Box } from "@mantine/core";
import parse, { DOMNode, Element } from "html-react-parser";
import { memo } from "react";

import { T_RouteValue } from "~/constants/routes";

import { Link } from "../Link";
import classes from "./textEditorShow.module.css";

type T_TextEditorShow = {
  content: string;
};

const TextEditorShow = ({ content }: T_TextEditorShow) => {
  const transform = (node: DOMNode) => {
    if (node instanceof Element && node.name === "a") {
      const href = node.attribs.href?.toLowerCase();
      const isCustomLink = href?.includes("http") || href?.includes("www");

      return (
        <Link
          customHref={isCustomLink ? href : undefined}
          to={isCustomLink ? undefined : (href as T_RouteValue)}
          withUnderline
        >
          {node.children
            .map(child => ("data" in child ? child.data : ""))
            .join("")}
        </Link>
      );
    }
  };

  return (
    <Box className={classes.textEditorShow} mih={95} mt={-16}>
      {parse(content, { replace: transform })}
    </Box>
  );
};

export default memo(TextEditorShow);
