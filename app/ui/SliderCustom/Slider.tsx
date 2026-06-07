import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import throttle from "lodash/throttle";
import type { MouseEvent, ReactNode, TouchEvent } from "react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { useWindowSize } from "~/hooks/useWindowSize";

import { Button } from "../Button";
import { IconSeo } from "../IconSeo";
import classes from "./slider.module.css";
import SliderItem from "./SliderItem";
import {
  generateActiveSlides,
  isMouseEvent,
  isTouchEvent,
  roundNumber,
} from "./utilities";

export type T_SliderAnimationTransitionTimingFunction =
  | "ease-in-out"
  | "ease-in"
  | "ease-out"
  | "ease"
  | "inherit"
  | "linear"
  | "step-end"
  | "step-start";

type T_Slider = {
  activeSlides: number[];
  animationDuration?: number;
  animationTimingFunction?: T_SliderAnimationTransitionTimingFunction;
  centerSlides?: boolean;
  centerSlidesItemContent?: boolean;
  children?: ReactNode[];
  customAnimationTimingFunction?: string;
  draggable?: boolean;
  extraSpaceLeftSlider?: number;
  maxDragBeforeCancelAllHandlersInSliderItems?: number;
  onUpdate: (activeSlides: number[]) => void;
  prevNextSlidesWidth?: number;
  scrollbarHeight?: number;
  scrollbarSpacingTop?: number;
  scrollbarWidth?: number;
  scrollEver?: number;
  scrollPercentItemToChangeSlides?: number;
  show?: number;
  showPreviousNextSlides?: boolean;
  spacingSlides?: number;
  withArrows?: boolean;
  withCursorGrabbing?: boolean;
  withOpacityPreviousNextSlider?: boolean;
  withScrollbar?: boolean;
};

