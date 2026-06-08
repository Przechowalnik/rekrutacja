import {
  faChevronUp,
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faFilter,
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { Alert, Box, Divider, Flex } from "@mantine/core";
import cx from "clsx";
import type { PropsWithChildren, ReactNode } from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { T_RouteName } from "~/constants/routes";
import { globalClasses } from "~/constants/styles";
import { useLayout } from "~/hooks/useLayout";
import { Text } from "~/ui/Text";
import { Title } from "~/ui/Title";

import { Accordion } from "../Accordion";
import type { T_BreadcrumbsRoute } from "../Breadcrumbs";
import { Breadcrumbs } from "../Breadcrumbs";
import { Button } from "../Button";
import { ButtonWrapper } from "../ButtonWrapper";
import { Collapse } from "../Collapse";
import { IconSeo } from "../IconSeo";
import PageMeta, { T_SeoFaq, T_SeoSocials } from "../PageMeta";
import { Spoiler } from "../Spoiler";
import {
  backgroundColorButtonWrapperInModal,
  backgroundColorSecondary,
} from "./constant";

type T_SectionSize = "lg" | "md" | "sm";

type T_SectionAlert = {
  center?: boolean;
  text: string;
};

type T_SectionQuestion = {
  description: string;
  title: string;
};

export type T_SectionPageMeta = {
  customCanonical?: string;
  customDescription?: string;
  customJsonLd?: Array<Record<string, unknown>>;
  customSeoBreadcrumbs?: T_BreadcrumbsRoute[];
  customTitle?: string;
  robotsNoIndex?: boolean;
  // withJsonLdReview?: boolean;
  route: "default" | T_RouteName;
  seoFaq?: T_SeoFaq;
  socials?: T_SeoSocials;
  withJsonLdStructured?: boolean;
};

type T_Section = {
  alert?: string | T_SectionAlert;
  backgroundSecondary?: boolean;
  breadcrumbs?: T_BreadcrumbsRoute[];
  buttons?: ReactNode;
  component?: "div" | "section";
  description?: string | T_SectionAlert;
  filters?: ReactNode[];
  filtersDefaultOpen?: boolean;
  fullHeight?: boolean;
  fullHeightInModal?: boolean;
  information?: string | T_SectionAlert;
  isInModal?: boolean;
  onCloseModal?: () => void;
  pageMeta?: T_SectionPageMeta;
  px?: number;
  questions?: T_SectionQuestion[];
  scrollToPositionBefore?: boolean;
  size?: T_SectionSize;
  sizeButtons?: T_SectionSize;
  success?: string | T_SectionAlert;
  title?: string;
  titleLineClamp?: number;
  titleOrder?: 1 | 2 | 3 | 4 | 5 | 6;
  warning?: string | T_SectionAlert;
  withBottomPadding?: boolean;
  withHTML?: boolean;
  withLeftRightPadding?: boolean;
  withMinHeight?: boolean;
  withOverflowHidden?: boolean;
  withPaddingTopButtons?: boolean;
  withPaddingUnderTitle?: boolean;
  withPageMeta?: boolean;
  withScrollToTop?: boolean;
  withTextsToUi?: boolean;
  withTopPadding?: boolean;
};

const SectionToMemoize = ({
  alert,
  backgroundSecondary = false,
  breadcrumbs,
  buttons,
  children,
  component = "section",
  description,
  filters,
  filtersDefaultOpen = true,
  fullHeight,
  fullHeightInModal = false,
  information,
  isInModal = false,
  onCloseModal,
  pageMeta,
  px = 24,
  questions,
  scrollToPositionBefore = false,
  size,
  sizeButtons,
  success,
  title,
  titleLineClamp,
  titleOrder = 1,
  warning,
  withBottomPadding = true,
  withHTML = true,
  withLeftRightPadding = true,
  withMinHeight = true,
  withOverflowHidden = true,
  withPaddingTopButtons = true,
  withPaddingUnderTitle = true,
  withPageMeta = true,
  withScrollToTop = false,
  withTextsToUi = false,
  withTopPadding = true,
}: PropsWithChildren<T_Section>) => {
  const [filtersOpened, setFiltersOpened] = useState(filtersDefaultOpen);
  const referenceFilters = useRef<HTMLDivElement | null>(null);
  const { platformColor } = useLayout();
  const location = useLocation();
  const { t } = useTranslation(namespaces.common);
  const { t: tSeo } = useTranslation(namespaces.seo);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (scrollToPositionBefore) {
        const storedScrollY = sessionStorage.getItem(location.pathname);
        globalThis.scrollTo({
          behavior: "smooth",
          top: storedScrollY ? Number.parseInt(storedScrollY, 10) : 0,
        });
      } else if (withScrollToTop) {
        globalThis.scrollTo(0, 0);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [location.key, scrollToPositionBefore, withScrollToTop]);

  const handleToggleFilters = useCallback(() => {
    setFiltersOpened(previousState => !previousState);
  }, []);

  const mapFilters = filters?.map((item, index) => {
    return (
      <Box key={`filter_${index}`} w={300}>
        {item}
      </Box>
    );
  });

  const titleBoxPx = (() => {
    if (!isInModal) {
      return 12;
    }
    return onCloseModal ? 50 : 24;
  })();

  const leftRightPaddingValue = withLeftRightPadding ? px : 0;

  const sectionWidth = (() => {
    if (size === "sm") {
      return 600;
    }
    if (size === "md") {
      return 800;
    }
    return 1200;
  })();

  return (
    <>
      {breadcrumbs && !isInModal && (
        <>
          <Flex
            align="center"
            bg={backgroundSecondary ? backgroundColorSecondary : undefined}
            component={isInModal ? "div" : component}
            direction="column"
            justify="center"
            pt={{
              base: 0,
              xs: withTopPadding || breadcrumbs ? 32 : 0,
            }}
            px={24}
            visibleFrom="xs"
            w="100%"
          >
            <Flex
              align="center"
              className={cx(withMinHeight && globalClasses.flexGrow1)}
              direction="column"
              justify="space-between"
              maw="100%"
              w={1200}
            >
              <Breadcrumbs routes={breadcrumbs} />
            </Flex>
          </Flex>
          <Box hiddenFrom="xs">
            <Breadcrumbs routes={breadcrumbs} />
          </Box>
        </>
      )}
      <Flex
        align="center"
        bg={
          backgroundSecondary
            ? backgroundColorSecondary
            : "var(--background-color-normal)"
        }
        className={cx(withMinHeight && globalClasses.flexGrow1)}
        component={isInModal ? "div" : component}
        direction="column"
        justify="space-between"
        pb={
          withBottomPadding && !isInModal
            ? {
                base: 0,
                xs: 24,
              }
            : undefined
        }
        pt={
          withTopPadding
            ? {
                base: isInModal ? 0 : 32,
                xs: (() => {
                  if (breadcrumbs && !isInModal) {
                    return 32;
                  }
                  if (isInModal) {
                    return 0;
                  }
                  return 64;
                })(),
              }
            : undefined
        }
        px={{
          base: isInModal ? 0 : leftRightPaddingValue,
          xs: isInModal ? 0 : leftRightPaddingValue,
        }}
        w="100%"
      >
        <Box
          bg={
            backgroundSecondary
              ? backgroundColorSecondary
              : "var(--background-color-normal)"
          }
          className={cx(fullHeight && globalClasses.flexGrow1)}
          display="flex"
          maw="100%"
          style={{
            overflow: withOverflowHidden ? "hidden" : "visible",
          }}
          w={sectionWidth}
        >
          <Flex
            align="flex-start"
            direction="column"
            justify="space-between"
            w="100%"
          >
            {title && (
              <Box
                bg={isInModal ? platformColor : undefined}
                pos="relative"
                px={titleBoxPx}
                py={isInModal ? 8 : 0}
                w="100%"
              >
                <Title
                  c={isInModal ? "white" : undefined}
                  center
                  lineClamp={titleLineClamp}
                  order={isInModal ? 2 : titleOrder}
                  withHTML={withHTML}
                  withTextsToUi={withTextsToUi}
                >
                  {title}
                </Title>
                {isInModal && onCloseModal && (
                  <Button
                    ariaLabel={tSeo("imagesAlt.clear")}
                    onClick={onCloseModal}
                    pos="absolute"
                    px={12}
                    right={4}
                    size="md"
                    top={4}
                    variant="transparent"
                    w="auto"
                  >
                    <IconSeo color="white" icon={faXmark} size="xl" />
                  </Button>
                )}
              </Box>
            )}
            <Flex
              className={cx(fullHeight && globalClasses.flexGrow1)}
              direction="column"
              h={
                fullHeightInModal && isInModal
                  ? {
                      base: "48dvh",
                      xs: "50dvh",
                    }
                  : undefined
              }
              mah={
                isInModal
                  ? {
                      base: "48dvh",
                      xs: "50dvh",
                    }
                  : undefined
              }
              mt={1}
              style={
                isInModal
                  ? {
                      overflow: "auto",
                    }
                  : undefined
              }
              w="100%"
            >
              {title && !isInModal && (
                <Flex
                  align="center"
                  justify="center"
                  pb={{
                    base: (() => {
                      const hasContent =
                        questions ||
                        description ||
                        alert ||
                        information ||
                        warning ||
                        success ||
                        filters;
                      if (hasContent) {
                        return 0;
                      }
                      if (isInModal) {
                        return 4;
                      }
                      if (withPaddingUnderTitle) {
                        return 24;
                      }
                      return 0;
                    })(),
                    xs: (() => {
                      const hasContent =
                        questions ||
                        description ||
                        alert ||
                        information ||
                        warning ||
                        success ||
                        filters;
                      if (hasContent) {
                        return 0;
                      }
                      if (isInModal) {
                        return 8;
                      }
                      if (withPaddingUnderTitle) {
                        return 48;
                      }
                      return 0;
                    })(),
                  }}
                  w="100%"
                >
                  <Divider
                    color={platformColor}
                    mb={8}
                    mt={8}
                    radioGroup="m"
                    size={2}
                    w="100px"
                  />
                </Flex>
              )}
              {description && (
                <Box
                  pb={{
                    base: (() => {
                      const hasContent =
                        questions ||
                        filters ||
                        alert ||
                        information ||
                        warning ||
                        success;
                      if (hasContent) {
                        return "sm";
                      }
                      if (isInModal) {
                        return 0;
                      }
                      return 24;
                    })(),
                    xs: (() => {
                      const hasContent =
                        questions ||
                        filters ||
                        alert ||
                        information ||
                        warning ||
                        success;
                      if (hasContent) {
                        return "sm";
                      }
                      if (isInModal) {
                        return 0;
                      }
                      return 48;
                    })(),
                  }}
                  pt={isInModal ? 8 : 0}
                  px={{
                    base: "sm",
                    xs: "lg",
                  }}
                >
                  <Text
                    center={(() => {
                      if (typeof description === "string") {
                        return true;
                      }
                      if (typeof description.center === "boolean") {
                        return description.center;
                      }
                      return true;
                    })()}
                    size="md"
                    withHTML={withHTML}
                    withTextsToUi={withTextsToUi}
                  >
                    {typeof description === "string"
                      ? description
                      : description.text}
                  </Text>
                </Box>
              )}
              {questions && (
                <Box
                  pb={{
                    base: (() => {
                      const hasContent =
                        filters || alert || information || warning || success;
                      if (hasContent) {
                        return "sm";
                      }
                      if (isInModal) {
                        return 0;
                      }
                      return 24;
                    })(),
                    xs: (() => {
                      const hasContent =
                        filters || alert || information || warning || success;
                      if (hasContent) {
                        return "sm";
                      }
                      if (isInModal) {
                        return 0;
                      }
                      return 48;
                    })(),
                  }}
                  pt="sm"
                  px={{
                    base: "sm",
                    xs: "lg",
                  }}
                >
                  <Spoiler>
                    <Accordion
                      items={questions.map(item => {
                        return {
                          content: item.description,
                          title: item.title,
                        };
                      })}
                    />
                  </Spoiler>
                </Box>
              )}
              {(filters || alert || information || warning || success) && (
                <Box
                  pb={{
                    base: isInModal ? 0 : 24,
                    xs: isInModal ? 0 : 48,
                  }}
                  px={{
                    base: "sm",
                    xs: "lg",
                  }}
                >
                  {information && (
                    <Alert
                      color={platformColor}
                      icon={<IconSeo icon={faCircleInfo} size="xl" />}
                      mb={{
                        base: filters || alert || warning || success ? 12 : 0,
                        xs: filters || alert || warning || success ? 12 : 0,
                      }}
                    >
                      <Text
                        c={platformColor}
                        center={(() => {
                          if (typeof information === "string") {
                            return true;
                          }
                          if (typeof information.center === "boolean") {
                            return information.center;
                          }
                          return true;
                        })()}
                        fw="bold"
                        size="md"
                        withHTML={withHTML}
                        withTextsToUi={withTextsToUi}
                      >
                        {typeof information === "string"
                          ? information
                          : information.text}
                      </Text>
                    </Alert>
                  )}
                  {warning && (
                    <Alert
                      color="orange"
                      icon={<IconSeo icon={faTriangleExclamation} size="xl" />}
                      mb={{
                        base: filters || alert || success ? 12 : 0,
                        xs: filters || alert || success ? 12 : 0,
                      }}
                    >
                      <Text
                        c="orange"
                        center={(() => {
                          if (typeof warning === "string") {
                            return true;
                          }
                          if (typeof warning.center === "boolean") {
                            return warning.center;
                          }
                          return true;
                        })()}
                        fw="bold"
                        size="md"
                        withHTML={withHTML}
                        withTextsToUi={withTextsToUi}
                      >
                        {typeof warning === "string" ? warning : warning.text}
                      </Text>
                    </Alert>
                  )}
                  {success && (
                    <Alert
                      color="teal"
                      icon={<IconSeo icon={faCircleCheck} size="xl" />}
                      mb={{
                        base: filters || alert ? 12 : 0,
                        xs: filters || alert ? 12 : 0,
                      }}
                    >
                      <Text
                        c="teal"
                        center={(() => {
                          if (typeof success === "string") {
                            return true;
                          }
                          if (typeof success.center === "boolean") {
                            return success.center;
                          }
                          return true;
                        })()}
                        fw="bold"
                        size="md"
                        withHTML={withHTML}
                        withTextsToUi={withTextsToUi}
                      >
                        {typeof success === "string" ? success : success.text}
                      </Text>
                    </Alert>
                  )}
                  {alert && (
                    <Alert
                      color="red"
                      icon={<IconSeo icon={faCircleExclamation} size="xl" />}
                      mb={{
                        base: filters ? 12 : 0,
                        xs: filters ? 12 : 0,
                      }}
                    >
                      <Text
                        c="red"
                        center={(() => {
                          if (typeof alert === "string") {
                            return true;
                          }
                          if (typeof alert.center === "boolean") {
                            return alert.center;
                          }
                          return true;
                        })()}
                        fw="bold"
                        size="md"
                        withHTML={withHTML}
                        withTextsToUi={withTextsToUi}
                      >
                        {typeof alert === "string" ? alert : alert.text}
                      </Text>
                    </Alert>
                  )}
                  {filters && (
                    <Flex align="center" justify="center">
                      <Box w="100%">
                        <Collapse opened={filtersOpened}>
                          <Box
                            bg={`light-dark(${colorsMantine.gray2}, ${colorsMantine.gray9})`}
                            pl={48}
                            pos="relative"
                            pr={12}
                            py={12}
                            style={{
                              borderRadius: "8px",
                              overflow: "hidden",
                            }}
                          >
                            <Flex align="center" justify="flex-start" w="100%">
                              <Box w="100%">
                                <Flex
                                  align="flex-start"
                                  direction="row"
                                  gap={12}
                                  justify="flex-start"
                                  ref={referenceFilters}
                                  w="100%"
                                  wrap="wrap"
                                >
                                  {mapFilters}
                                </Flex>
                              </Box>
                            </Flex>
                            <Box
                              bg={`light-dark(${colorsMantine.gray4}, ${colorsMantine.dark8})`}
                              bottom={0}
                              className={globalClasses.shadowInset2}
                              left={0}
                              pos="absolute"
                              px={12}
                              py={8}
                              style={{
                                borderRight:
                                  "2px solid var(--background-color-normal)",
                              }}
                              top={0}
                            >
                              <IconSeo
                                color={`light-dark(${colorsMantine.gray6}, ${colorsMantine.dark3})`}
                                icon={faFilter}
                                size="1x"
                              />
                            </Box>
                          </Box>
                        </Collapse>
                        <Button
                          color={platformColor}
                          fullWidth
                          mt={2}
                          onClick={handleToggleFilters}
                          rightSection={
                            <IconSeo
                              icon={faChevronUp}
                              rotation={filtersOpened ? undefined : 180}
                              size="lg"
                            />
                          }
                          size="xs"
                          variant="filled"
                          withAnimation={false}
                        >
                          {filtersOpened
                            ? t("section.buttonHideFilters", {
                                count: filters.length,
                              })
                            : t("section.buttonShowFilters", {
                                count: filters.length,
                              })}
                        </Button>
                      </Box>
                    </Flex>
                  )}
                </Box>
              )}
              {(() => {
                if (!children) {
                  return (
                    <PageMeta
                      customCanonical={pageMeta?.customCanonical}
                      customDescription={pageMeta?.customDescription}
                      customJsonLd={pageMeta?.customJsonLd}
                      customTitle={pageMeta?.customTitle}
                      robotsNoIndex={pageMeta?.robotsNoIndex}
                      route={pageMeta?.route ?? "default"}
                      seoBreadcrumbs={
                        pageMeta?.customSeoBreadcrumbs ?? breadcrumbs
                      }
                      seoFaq={pageMeta?.seoFaq}
                      socials={pageMeta?.socials}
                      withJsonLdStructured={pageMeta?.withJsonLdStructured}
                    >
                      <Box pt={24} />
                    </PageMeta>
                  );
                }
                if (withPageMeta && !isInModal) {
                  return (
                    <PageMeta
                      customCanonical={pageMeta?.customCanonical}
                      customDescription={pageMeta?.customDescription}
                      customJsonLd={pageMeta?.customJsonLd}
                      customTitle={pageMeta?.customTitle}
                      robotsNoIndex={pageMeta?.robotsNoIndex}
                      route={pageMeta?.route ?? "default"}
                      seoBreadcrumbs={
                        pageMeta?.customSeoBreadcrumbs ?? breadcrumbs
                      }
                      seoFaq={pageMeta?.seoFaq}
                      socials={pageMeta?.socials}
                      withJsonLdStructured={pageMeta?.withJsonLdStructured}
                    >
                      <Box
                        className={cx(fullHeight && globalClasses.flexGrow1)}
                        pb={(() => {
                          if (isInModal) {
                            return {
                              base: 24,
                              xs: 48,
                            };
                          }
                          if (withPaddingTopButtons) {
                            return {
                              base: buttons ? 80 : "sm",
                              xs: buttons ? 48 : "sm",
                            };
                          }
                          return 0;
                        })()}
                        pt={(() => {
                          if (!isInModal) {
                            return;
                          }
                          const hasContent =
                            questions ||
                            description ||
                            alert ||
                            information ||
                            warning ||
                            success ||
                            filters;
                          if (hasContent) {
                            return 24;
                          }
                          return 8;
                        })()}
                        px={
                          isInModal
                            ? {
                                base: "sm",
                                xs: "lg",
                              }
                            : undefined
                        }
                      >
                        {children}
                      </Box>
                    </PageMeta>
                  );
                }
                return (
                  <Box
                    className={cx(fullHeight && globalClasses.flexGrow1)}
                    pb={(() => {
                      if (isInModal) {
                        return {
                          base: 24,
                          xs: 48,
                        };
                      }
                      if (withPaddingTopButtons) {
                        return {
                          base: buttons ? 80 : "sm",
                          xs: buttons ? 48 : "sm",
                        };
                      }
                      return 0;
                    })()}
                    pt={(() => {
                      if (!isInModal) {
                        return;
                      }
                      const hasContent =
                        questions ||
                        description ||
                        alert ||
                        information ||
                        warning ||
                        success ||
                        filters;
                      if (hasContent) {
                        return 24;
                      }
                      return 8;
                    })()}
                    px={
                      isInModal
                        ? {
                            base: "sm",
                            xs: "lg",
                          }
                        : undefined
                    }
                  >
                    {children}
                  </Box>
                );
              })()}
            </Flex>
          </Flex>
        </Box>
        {buttons && (
          <Box
            maw="100%"
            w={(() => {
              if (sizeButtons === "sm") {
                return 600;
              }
              if (sizeButtons === "md") {
                return 800;
              }
              return 1200;
            })()}
          >
            <ButtonWrapper
              backgroundColor={(() => {
                if (isInModal) {
                  return backgroundColorButtonWrapperInModal;
                }
                if (backgroundSecondary) {
                  return backgroundColorSecondary;
                }
                return;
              })()}
              isInModal={isInModal}
              withTopPadding={false}
            >
              {buttons}
            </ButtonWrapper>
          </Box>
        )}
      </Flex>
    </>
  );
};

export const Section = memo(SectionToMemoize);
