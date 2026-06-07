import type { MouseEvent, TouchEvent } from "react";

export const isTouchEvent = (
  event: MouseEvent | TouchEvent,
): event is TouchEvent => {
  return event && "touches" in event;
};

export const isMouseEvent = (
  event: MouseEvent | TouchEvent,
): event is MouseEvent => {
  return event && "screenX" in event;
};

type T_RoundNumber = {
  centerSlides: boolean;
  roundUp: boolean;
  scrollEver: number;
  scrollPercentItemToChangeSlides: number;
  show: number;
  slidesLength: number;
  value: number;
};

type T_GenerateActiveSlides = {
  centerSlides: boolean;
  childrenLength: number;
  firstIndexChild: number;
  show: number;
};

export const generateActiveSlides = ({
  centerSlides,
  childrenLength,
  firstIndexChild,
  show,
}: T_GenerateActiveSlides) => {
  const slidesLength = centerSlides ? childrenLength + 2 : childrenLength;
  const maxIndexSlides = centerSlides
    ? slidesLength - (show + 1)
    : slidesLength - show;

  firstIndexChild = Math.min(firstIndexChild, maxIndexSlides);

  firstIndexChild = Math.abs(firstIndexChild);

  const valuesIndex: number[] = Array.from({ length: show })
    .fill(null)
    .map((_item, index) => {
      return firstIndexChild + index;
    });

  return valuesIndex;
};

export const roundNumber = ({
  centerSlides,
  roundUp,
  scrollEver,
  scrollPercentItemToChangeSlides,
  show,
  slidesLength,
  value,
}: T_RoundNumber) => {
  const maxIndexSlides = centerSlides
    ? slidesLength - (show + 1)
    : slidesLength - show;
  const minIndexSlides = centerSlides ? 1 : 0;

  let firstIndexChild = Math.floor(value);
  const decimalPart = value - firstIndexChild;
  if (value >= minIndexSlides) {
    if (roundUp) {
      if (decimalPart > scrollPercentItemToChangeSlides) {
        const newValueFirstIndexChild = firstIndexChild + scrollEver;
        firstIndexChild = Math.min(newValueFirstIndexChild, maxIndexSlides);
      } else {
        const newValueFirstIndexChild = Math.floor(value);
        firstIndexChild = Math.min(newValueFirstIndexChild, maxIndexSlides);
      }
    } else if (decimalPart === 0) {
      /* empty */
    } else if (decimalPart < 1 - scrollPercentItemToChangeSlides) {
      const newValueFirstIndexChild = firstIndexChild - scrollEver + 1;

      firstIndexChild = Math.max(newValueFirstIndexChild, minIndexSlides);
    } else {
      const newValueFirstIndexChild = firstIndexChild + 1;
      firstIndexChild = Math.min(newValueFirstIndexChild, maxIndexSlides);
    }
  } else {
    firstIndexChild = minIndexSlides;
  }

  firstIndexChild = Math.abs(firstIndexChild);

  const valuesIndex: number[] = Array.from({ length: show })
    .fill(null)
    .map((_item, index) => {
      return firstIndexChild + index;
    });

  return valuesIndex;
};
