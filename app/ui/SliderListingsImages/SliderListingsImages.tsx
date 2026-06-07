import {
  faImages,
  faUpRightAndDownLeftFromCenter,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { AspectRatio, Box, Flex } from "@mantine/core";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { useLayout } from "~/hooks/useLayout";
import { useWindowSize } from "~/hooks/useWindowSize";
import { T_ListingImage } from "~/models/listingNested";
import { SliderCustom } from "~/ui/SliderCustom";

import { Button } from "../Button";
import { ErrorBoundary } from "../ErrorBoundary";
import { IconSeo } from "../IconSeo";
import { Image } from "../Image";
import { Modal } from "../Modal";
import { generateSliderProps, T_GenerateSliderProps } from "./utilities";

type T_SliderListingsImages = {
  altPrefix?: string;
  images: T_ListingImage[];
};

const SliderListingsImages = ({
  altPrefix,
  images,
}: T_SliderListingsImages) => {
  const [showModal, setShowModal] = useState(false);
  const [clickedImageIndex, setClickedImageIndex] = useState(0);

  const [activeSlides, setActiveSlides] = useState<number[]>([]);
  const [activeThumbnailSlides, setActiveThumbnailSlides] = useState<number[]>(
    [],
  );

  const { isMobile } = useLayout();

  const [sliderProps, setSliderProps] = useState<T_GenerateSliderProps>({
    centerSlides: false,
    extraSpaceLeftSlider: 0,
    show: 2,
    spacingSlides: 5,
  });

  const { t: tSeo } = useTranslation(namespaces.seo);
  const { width } = useWindowSize();

  const sortedImages = useMemo(() => {
    return [...images].sort((a, b) => {
      if (a.isDefault) {
        return -1;
      }
      if (b.isDefault) {
        return 1;
      }
      return 0;
    });
  }, [images]);

  useEffect(() => {
    const generatedSliderProps = generateSliderProps(width);

    if (!generatedSliderProps) {
      return;
    }

    setSliderProps(generatedSliderProps);
  }, [width]);

  const handleClickImage = useCallback((index: number) => {
    setClickedImageIndex(index);
  }, []);

  const handleUpdateSlides = useCallback((newActiveSlides: number[]) => {
    setActiveSlides(newActiveSlides);
  }, []);

  const handleUpdateThumbnailSlides = useCallback(
    (newActiveSlides: number[]) => {
      setActiveThumbnailSlides(newActiveSlides);
    },
    [],
  );

  const handleShowModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const buildAlt = (index: number) => {
    const base = altPrefix ?? tSeo("imagesAlt.imageListing");
    return `${base} — ${index + 1}/${sortedImages.length}`;
  };

  const generatedCards = sortedImages.map((item, index) => {
    const isPrimaryImage = index === 0;
    return (
      <AspectRatio key={`image_${item.id}`} ratio={4 / 3}>
        <Image
          alt={buildAlt(index)}
          customSrc={item.url}
          fetchPriority={isPrimaryImage ? "high" : "auto"}
          fit="cover"
          loading={isPrimaryImage ? "eager" : "lazy"}
          mah="80dvh"
          w="100%"
        />
      </AspectRatio>
    );
  });

  const mapOtherImages = sortedImages.map((item, index) => {
    const isActive = clickedImageIndex === index;

    return (
      <AspectRatio
        key={`smallImage_${item.id}`}
        mah={128}
        onClick={() => handleClickImage(index)}
        ratio={4 / 3}
        style={{ cursor: "pointer" }}
      >
        <Image
          alt={buildAlt(index)}
          customSrc={item.url}
          fit="cover"
          h="100%"
          mah={96}
          radius="md"
          style={{
            border: `2px solid ${isActive ? colorsMantine.primary : "transparent"}`,
          }}
        />
      </AspectRatio>
    );
  });

  if (sortedImages.length === 0) {
    return (
      <Flex
        align="center"
        bg={`light-dark(${colorsMantine.dark0}, ${colorsMantine.dark5})`}
        direction="column"
        h={320}
        justify="center"
        p={12}
        style={{
          borderRadius: 8,
        }}
        w="100%"
      >
        <IconSeo color={colorsMantine.white} icon={faImages} size="5x" />
      </Flex>
    );
  }

  return (
    <Box>
      <Modal
        onClickOutside={handleCloseModal}
        opened={showModal}
        size="xl"
        withFocusTrap={false}
        withWindowSize={false}
      >
        <Box pos="relative">
          <ErrorBoundary>
            <SliderCustom
              activeSlides={activeSlides}
              centerSlides
              onUpdate={handleUpdateSlides}
              scrollEver={1}
              show={1}
              showPreviousNextSlides={false}
              withArrows={!isMobile}
              withCursorGrabbing={false}
            >
              {generatedCards}
            </SliderCustom>
          </ErrorBoundary>
          <Button
            ariaLabel={tSeo("imagesAlt.clear")}
            color="red"
            onClick={handleCloseModal}
            pos="fixed"
            px={16}
            py={12}
            right={30}
            size="lg"
            top={50}
            variant="filled"
            w="auto"
          >
            <IconSeo icon={faXmark} size="lg" />
          </Button>
        </Box>
      </Modal>
      <Box pos="relative">
        <AspectRatio ratio={4 / 3}>
          <Image
            alt={buildAlt(clickedImageIndex)}
            customSrc={sortedImages[clickedImageIndex]?.url}
            fit="cover"
            radius="md"
            w="100%"
          />
        </AspectRatio>
        <Box
          bg={colorsMantine.whiteOpacity6}
          p={8}
          pos="absolute"
          right={0}
          style={{
            borderBottomLeftRadius: 8,
            zIndex: 1,
          }}
          top={0}
        >
          <Button
            ariaLabel={tSeo("imagesAlt.iconUpRightAndDownLeftFromCenter")}
            onClick={handleShowModal}
            px={8}
            radius={10}
            size="sm"
            variant="filled"
            w={36}
          >
            <IconSeo icon={faUpRightAndDownLeftFromCenter} size="lg" />
          </Button>
        </Box>
      </Box>
      <ErrorBoundary>
        <Box h={106} pt={8}>
          <SliderCustom
            activeSlides={activeThumbnailSlides}
            centerSlidesItemContent={false}
            onUpdate={handleUpdateThumbnailSlides}
            scrollEver={1}
            showPreviousNextSlides
            withArrows={false}
            withCursorGrabbing
            withScrollbar={false}
            {...sliderProps}
          >
            {mapOtherImages}
          </SliderCustom>
        </Box>
      </ErrorBoundary>
    </Box>
  );
};

export default memo(SliderListingsImages);
