import { Carousel } from "@mantine/carousel";
import { Box } from "@mantine/core";
import { memo, useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";

import { Button } from "../Button";
import { Image } from "../Image";
import { Modal } from "../Modal";

type T_ModalCarouselImages = {
  button: string;
  urls: string[];
};

const ModalCarouselImages = ({ button, urls }: T_ModalCarouselImages) => {
  const [opened, setOpened] = useState(false);

  const { t: tSeo } = useTranslation(namespaces.seo);

  const mapImages = urls?.map(item => {
    return (
      <Carousel.Slide key={`image_${item}`}>
        <Image
          alt={tSeo("imagesAlt.modalCarouselItem")}
          customSrc={item}
          maw="100%"
          radius="md"
        />
      </Carousel.Slide>
    );
  });

  return (
    <>
      <Button
        disabled={urls?.length === 0}
        fullWidth
        onClick={() => setOpened(true)}
      >
        {button}
      </Button>
      <Modal
        onClickOutside={() => setOpened(false)}
        opened={opened}
        size="lg"
        withFocusTrap={false}
      >
        <Box mah="70dvh">
          <Carousel
            bg="transparent"
            controlSize={27}
            mah="70%"
            maw="100%"
            slideGap="md"
            slideSize="70%"
            withIndicators
          >
            {mapImages}
          </Carousel>
        </Box>
      </Modal>
    </>
  );
};

export default memo(ModalCarouselImages);
