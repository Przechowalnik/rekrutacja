import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import type { BoxProps } from "@mantine/core";
import { Accordion as MantineAccordion } from "@mantine/core";
import type { ReactNode } from "react";
import { memo, useState } from "react";

import { colorsMantine } from "~/constants/colorsMantine";
import { globalClasses } from "~/constants/styles";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { replaceTextToUi } from "~/utilities/converter";

import { IconSeo, T_IconSeo } from "../IconSeo";
import { T_TextComponent, Text } from "../Text";

export type T_AccordionItem = {
  content: ReactNode;
  icon?: T_IconSeo;
  title: string;
};

type T_Accordion = {
  defaultTitle?: string;
  items: T_AccordionItem[];
  titleComponent?: T_TextComponent;
} & BoxProps;

const AccordionToMemoize = ({
  defaultTitle,
  items = [],
  titleComponent = "p",
  ...restProps
}: T_Accordion) => {
  const [openedItem, setOpenedItem] = useState<null | string>(null);
  const { getLocalizedRoute } = useLocalizedRoute();

  const handleAccordionChange = (value: null | string) => {
    setOpenedItem(value);
  };

  const mapItems = items.map((item, index) => {
    return (
      <MantineAccordion.Item key={item.title} value={item.title}>
        <MantineAccordion.Control
          icon={
            item.icon ? (
              <IconSeo color={colorsMantine.primary} {...item.icon} />
            ) : undefined
          }
        >
          <Text
            component={titleComponent}
            fw="bold"
            size="md"
            variant={openedItem === item.title ? "gradient" : undefined}
            withHTML
            withTextsToUi
          >
            {`${index + 1}. ${item.title}`}
          </Text>
        </MantineAccordion.Control>
        <MantineAccordion.Panel
          className={
            typeof item.content === "string"
              ? globalClasses.accordionContent
              : undefined
          }
          id="content"
        >
          {typeof item.content === "string"
            ? replaceTextToUi({
                c: restProps.c,
                getLocalizedRoute,
                htmlString: item.content?.toString() ?? "",
                size: "sm",
              })
            : item.content}
        </MantineAccordion.Panel>
      </MantineAccordion.Item>
    );
  });

  return (
    <MantineAccordion
      chevron={
        <IconSeo
          color={colorsMantine.grayText}
          icon={faChevronDown}
          size="1x"
        />
      }
      chevronSize={16}
      className={globalClasses.accordion}
      defaultValue={defaultTitle}
      onChange={handleAccordionChange}
      radius="md"
      w="100%"
      {...restProps}
    >
      {mapItems}
    </MantineAccordion>
  );
};

export const Accordion = memo(AccordionToMemoize);
