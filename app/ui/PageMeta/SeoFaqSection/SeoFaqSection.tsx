import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { Box, Flex } from "@mantine/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { Accordion, T_AccordionItem } from "~/ui/Accordion";
import { Button } from "~/ui/Button";
import { Collapse } from "~/ui/Collapse";
import { IconSeo } from "~/ui/IconSeo";
import { Section } from "~/ui/Section";
import { Text } from "~/ui/Text";
import { Title } from "~/ui/Title";
import { containsHtmlTags } from "~/utilities/functions";

type T_SeoFaqSectionItem = {
  description: string;
  title: string;
};

type T_SeoFaqSection = {
  description?: string;
  items: T_SeoFaqSectionItem[];
};

const MAX_HEIGHT_TEXT = 160;

export const SeoFaqSection = ({ description, items }: T_SeoFaqSection) => {
  const [showMoreFaq, setShowMoreFaq] = useState(false);
  const [showMoreDescription, setShowMoreDescription] = useState(false);
  const [maxHeightDescription, setMaxHeightDescription] = useState<
    null | number
  >(null);

  const { t } = useTranslation(namespaces.seo);
  const referenceDescription = useRef<HTMLDivElement>(null);
  const referenceParagraph = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !description ||
      !referenceDescription.current ||
      !referenceParagraph?.current
    ) {
      return;
    }

    setMaxHeightDescription(referenceDescription.current.clientHeight);
    setShowMoreDescription(false);

    const element = referenceParagraph.current;
    const originalText = element.textContent ?? "";
    let trimmedText = originalText;

    while (element.scrollHeight > MAX_HEIGHT_TEXT && trimmedText.length > 0) {
      trimmedText = trimmedText.trim().replace(/\s*\S+\s*$/, "…");
      element.textContent = trimmedText;
    }
  }, [description]);

  const handleShowMoreFaq = useCallback(() => {
    setShowMoreFaq(previousState => !previousState);
  }, []);

  const handleShowMoreDescription = useCallback(() => {
    setShowMoreDescription(previousState => !previousState);
  }, []);

  const mapSeoFaqSectionItems: T_AccordionItem[] = items
    .filter((_, index) => index <= 4)
    .map(item => {
      return {
        content: (
          <Text
            size="md"
            span={containsHtmlTags({ text: description ?? "" })}
            withHTML
          >
            {item.description}
          </Text>
        ),
        title: item.title,
      };
    });

  const mapSeoFaqSectionItemsMore: T_AccordionItem[] = items
    .filter((_, index) => index > 4)
    .map(item => {
      return {
        content: (
          <Text
            size="md"
            span={containsHtmlTags({ text: description ?? "" })}
            withHTML
          >
            {item.description}
          </Text>
        ),
        title: item.title,
      };
    });

  return (
    <Section size="md" withPageMeta={false}>
      {items?.length > 0 ? (
        <>
          <Flex justify="center" pb={40}>
            <Title order={3}>{t("seoFaq.title")}</Title>
          </Flex>
          <Flex align="center" direction="column" justify="center">
            <Accordion items={mapSeoFaqSectionItems} />
            <Collapse opened={showMoreFaq} removeCustomComponents="button">
              <Accordion items={mapSeoFaqSectionItemsMore} />
            </Collapse>
          </Flex>
          <Flex align="center" justify="center" pb={40}>
            {items.length > 5 ? (
              <Button
                onClick={handleShowMoreFaq}
                rightSection={
                  <IconSeo
                    icon={faChevronDown}
                    rotation={showMoreFaq ? 180 : undefined}
                    size="lg"
                  />
                }
                size="sm"
              >
                {showMoreFaq
                  ? (t("seoFaq.buttonShowLess") ?? "")
                  : (t("seoFaq.buttonShowMore") ?? "")}
              </Button>
            ) : null}
          </Flex>
        </>
      ) : null}
      {description && (
        <Flex align="center" direction="column" justify="center">
          {!(showMoreDescription && !!maxHeightDescription) && (
            <Box
              h={maxHeightDescription ? `${MAX_HEIGHT_TEXT}px` : "auto"}
              ref={referenceDescription}
              style={{
                overflow: "hidden",
              }}
              w="100%"
            >
              <Text
                c="gray"
                lineClamp={
                  maxHeightDescription && !showMoreDescription ? 5 : undefined
                }
                refText={referenceParagraph}
                size="lg"
                span={containsHtmlTags({ text: description ?? "" })}
              >
                {description}
              </Text>
            </Box>
          )}
          {showMoreDescription && !!maxHeightDescription && (
            <Box
              pos="relative"
              style={{
                overflow: "hidden",
              }}
            >
              <Text
                c="gray"
                refText={referenceParagraph}
                size="lg"
                span={containsHtmlTags({ text: description ?? "" })}
              >
                {description}
              </Text>
            </Box>
          )}
          {maxHeightDescription && maxHeightDescription > MAX_HEIGHT_TEXT ? (
            <Box pb={2} pt={12}>
              <Button
                onClick={handleShowMoreDescription}
                rightSection={
                  <IconSeo
                    icon={faChevronDown}
                    rotation={showMoreDescription ? 180 : undefined}
                    size="md"
                  />
                }
                size="md"
                variant="light"
              >
                {showMoreDescription
                  ? (t("seoFaq.buttonShowLess") ?? "")
                  : (t("seoFaq.buttonShowMore") ?? "")}
              </Button>
            </Box>
          ) : null}
        </Flex>
      )}
    </Section>
  );
};
