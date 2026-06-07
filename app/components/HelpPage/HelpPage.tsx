import { Box, Flex } from "@mantine/core";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { convertToValidString } from "~/lib/validations";
import { CardNoData } from "~/ui/CardNoData";
import { Input } from "~/ui/Input";
import { Section } from "~/ui/Section";
import { containsWordsInAnyText } from "~/utilities/functions";

import { getFaq } from "./constants";
import { HelpPageCategory } from "./HelpPageCategory";

export const HelpPage = () => {
  const [accordionCategoryOpen, setAccordionCategoryOpen] = useState<
    null | string
  >(null);
  const [searchValue, setSearchValue] = useState("");

  const { i18n, t } = useTranslation(namespaces.help);

  const handleChangeInput = useCallback((value: number | string) => {
    setSearchValue(value.toString());
  }, []);

  const handleClickCategory = useCallback((value: null | string) => {
    setAccordionCategoryOpen(previousState =>
      previousState === value ? null : value,
    );
  }, []);

  const faq = useMemo(() => getFaq(t, i18n.language), [t, i18n.language]);

  const seoFaqItems = useMemo(
    () =>
      faq.flatMap(category =>
        category.items.map(item => ({
          description: item.description,
          title: item.title,
        })),
      ),
    [faq],
  );

  const searchFaq = useMemo(() => {
    const validSearchValue = convertToValidString(searchValue);

    const filterFaq = faq.filter(item => {
      const isInTitle = containsWordsInAnyText({
        matchThreshold: 0.8,
        query: validSearchValue,
        text: item.title,
      });

      const isInItems = item.items.some(itemArticle => {
        const allTextsToSearch = [
          itemArticle.title,
          itemArticle.description,
          itemArticle.searchText ?? "",
        ].filter(Boolean);

        return allTextsToSearch.some(text => {
          const normalizedText = convertToValidString(text);

          return containsWordsInAnyText({
            matchThreshold: 0.8,
            query: validSearchValue,
            text: normalizedText,
          });
        });
      });

      return isInTitle || isInItems;
    });

    const mapFaq = filterFaq.map((itemCategory, indexCategory) => {
      return (
        <HelpPageCategory
          category={itemCategory}
          handleClickCategory={handleClickCategory}
          index={indexCategory}
          isOnlyOne={filterFaq.length === 1}
          isOpenCategory={accordionCategoryOpen === itemCategory.title}
          key={`faq_${itemCategory.title}`}
          searchValue={searchValue}
        />
      );
    });

    return mapFaq;
  }, [faq, searchValue, accordionCategoryOpen]);

  return (
    <Section
      breadcrumbs={[E_Routes.home, E_Routes.help]}
      pageMeta={{
        route: E_Routes.help,
        ...(seoFaqItems.length > 0
          ? { seoFaq: { faq: seoFaqItems, route: E_Routes.help } }
          : {}),
      }}
      size="md"
      title={t("title")}
    >
      <Flex align="center" direction="column" justify="center" mt={12} w="100%">
        <Box maw={420} w="100%">
          <Input
            clearable
            mb={48}
            onChange={handleChangeInput}
            placeholder={t("placeholder")}
            size="lg"
            w="100%"
          />
        </Box>
      </Flex>
      <Flex align="center" direction="column" gap={12} justify="center" pb={24}>
        {searchFaq.length > 0 ? (
          searchFaq
        ) : (
          <CardNoData description={t("noData")} />
        )}
      </Flex>
    </Section>
  );
};
