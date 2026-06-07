import { Loader as MantineLoader } from "@mantine/core";
import { useEffect, useState } from "react";

import { useLayout } from "~/hooks/useLayout";

import { ModalWithoutClearup } from "../Modal";

type T_Loader = {
  isLoading: boolean;
};

export const Loader = ({ isLoading }: T_Loader) => {
  const [showModal, setShowModal] = useState(false);

  const { isMobileDevice } = useLayout();

  useEffect(() => {
    if (isLoading) {
      setShowModal(true);
      return;
    }

    const timer = setTimeout(() => {
      setShowModal(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [isLoading]);

  return (
    <ModalWithoutClearup
      opened={showModal}
      withDisableScroll={!isMobileDevice}
      withFocusTrap={false}
      withWindowSize={false}
      zIndex={3020}
    >
      <MantineLoader color="white" size="lg" />
    </ModalWithoutClearup>
  );
};
