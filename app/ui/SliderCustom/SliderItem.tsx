import type { ReactNode } from "react";
import { memo } from "react";

import type { T_SliderAnimationTransitionTimingFunction } from "./Slider";
import classes from "./slider.module.css";

type T_CustomSliderItem = {
  animationDuration: number;
  animationTimingFunction: T_SliderAnimationTransitionTimingFunction;
  centerSlidesItemContent: boolean;
  customAnimationTimingFunction?: string;
  isActive: boolean;
  isBiggerThenActiveSlides: boolean;
  itemChild: ReactNode;
  prevNextSlidesWidth: number;
  show: number;
  spacingSlides: number;
  withOpacityPreviousNextSlider: boolean;
};

const CustomSliderItem = ({
  animationDuration,
  animationTimingFunction,
  centerSlidesItemContent,
  customAnimationTimingFunction,
  isActive,
  isBiggerThenActiveSlides,
  itemChild,
  prevNextSlidesWidth,
  show,
  spacingSlides,
  withOpacityPreviousNextSlider,
}: T_CustomSliderItem) => {
  const transform = (() => {
    if (isActive) {
      return "scale(1) translateX(0%)";
    }

    return `scale(0.9) translateX(${isBiggerThenActiveSlides ? "-5%" : "5%"})`;
  })();

  const opacity = (() => {
    if (!withOpacityPreviousNextSlider) {
      return "1";
    }
    if (isActive) {
      return "1";
    }
    return "0.5";
  })();

  return (
    <div
      style={{
        display: "contents",
        opacity,
        transform,
        transitionDuration: `${animationDuration}s`,
        transitionProperty:
          "min-width, padding-right, padding-left, opacity, transform",
        transitionTimingFunction:
          customAnimationTimingFunction ?? animationTimingFunction,
      }}
    >
      <div
        className={classes.sliderItem}
        draggable={false}
        style={{
          justifyContent: centerSlidesItemContent ? "center" : "flex-start",
          minWidth: `calc(100% / ${show} - (${prevNextSlidesWidth}px / ${show}))`,
          paddingLeft: spacingSlides / 2 + "px",
          paddingRight: spacingSlides / 2 + "px",
        }}
      >
        {itemChild}
      </div>
    </div>
  );
};

export default memo(CustomSliderItem);
