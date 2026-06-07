import type { PropsWithChildren } from "react";
import { createContext, useMemo, useState } from "react";

import { useConfetti } from "~/hooks/useConfetti";

type T_OnChangeModalName = {
  newModalName: null | string;
  withConfetti: boolean;
};

export type T_GlobalGeneratedModalContext = {
  isGeneratedModalOpen: boolean;
  modalName: null | string;
  onChangeModalName: (properties: T_OnChangeModalName) => void;
  onCloseModal: () => void;
};

export const GlobalGeneratedModalContext =
  createContext<T_GlobalGeneratedModalContext>({
    isGeneratedModalOpen: false,
    modalName: null,
    onChangeModalName: () => {},
    onCloseModal: () => {},
  });

export const GlobalGeneratedModalContextProvider = ({
  children,
}: PropsWithChildren) => {
  const [isGeneratedModalOpen, setIsGeneratedModalOpen] = useState(false);
  const [modalName, setModalName] = useState<null | string>(null);
  const { onChangeConfetti } = useConfetti();

  const onChangeModalName = ({
    newModalName,
    withConfetti,
  }: T_OnChangeModalName) => {
    setModalName(newModalName);
    if (newModalName) {
      setTimeout(() => {
        setIsGeneratedModalOpen(true);
        if (withConfetti) {
          onChangeConfetti(true);
        }
      }, 300);
    }
  };

  const onCloseModal = () => {
    setIsGeneratedModalOpen(false);
    onChangeConfetti(false);
    setTimeout(() => {
      setModalName(null);
    }, 300);
  };

  const contextValues = useMemo(() => {
    return {
      isGeneratedModalOpen,
      modalName,
      onChangeModalName,
      onCloseModal,
    };
  }, [isGeneratedModalOpen, modalName, onChangeModalName, onCloseModal]);

  return (
    <GlobalGeneratedModalContext.Provider value={contextValues}>
      {children}
    </GlobalGeneratedModalContext.Provider>
  );
};
