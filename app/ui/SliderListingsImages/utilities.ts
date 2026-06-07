export type T_GenerateSliderProps = {
  centerSlides: boolean;
  extraSpaceLeftSlider: number;
  show: number;
  spacingSlides: number;
};

export const generateSliderProps = (width: number) => {
  let newSliderProps: null | T_GenerateSliderProps = null;
  if (width < 370) {
    newSliderProps = {
      centerSlides: true,
      extraSpaceLeftSlider: 0,
      show: 2,
      spacingSlides: 0,
    };
  } else if (width < 450) {
    newSliderProps = {
      centerSlides: false,
      extraSpaceLeftSlider: 0,
      show: 2,
      spacingSlides: 5,
    };
  } else if (width < 600) {
    newSliderProps = {
      centerSlides: false,
      extraSpaceLeftSlider: 0,
      show: 3,
      spacingSlides: 5,
    };
  } else if (width < 768) {
    newSliderProps = {
      centerSlides: false,
      extraSpaceLeftSlider: 0,
      show: 4,
      spacingSlides: 5,
    };
  } else if (width < 1000) {
    newSliderProps = {
      centerSlides: false,
      extraSpaceLeftSlider: 0,
      show: 2,
      spacingSlides: 5,
    };
  } else if (width < 1100) {
    newSliderProps = {
      centerSlides: false,
      extraSpaceLeftSlider: 0,
      show: 3,
      spacingSlides: 5,
    };
  } else {
    newSliderProps = {
      centerSlides: false,
      extraSpaceLeftSlider: 0,
      show: 4,
      spacingSlides: 5,
    };
  }

  return newSliderProps;
};
