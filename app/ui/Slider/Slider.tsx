import { Carousel } from "@mantine/carousel";
import type { CSSProperties, StyleProp } from "@mantine/core";
import { Flex } from "@mantine/core";
import { type ReactNode } from "react";

import { colorsMantine } from "~/constants/colorsMantine";
import { globalIds } from "~/constants/styles";

type T_Slider = {
  carousel?: {
    gap?: number;
    height?: StyleProp<CSSProperties["Height"]>;
    width?: StyleProp<CSSProperties["width"]>;
  };
  children: ReactNode[];
  containScroll?: "keepSnaps" | "trimSnaps" | null;
  dragFree?: boolean;
  initialSlide?: number;
  onlySliderOnMobile?: {
    gap?: number;
  } | null;
  withControls?: boolean;
  withIndicators?: boolean;
};

export const Slider = ({
  carousel,
  children,
  containScroll = "trimSnaps",
  dragFree,
  initialSlide,
  onlySliderOnMobile = { gap: 8 },
  withControls,
  withIndicators,
}: T_Slider) => {
  const mapCarousel = children?.map((item, index) => {
    return <Carousel.Slide key={`carousel_${index}`}>{item}</Carousel.Slide>;
  });

  return (
    <>
      {onlySliderOnMobile && (
        <Flex
          align="center"
          gap={onlySliderOnMobile?.gap ?? 0}
          justify="flex-start"
          visibleFrom="md"
          w="100%"
          wrap="wrap"
        >
          {children}
        </Flex>
      )}
      <Carousel
        emblaOptions={{
          align: "center",
          containScroll: containScroll ?? undefined,
          dragFree,
          skipSnaps: false,
        }}
        height={carousel?.height}
        hiddenFrom={onlySliderOnMobile ? "md" : undefined}
        id={globalIds.sliderUi}
        initialSlide={initialSlide}
        pb={withIndicators ? 48 : 0}
        slideGap={carousel?.gap}
        slideSize={carousel?.width}
        styles={{
          controls: {
            top: withIndicators
              ? "calc(50% - var(--carousel-control-size) - 12px)"
              : undefined,
          },
          indicator: {
            backgroundColor: colorsMantine.primary,
          },
          indicators: {
            paddingTop: 48,
          },
        }}
        w="100%"
        withControls={withControls}
        withIndicators={withIndicators}
        withKeyboardEvents={false}
      >
        {mapCarousel}
      </Carousel>
    </>
  );
};
