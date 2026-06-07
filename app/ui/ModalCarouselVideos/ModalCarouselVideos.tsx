import { Carousel } from "@mantine/carousel";
import { lazy, memo, useState } from "react";

const ReactPlayer = lazy(() => import("react-player"));

import { Box } from "@mantine/core";

import { Button } from "../Button";
import { Modal } from "../Modal";

type T_ModalCarouselVideos = {
  button: string;
  urls: string[];
};

const ModalCarouselVideos = ({ button, urls }: T_ModalCarouselVideos) => {
  const [opened, setOpened] = useState(false);

  const mapVideos = urls?.map(item => {
    return (
      <Carousel.Slide key={`video_${item}`}>
        <ReactPlayer
          controls={true}
          fallback
          height="100%"
          playing={false}
          url={item}
          width="100%"
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
        withWindowSize={false}
      >
        <Box mah="70dvh">
          <Carousel
            bg="transparent"
            controlSize={27}
            maw="100%"
            slideGap="md"
            slideSize="100%"
            withControls={urls?.length > 1}
            withIndicators
          >
            {mapVideos}
          </Carousel>
        </Box>
      </Modal>
    </>
  );
};

export default memo(ModalCarouselVideos);
