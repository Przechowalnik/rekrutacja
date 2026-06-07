import { memo, useCallback, useState } from "react";

import { convertToValidString } from "~/lib/validations";
import { AccordionCustom } from "~/ui/AccordionCustom";
import { Text } from "~/ui/Text";
import { containsWordsInAnyText } from "~/utilities/functions";

import { type T_GetFaqResult } from "./constants";

type T_HelpPageCategory = {
  category: T_GetFaqResult;
  handleClickCategory: (value: null | string) => void;
  index: number;
  isOnlyOne: boolean;
  isOpenCategory: boolean;
  searchValue: string;
};

const HelpPageCategoryToMemoize = ({
  category,
  handleClickCategory,
  index,
  isOnlyOne,
  isOpenCategory,
  searchValue,
}: T_HelpPageCategory) => {
  const [accordionCategoryItemOpen, setAccordionCategoryItemOpen] = useState<
    null | string
  >(null);

  const validSearchValue = convertToValidString(searchValue);

  const filterItems = category.items.filter(itemArticle => {
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

  const handleClickCategoryItem = useCallback((value: null | string) => {
    setAccordionCategoryItemOpen(previousState =>
      previousState === value ? null : value,
    );
  }, []);

  const mapAccordions = filterItems.map((item, indexItem) => {
    return (
      <AccordionCustom
        key={`accordionItem_${index}_${item.title}`}
        onClick={() => handleClickCategoryItem(item.title)}
        open={
          isOnlyOne && filterItems.length === 1
            ? true
            : accordionCategoryItemOpen === item.title
        }
        style={{
          borderBottomLeftRadius:
            indexItem + 1 === filterItems.length ? undefined : 0,
          borderBottomRightRadius:
            indexItem + 1 === filterItems.length ? undefined : 0,
          borderBottomWidth:
            indexItem + 1 === filterItems.length ? undefined : "1px",
          borderTopLeftRadius: indexItem === 0 ? undefined : 0,
          borderTopRightRadius: indexItem === 0 ? undefined : 0,
          borderTopWidth: indexItem === 0 ? undefined : "1px",
        }}
        title={item.title}
        titleComponent="h3"
      >
        <Text size="sm" withTextsToUi>
          {item.description}
        </Text>
      </AccordionCustom>
    );
  });

  return (
    <AccordionCustom
      onClick={() => {
        handleClickCategory(category.title);
        setAccordionCategoryItemOpen(null);
      }}
      open={isOnlyOne ? true : isOpenCategory}
      title={`${category.title} (${filterItems.length})`}
      titleComponent="p"
    >
      {mapAccordions}
    </AccordionCustom>
  );
};

export const HelpPageCategory = memo(HelpPageCategoryToMemoize);
