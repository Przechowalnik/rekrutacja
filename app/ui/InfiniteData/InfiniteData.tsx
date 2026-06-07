import { faChevronDown, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { Box, Flex, Pagination } from "@mantine/core";
import throttle from "lodash/throttle";
import type { JSX, ReactNode } from "react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import InfiniteData from "react-infinite-scroll-component"; // import react-infinite-scroller
import { useSearchParams } from "react-router";
import type { ZodArray, ZodObject, ZodRawShape } from "zod";
import { z } from "zod";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { queryKey } from "~/constants/queryAndHashes";
import type { T_GetRouteExtraQuery, T_RouteName } from "~/constants/routes";
import { globalClasses } from "~/constants/styles";
import { useFetcherWithActions } from "~/hooks/useFetcherWithActions";
import { useLoading } from "~/hooks/useLoading";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { formNames } from "~/lib/zodFormValidator";
import { isNumber } from "~/utilities/functions";

import { Button } from "../Button";
import { CardNoData } from "../CardNoData";
import { Collapse } from "../Collapse";
import { IconSeo } from "../IconSeo";

interface InfiniteDataProps<T extends ZodRawShape> {
  contentBeforeData?: ReactNode;
  contentBeforeNoData?: ReactNode;
  defaultData?: {
    items: z.infer<ZodArray<ZodObject<T>>>;
    nextPage: null | number;
    totalPages: null | number | undefined;
  };
  extraQuery?: T_GetRouteExtraQuery;
  fetcherKey?: string;
  gapData?: number;
  limit?: number;
  nameFromAPI: string;
  noMoreDataDescription?: string;
  onUpdateData?: (data: unknown) => void;
  renderItem: (item: z.infer<ZodObject<T>>, index: number) => JSX.Element;
  route: T_RouteName;
  schema: ZodArray<ZodObject<T>>;
  scrollAfterFetch?: boolean;
  withButton?: boolean;
  withFetchByQueryParameters?: boolean;
  withNoMoreData?: boolean;
  withPagination?: boolean;
}

function InfiniteDataWrapperToMemoize<T extends ZodRawShape>({
  contentBeforeData,
  contentBeforeNoData,
  defaultData,
  extraQuery,
  fetcherKey,
  gapData = 4,
  limit = 10,
  nameFromAPI,
  noMoreDataDescription,
  onUpdateData,
  renderItem,
  route,
  schema,
  scrollAfterFetch = true,
  withButton = true,
  withFetchByQueryParameters = true,
  withNoMoreData = false,
  withPagination = false,
}: Readonly<InfiniteDataProps<T>>) {
  const [isAfterFirstFetch, setIsAfterFirstFetch] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [items, setItems] = useState<z.infer<ZodObject<T>>[]>(
    defaultData?.items ?? [],
  );
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [isReadyValidExtraQuery, setIsReadyValidExtraQuery] =
    useState(!defaultData);
  const extraQueryReference = useRef(extraQuery);
  const isFirstRender = useRef(true);
  const sectionReference = useRef<HTMLDivElement | null>(null);
  const { onChangeLoading } = useLoading();
  const { getLocalizedRoute } = useLocalizedRoute();

  const { t } = useTranslation(namespaces.common);
  const [searchParameters, setSearchParameters] = useSearchParams();
  const fetcher = useFetcherWithActions({
    schema: z
      .object({
        nextPage: z.number().nullable(),
        totalPages: z.number().optional().nullable(),
        totalResults: z.number().optional().nullable(),
      })
      .merge(
        z.object({
          [nameFromAPI]: schema,
        }),
      ),
  });

  useEffect(() => {
    if (!fetcherKey) {
      return;
    }

    setIsAfterFirstFetch(false);
    setIsLoadingData(false);
    setItems([]);
    setHasMore(true);
    setPage(0);
    setIsReadyValidExtraQuery(!defaultData);
  }, [fetcherKey]);

  useEffect(() => {
    extraQueryReference.current = extraQuery;
  }, [extraQuery]);

  const throttledFetch = useMemo(
    () =>
      throttle((url: string) => {
        fetcher.load(url);
      }, 500),
    [],
  );

  const fetchData = useCallback(
    async ({
      forceFetchFirstPage,
      pageToFetch,
    }: {
      forceFetchFirstPage?: boolean;
      pageToFetch: number;
    }) => {
      setIsAfterFirstFetch(true);

      if (pageToFetch === 0) {
        onChangeLoading({
          value: false,
        });
        setIsLoadingData(false);
        return;
      }

      if (
        pageToFetch === 1 &&
        !forceFetchFirstPage &&
        !extraQueryReference.current
      ) {
        onChangeLoading({
          value: false,
        });
        setIsLoadingData(false);
        return;
      }

      setPage(pageToFetch);

      throttledFetch(
        getLocalizedRoute({
          extraQuery: {
            [formNames.limit]: limit.toString(),
            [formNames.page]: pageToFetch.toString(),
            ...extraQueryReference.current,
          },
          route,
        }),
      );
    },
    [limit, route, defaultData, getLocalizedRoute],
  );

  const loadMore = useCallback(() => {
    if (!hasMore) {
      return;
    }

    fetchData({
      pageToFetch: page + 1,
    });
  }, [hasMore, page]);

  useEffect(() => {
    if (isFirstRender.current && process.env.NODE_ENV === "development") {
      isFirstRender.current = false;
      return;
    }

    if (extraQuery) {
      return;
    }

    if (
      defaultData ? defaultData?.items?.length === 0 && page === 0 : page === 0
    ) {
      fetchData({
        pageToFetch: 1,
      });
    } else {
      setPage(1);
    }
  }, []);

  useEffect(() => {
    if (!extraQuery) {
      return;
    }

    if (defaultData && !isReadyValidExtraQuery) {
      setIsReadyValidExtraQuery(true);
      return;
    }

    onChangeLoading({
      duration: 0,
      value: true,
    });
    setIsLoadingData(true);
    const timeout = setTimeout(() => {
      fetchData({
        pageToFetch: 1,
      });
    }, 600);

    return () => clearTimeout(timeout);
  }, [extraQuery]);

  useEffect(() => {
    if (fetcher.data?.[nameFromAPI] && fetcher.state === "idle") {
      const fetchedItems = fetcher.data[nameFromAPI] as T[];
      setItems(
        (() => {
          if (withPagination || page === 1) {
            return fetchedItems;
          }
          return previous => [...previous, ...fetchedItems];
        })(),
      );

      onUpdateData?.(fetcher.data);

      if (fetchedItems.length === limit) {
        setHasMore(!!fetcher.data?.nextPage);
      } else {
        setHasMore(false);
      }

      onChangeLoading({
        duration: 0,
        value: false,
      });
      setIsLoadingData(false);
    }
  }, [fetcher, nameFromAPI, limit]);

  useEffect(() => {
    if (isFirstRender.current || !isAfterFirstFetch) {
      return;
    }

    if (sectionReference.current && scrollAfterFetch) {
      window.scrollTo({ behavior: "smooth", top: 0 });
    }
  }, [items]);

  useEffect(() => {
    const newPage = searchParameters.get(queryKey.page);

    if (isNumber(newPage)) {
      setPage(Number(newPage));
    }
  }, [searchParameters]);

  useEffect(() => {
    if (!defaultData) {
      setHasMore(false);
    } else if (defaultData.items.length === limit && !withPagination) {
      setHasMore(!!defaultData.nextPage);
    } else {
      setHasMore(false);
    }
  }, [withPagination]);

  const handleUpdatePagination = useCallback(
    (value: number) => {
      if (page === value) {
        if (sectionReference.current && scrollAfterFetch) {
          window.scrollTo({ behavior: "smooth", top: 0 });
        }
        return;
      }

      if (withFetchByQueryParameters) {
        const newSearchParameters = new URLSearchParams(searchParameters);
        newSearchParameters.set(queryKey.page, value.toString());

        setSearchParameters(newSearchParameters);
      } else {
        fetchData({
          forceFetchFirstPage: true,
          pageToFetch: value,
        });
      }
    },
    [page],
  );

  const mapData = items.map((item, index) => renderItem(item, index));

  if (withButton) {
    return (
      <Flex
        align="center"
        direction="column"
        justify="space-between"
        ref={sectionReference}
      >
        <Box w="100%">
          {items.length === 0 && page === 0 ? (
            <>{contentBeforeNoData}</>
          ) : (
            <>
              {contentBeforeData}
              <Collapse opened={!isLoadingData && items.length > 0}>
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
            </>
          )}
          {hasMore && !withPagination && (
            <Button
              className={globalClasses.opacityDelay}
              fullWidth
              loading={fetcher?.state !== "idle"}
              mt={32}
              onClick={loadMore}
              rightSection={<IconSeo icon={faChevronDown} size="lg" />}
              size="sm"
              variant="filled"
            >
              {t("infiniteData.showMore")}
            </Button>
          )}
          <Collapse
            opened={
              !hasMore && withNoMoreData && !isLoadingData && items.length === 0
            }
          >
            <CardNoData
              description={noMoreDataDescription || t("infiniteData.noData")}
            />
          </Collapse>
        </Box>
        <Collapse
          opened={
            withPagination &&
            !isLoadingData &&
            (typeof fetcher?.data?.totalPages === "number" ||
              typeof defaultData?.totalPages === "number")
          }
        >
          <Pagination
            className={globalClasses.fade}
            hideWithOnePage
            onChange={handleUpdatePagination}
            pt={48}
            total={
              typeof fetcher?.data?.totalPages === "number"
                ? fetcher?.data?.totalPages
                : (defaultData?.totalPages ?? 0)
            }
            value={page}
          />
        </Collapse>
      </Flex>
    );
  }

  return (
    <InfiniteData
      dataLength={items.length}
      hasMore={hasMore}
      loader={
        <Flex
          align="center"
          className={globalClasses.fadePage}
          h={50}
          justify="center"
          w="100%"
        >
          <IconSeo
            color={colorsMantine.primary}
            icon={faSpinner}
            size="2x"
            spin
          />
        </Flex>
      }
      next={loadMore}
      scrollThreshold={0.95}
    >
      {items.map((item, index) => renderItem(item, index))}
      <Collapse opened={!hasMore && withNoMoreData}>
        <CardNoData description={t("infiniteData.noData")} />
      </Collapse>
    </InfiniteData>
  );
}

export const InfiniteDataWrapper = memo(InfiniteDataWrapperToMemoize) as <
  T extends ZodRawShape,
>(
  properties: InfiniteDataProps<T>,
) => JSX.Element;
