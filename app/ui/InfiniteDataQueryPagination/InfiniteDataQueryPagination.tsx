import { Box, Flex, Pagination } from "@mantine/core";
import type { JSX } from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigation, useSearchParams } from "react-router";
import type { ZodArray, ZodObject, ZodRawShape } from "zod";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { queryKey } from "~/constants/queryAndHashes";
import { T_GetRouteExtraQuery } from "~/constants/routes";
import { globalClasses } from "~/constants/styles";
import { CardNoData } from "~/ui/CardNoData";
import { clearClientCookie, setClientCookie } from "~/utilities/cookieClient";
import { isNumber } from "~/utilities/functions";

import { Collapse } from "../Collapse";

interface InfiniteDataQueryPaginationProps<T extends ZodRawShape> {
  data: {
    items: z.infer<ZodArray<ZodObject<T>>>;
    nextPage: null | number;
    totalPages: null | number | undefined;
  };
  defaultLimit?: number;
  extraQuery?: T_GetRouteExtraQuery;
  gapData?: number;
  limit?: number;
  noMoreDataDescription?: string;
  reloadTrigger?: number;
  renderItem: (item: z.infer<ZodObject<T>>, index: number) => JSX.Element;
  schema: ZodArray<ZodObject<T>>;
}

function InfiniteDataQueryPaginationWrapperToMemoize<T extends ZodRawShape>({
  data,
  defaultLimit = 10,
  extraQuery,
  gapData = 4,
  limit = 10,
  noMoreDataDescription,
  reloadTrigger,
  renderItem,
}: Readonly<InfiniteDataQueryPaginationProps<T>>) {
  const [noDataToShow, setNoDataToShow] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const { state } = useNavigation();
  const { t } = useTranslation(namespaces.common);
  const location = useLocation();
  const lastIdCookieName = `lastId_${location.pathname.replace(/^\//, "").replaceAll("/", "_") || "home"}`;
  const [searchParameters, setSearchParameters] = useSearchParams();
  const scrollElement = useRef<HTMLDivElement>(null);
  const currentPage = useRef<number | undefined>(undefined);

  useEffect(() => {
    const actualPage = searchParameters.get(queryKey.page);

    if (actualPage && scrollElement?.current) {
      const element = scrollElement.current;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 200;

      window.scrollTo({
        behavior: "smooth",
        top: offsetPosition,
      });
    }

    const newValue = isNumber(actualPage) ? Number(actualPage) : 1;

    currentPage.current = newValue;
    setPage(newValue);
  }, [searchParameters]);

  useEffect(() => {
    setHasMore(!!data.nextPage);
    setShowItems(true);
    setNoDataToShow(data?.items?.length === 0);
  }, [data]);

  const handleUpdatePagination = useCallback(
    (value: number) => {
      setShowItems(false);
      setTimeout(() => {
        const newSearchParameters = new URLSearchParams();
        newSearchParameters.set(queryKey.page, value.toString());
        if (
          Array.isArray(data?.items) &&
          data.items.length > 0 &&
          typeof currentPage.current === "number" &&
          currentPage.current + 1 === value
        ) {
          setClientCookie(lastIdCookieName, data.items.at(-1)?.id ?? "");
        } else {
          clearClientCookie(lastIdCookieName);
        }
        if (limit !== defaultLimit) {
          newSearchParameters.set(queryKey.limit, limit.toString());
        }

        if (extraQuery) {
          for (const [key, value_] of Object.entries(extraQuery)) {
            if (Array.isArray(value_)) {
              newSearchParameters.delete(key);
              for (const v of value_) {
                newSearchParameters.append(key, v);
              }
            } else {
              newSearchParameters.set(key, value_);
            }
          }
        }

        setSearchParameters(newSearchParameters);
      }, 300);
    },
    [limit, extraQuery, data.items],
  );

  useEffect(() => {
    if (!reloadTrigger) {
      return;
    }

    handleUpdatePagination(1);
  }, [reloadTrigger]);

  const mapData = data.items.map((item, index) => renderItem(item, index));

  return (
    <Flex align="center" direction="column" justify="space-between">
      <Box ref={scrollElement} w="100%">
        <Collapse opened={!noDataToShow && data.items.length > 0}>
          <Flex
            align="center"
            direction="row"
            gap={gapData}
            justify="center"
            w="100%"
            wrap="wrap"
          >
            {mapData}
          </Flex>
        </Collapse>
        <Collapse opened={!hasMore && noDataToShow}>
          <CardNoData
            description={noMoreDataDescription || t("infiniteData.noData")}
          />
        </Collapse>
      </Box>
      <Pagination
        className={globalClasses.fade}
        disabled={!showItems || state === "loading"}
        hideWithOnePage
        onChange={handleUpdatePagination}
        pt={48}
        total={data?.totalPages ?? 0}
        value={page}
      />
    </Flex>
  );
}

export const InfiniteDataQueryPaginationWrapper = memo(
  InfiniteDataQueryPaginationWrapperToMemoize,
) as <T extends ZodRawShape>(
  properties: InfiniteDataQueryPaginationProps<T>,
) => JSX.Element;