const Slider = ({
  activeSlides,
  animationDuration = 0.25,
  animationTimingFunction = "ease",
  centerSlides = false,
  centerSlidesItemContent = true,
  children = [],
  customAnimationTimingFunction,
  draggable = true,
  extraSpaceLeftSlider = 0,
  maxDragBeforeCancelAllHandlersInSliderItems = 25,
  onUpdate,
  prevNextSlidesWidth: previousNextSlidesWidth = 100,
  scrollbarHeight = 4,
  scrollbarSpacingTop = 48,
  scrollbarWidth = 160,
  scrollEver = 1,
  scrollPercentItemToChangeSlides = 0.1,
  show = 1,
  showPreviousNextSlides = true,
  spacingSlides = 10,
  withArrows = true,
  withCursorGrabbing = true,
  withOpacityPreviousNextSlider = true,
  withScrollbar = true,
}: T_Slider) => {
  const [startScrollX, setStartScrollX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [scrollSlider, setScrollSlider] = useState(0);
  const [scrollScrollbar, setScrollScrollbar] = useState(0);

  const dragOccurredReference = useRef(false);
  const scrollDraggingReference = useRef(0);

  const { width } = useWindowSize();
  const { t } = useTranslation(namespaces.seo);

  const referenceSlider = useRef<HTMLDivElement>(null);
  const referenceSliderContainer = useRef<HTMLDivElement>(null);

  const validCenterSlides = showPreviousNextSlides ? centerSlides : false;
  const validPreviousNextSlidesWidth = showPreviousNextSlides
    ? previousNextSlidesWidth
    : 0;
  const slidesLength = validCenterSlides
    ? children.length + 2
    : children.length;
  const validShow = Math.min(show, children.length);
  const slidesShow = validCenterSlides ? show + 2 : show;
  const validWithArrows = slidesShow === slidesLength ? false : withArrows;
  const isAllShowed = slidesLength === validShow;
  const disabledLeftArrow = activeSlides.includes(validCenterSlides ? 1 : 0);
  const disabledRightArrow = activeSlides.includes(
    validCenterSlides ? slidesLength - 2 : slidesLength - 1,
  );

  useEffect(() => {
    if (!isReady) {
      requestAnimationFrame(() => setIsReady(true));
    }
  }, []);

  const handleMouseDown = (
    event: MouseEvent<HTMLElement> | TouchEvent<HTMLElement>,
  ) => {
    setIsDragging(true);

    let newStartX = 0;

    if (isTouchEvent(event)) {
      const selectedTouch = event.touches[0];
      if (selectedTouch) {
        newStartX = selectedTouch.clientX;
      }
    }

    if (isMouseEvent(event)) {
      newStartX = event.clientX;
    }

    setStartScrollX(newStartX);
  };

  const handleCountTotalChildElement = useCallback(
    (currentScrollDragging: number) => {
      if (!referenceSliderContainer?.current || !referenceSlider?.current) {
        return;
      }

      const firstActiveSlides = activeSlides.at(0);
      const isLastSlide = activeSlides.includes(slidesLength - 1);
      const isFirstSlide = activeSlides.includes(0);

      if (typeof firstActiveSlides !== "number") {
        return;
      }

      const widthChildElement =
        referenceSliderContainer.current.clientWidth / validShow -
        validPreviousNextSlidesWidth / validShow;

      let validSpacingChildElement = 0;
      if (isFirstSlide) {
        validSpacingChildElement = validCenterSlides
          ? validPreviousNextSlidesWidth / 2
          : 0;
      } else if (isLastSlide) {
        validSpacingChildElement = validCenterSlides
          ? validPreviousNextSlidesWidth / 2
          : validPreviousNextSlidesWidth;
      } else {
        validSpacingChildElement = validPreviousNextSlidesWidth / 2;
      }

      const scrollDraggingWithAllChildrenWidth =
        (draggable ? currentScrollDragging : 0) -
        widthChildElement * firstActiveSlides;

      return {
        detectChildValue:
          -scrollDraggingWithAllChildrenWidth / widthChildElement,
        scrollSliderValue: (() => {
          if (isFirstSlide) {
            return (
              scrollDraggingWithAllChildrenWidth +
              validSpacingChildElement +
              extraSpaceLeftSlider
            );
          }
          if (isLastSlide) {
            return (
              scrollDraggingWithAllChildrenWidth +
              validSpacingChildElement -
              extraSpaceLeftSlider
            );
          }
          return (
            scrollDraggingWithAllChildrenWidth +
            validSpacingChildElement +
            extraSpaceLeftSlider / 2
          );
        })(),
        slidesLength,
      };
    },
    [
      referenceSliderContainer,
      referenceSlider,
      activeSlides,
      extraSpaceLeftSlider,
      validShow,
      validPreviousNextSlidesWidth,
      showPreviousNextSlides,
    ],
  );

  const handleScrollScrollbar = useCallback(
    (currentActiveSlides: number[]) => {
      const firstActiveSlides = currentActiveSlides.at(0);

      if (typeof firstActiveSlides !== "number") {
        return;
      }

      const validCurrentActiveSlides = validCenterSlides
        ? firstActiveSlides - 1
        : firstActiveSlides;

      const newScrollbarWidth =
        (scrollbarWidth / slidesLength) * validCurrentActiveSlides;
      setScrollScrollbar(newScrollbarWidth);
    },
    [scrollbarWidth, slidesLength, validCenterSlides],
  );

  const handleScrollSlider = (roundUp: boolean) => {
    if (!referenceSlider?.current || !referenceSliderContainer?.current) {
      return;
    }

    const resultTotalWidthChildElement = handleCountTotalChildElement(
      scrollDraggingReference.current,
    );

    if (!resultTotalWidthChildElement) {
      return;
    }

    const selectedIdChild = roundNumber({
      centerSlides: validCenterSlides,
      roundUp: roundUp,
      scrollEver: scrollEver,
      scrollPercentItemToChangeSlides: scrollPercentItemToChangeSlides,
      show: validShow,
      slidesLength: resultTotalWidthChildElement.slidesLength,
      value: resultTotalWidthChildElement.detectChildValue,
    });

    onUpdate(selectedIdChild);
  };

  const handleMouseUp = (
    event: MouseEvent<HTMLElement> | TouchEvent<HTMLElement>,
  ) => {
    let newEndX = 0;

    if (isTouchEvent(event)) {
      const selectedTouch = event.changedTouches[0];
      if (selectedTouch) {
        newEndX = selectedTouch.clientX;
      }
    }

    if (isMouseEvent(event)) {
      newEndX = event.clientX;
    }

    dragOccurredReference.current =
      Math.abs(scrollDraggingReference.current) >=
      maxDragBeforeCancelAllHandlersInSliderItems;

    handleScrollSlider(startScrollX > newEndX);

    scrollDraggingReference.current = 0;
    setIsDragging(false);
  };

  const handleClickCapture = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (dragOccurredReference.current) {
        event.stopPropagation();
        event.preventDefault();
        dragOccurredReference.current = false;
      }
    },
    [maxDragBeforeCancelAllHandlersInSliderItems],
  );

  const handleMouseMove = (
    event: MouseEvent<HTMLElement> | TouchEvent<HTMLElement>,
  ) => {
    if (!isDragging || slidesLength === validShow) {
      return;
    }

    let clientX = 0;

    if (isTouchEvent(event)) {
      const selectedTouch = event.touches[0];
      if (selectedTouch) {
        clientX = selectedTouch.clientX;
      }
    }

    if (isMouseEvent(event)) {
      clientX = event.clientX;
    }

    const newScrollDragging = clientX - startScrollX;
    scrollDraggingReference.current = newScrollDragging;

    const result = handleCountTotalChildElement(newScrollDragging);
    if (result) {
      throttledSetScrollSlider(result.scrollSliderValue);

      const fractionalPosition = validCenterSlides
        ? result.detectChildValue - 1
        : result.detectChildValue;
      const clampedPosition = Math.max(
        0,
        Math.min(fractionalPosition, slidesLength - slidesShow),
      );
      setScrollScrollbar((scrollbarWidth / slidesLength) * clampedPosition);
    }
  };

  const throttledSetScrollSlider = useMemo(
    () =>
      throttle((value: number) => {
        setScrollSlider(value);
      }, 5),
    [],
  );

  useEffect(() => {
    const result = handleCountTotalChildElement(0);
    if (!result) {
      return;
    }

    throttledSetScrollSlider(result.scrollSliderValue);
  }, [
    activeSlides,
    referenceSliderContainer,
    referenceSlider,
    extraSpaceLeftSlider,
    show,
    validPreviousNextSlidesWidth,
    width,
  ]);

  useEffect(() => {
    handleScrollScrollbar(activeSlides);
  }, [scrollbarWidth, slidesLength, validCenterSlides, activeSlides]);

  useEffect(() => {
    const generatedActiveSlides = generateActiveSlides({
      centerSlides: validCenterSlides,
      childrenLength: children.length,
      firstIndexChild: validCenterSlides ? 1 : 0,
      show: validShow,
    });

    onUpdate(generatedActiveSlides);
  }, [validCenterSlides, show, children.length]);

  const handleNextSlides = useCallback(() => {
    const firstActiveSlides = activeSlides.at(0);

    if (typeof firstActiveSlides !== "number") {
      return;
    }

    const maxIndexSlides = validCenterSlides
      ? slidesLength - (validShow + 1)
      : slidesLength - validShow;
    const minIndexSlides = validCenterSlides ? 1 : 0;

    let firstIndexChild = minIndexSlides;
    const newValueFirstIndexChild = firstActiveSlides + scrollEver;
    firstIndexChild = Math.min(newValueFirstIndexChild, maxIndexSlides);

    const valuesIndex: number[] = Array.from({ length: validShow })
      .fill(null)
      .map((_item, index) => {
        return firstIndexChild + index;
      });

    onUpdate(valuesIndex);
  }, [slidesLength, validCenterSlides, show, scrollEver, activeSlides]);

  const handlePreviousSlides = useCallback(() => {
    const firstActiveSlides = activeSlides.at(0);

    if (!firstActiveSlides) {
      return;
    }

    const minIndexSlides = validCenterSlides ? 1 : 0;
    let firstIndexChild = minIndexSlides;
    const newValueFirstIndexChild = firstActiveSlides - scrollEver;

    firstIndexChild = Math.max(newValueFirstIndexChild, minIndexSlides);

    const valuesIndex: number[] = Array.from({ length: validShow })
      .fill(null)
      .map((_item, index) => {
        return firstIndexChild + index;
      });

    onUpdate(valuesIndex);
  }, [slidesLength, validCenterSlides, show, scrollEver, activeSlides]);

  const slides = useMemo(() => {
    const childrenWithCenter = validCenterSlides
      ? [null, ...children, null]
      : children;

    return childrenWithCenter.map((itemChild, indexChild) => {
      const isActive = activeSlides.includes(indexChild);
      const isBiggerThenActiveSlides = activeSlides.some(
        item => indexChild > item,
      );

      return (
        <SliderItem
          animationDuration={animationDuration}
          animationTimingFunction={animationTimingFunction}
          centerSlidesItemContent={centerSlidesItemContent}
          customAnimationTimingFunction={customAnimationTimingFunction}
          isActive={isActive}
          isBiggerThenActiveSlides={isBiggerThenActiveSlides}
          itemChild={itemChild}
          key={`slideItem_${indexChild}`}
          prevNextSlidesWidth={validPreviousNextSlidesWidth}
          show={validShow}
          spacingSlides={spacingSlides}
          withOpacityPreviousNextSlider={withOpacityPreviousNextSlider}
        />
      );
    });
  }, [
    children,
    validCenterSlides,
    show,
    spacingSlides,
    validPreviousNextSlidesWidth,
    animationDuration,
    animationTimingFunction,
    customAnimationTimingFunction,
    activeSlides,
    centerSlidesItemContent,
  ]);

  if (children.length === 0) {
    return <></>;
  }

  return (
    <div
      className={`${classes.slider} ${isReady ? classes.sliderReady : classes.sliderInitializing}`}
      ref={referenceSlider}
      style={{
        paddingBottom: withScrollbar ? `${scrollbarSpacingTop}px` : "0px",
      }}
    >
      <div
        className={classes.sliderContainer}
        onClickCapture={handleClickCapture}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchCancel={handleMouseUp}
        onTouchEnd={handleMouseUp}
        onTouchMove={handleMouseMove}
        onTouchStart={handleMouseDown}
        ref={referenceSliderContainer}
        role="region"
        style={{
          cursor: withCursorGrabbing
            ? isDragging
              ? "grabbing"
              : "grab"
            : "default",
          justifyContent:
            !showPreviousNextSlides && validCenterSlides
              ? "center"
              : "flex-start",
          transform: `translate3d(${scrollSlider}px, 0px, 0px)`,
          transitionDuration: isDragging ? "0s" : `${animationDuration}s`,
          transitionTimingFunction:
            customAnimationTimingFunction ?? animationTimingFunction,
        }}
      >
        {slides}
      </div>
      {withScrollbar && (
        <div
          className={classes.sliderScrollBar}
          style={{
            height: `${scrollbarHeight}px`,
            opacity: isAllShowed ? "0" : "1",
            transitionDuration: `${animationDuration}s`,
            transitionTimingFunction:
              customAnimationTimingFunction ?? animationTimingFunction,
            width: `${scrollbarWidth}px`,
          }}
        >
          <div className={classes.sliderScrollBarContainer}>
            <div
              className={classes.sliderScrollBarContent}
              style={{
                height: `${scrollbarHeight}px`,
                transform: `translate3d(${scrollScrollbar}px, 0px, 0px)`,
                transitionDuration: `${animationDuration}s`,
                transitionTimingFunction:
                  customAnimationTimingFunction ?? animationTimingFunction,
                width: `${(scrollbarWidth / slidesLength) * slidesShow}px`,
              }}
            />
          </div>
        </div>
      )}
      {validWithArrows && (
        <>
          <div
            className={classes.sliderArrowLeft}
            style={{
              opacity: disabledLeftArrow ? "0" : "1",
              transform: `translateY(calc(-50% - ${scrollbarSpacingTop / 2}px)) translateX(${disabledLeftArrow ? "-4dvw" : "2dvw"})`,
              transitionDuration: `${animationDuration}s`,
              transitionTimingFunction:
                customAnimationTimingFunction ?? animationTimingFunction,
            }}
          >
            <Button
              ariaLabel={t("imagesAlt.previous")}
              color="dark"
              disabled={disabledLeftArrow}
              h={40}
              onClick={handlePreviousSlides}
              p={0}
              radius="xl"
              size="xs"
              variant="filled"
              w={40}
            >
              <IconSeo color="white" icon={faChevronLeft} size="xl" />
            </Button>
          </div>
          <div
            className={classes.sliderArrowRight}
            style={{
              opacity: disabledRightArrow ? "0" : "1",
              transform: `translateY(calc(-50% - ${scrollbarSpacingTop / 2}px)) translateX(${
                disabledRightArrow ? "4dvw" : "-2dvw"
              })`,
              transitionDuration: `${animationDuration}s`,
              transitionProperty: "transform, opacity",
              transitionTimingFunction:
                customAnimationTimingFunction ?? animationTimingFunction,
            }}
          >
            <Button
              ariaLabel={t("imagesAlt.next")}
              color="dark"
              disabled={disabledRightArrow}
              h={40}
              onClick={handleNextSlides}
              p={0}
              radius="xl"
              size="xs"
              variant="filled"
              w={40}
            >
              <IconSeo color="white" icon={faChevronRight} size="xl" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default memo(Slider);
