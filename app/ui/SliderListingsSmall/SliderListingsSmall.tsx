import { memo, useCallback, useEffect, useState } from "react";

import { useLayout } from "~/hooks/useLayout";
import { useWindowSize } from "~/hooks/useWindowSize";
import { T_Listings } from "~/models/listings";
import { CardSearchListingSmall } from "~/ui/CardSearchListingSmall";
import { SliderCustom } from "~/ui/SliderCustom";

import { generateSliderProps, T_GenerateSliderProps } from "./utilities";

type T_SliderListingsSmall = {
  listings: T_Listings;
};

const SliderListingsSmall = ({ listings }: T_SliderListingsSmall) => {
  const [activeSlides, setActiveSlides] = useState<number[]>([]);
  const [sliderProps, setSliderProps] = useState<T_GenerateSliderProps>({
    centerSlides: true,
    extraSpaceLeftSlider: 0,
    prevNextSlidesWidth: 5,
    show: 1,
    spacingSlides: 5,
  });

  const { width } = useWindowSize();
  const { isMobile } = useLayout();

  useEffect(() => {
    const generatedSliderProps = generateSliderProps(width);

    if (!generatedSliderProps) {
      return;
    }

    setSliderProps(generatedSliderProps);
  }, [width]);

  const handleUpdateSlides = useCallback((newActiveSlides: number[]) => {
    setActiveSlides(newActiveSlides);
  }, []);

  const generatedCards = listings.map(item => {
    return (
      <CardSearchListingSmall key={`latestListing_${item.id}`} listing={item} />
    );
  });

  return (
    <SliderCustom
      activeSlides={activeSlides}
      scrollEver={1}
      {...sliderProps}
      onUpdate={handleUpdateSlides}
      withArrows={!isMobile}
      withCursorGrabbing={false}
    >
      {generatedCards}
    </SliderCustom>
  );
};

export default memo(SliderListingsSmall);
