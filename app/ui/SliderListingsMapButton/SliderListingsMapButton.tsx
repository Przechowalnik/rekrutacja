import { memo, ReactNode, useCallback, useEffect, useState } from "react";

import { useLayout } from "~/hooks/useLayout";
import { useWindowSize } from "~/hooks/useWindowSize";
import { SliderCustom } from "~/ui/SliderCustom";

import { generateSliderProps, T_GenerateSliderProps } from "./utilities";

type T_SliderListingsMapButton = {
  items: ReactNode[];
};

const SliderListingsMapButton = ({ items }: T_SliderListingsMapButton) => {
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

  return (
    <SliderCustom
      activeSlides={activeSlides}
      scrollEver={1}
      {...sliderProps}
      onUpdate={handleUpdateSlides}
      withArrows={!isMobile}
      withCursorGrabbing={false}
    >
      {items}
    </SliderCustom>
  );
};

export default memo(SliderListingsMapButton);
