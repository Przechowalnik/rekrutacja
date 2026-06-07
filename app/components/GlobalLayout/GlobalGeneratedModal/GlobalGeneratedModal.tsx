/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PropsWithChildren } from "react";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { useFlash } from "~/hooks/useFlash";
import { useGlobalGeneratedModalContext } from "~/hooks/useGlobalGeneratedModalContext";
import { Button } from "~/ui/Button";
import { Modal } from "~/ui/Modal";
import { Section } from "~/ui/Section";

export const GlobalGeneratedModal = ({ children }: PropsWithChildren) => {
  const { t } = useTranslation(namespaces.modals);
  const { flashData } = useFlash();
  const { isGeneratedModalOpen, modalName, onChangeModalName, onCloseModal } =
    useGlobalGeneratedModalContext();

  const handleGenerateModals = useCallback(() => {
    if (!flashData?.modal) {
      return;
    }

    const modal = flashData.modal;

    if (t(`${modal}.title` as any) === `${modal}.title`) {
      return;
    }

    if (t(`${modal}.description` as any) === `${modal}.description`) {
      return;
    }

    onChangeModalName({
      newModalName: modal,
      withConfetti: t(`${modal}.confetti` as any) === "true",
    });
  }, [flashData, t]);

  useEffect(() => {
    if (!flashData?.modal) {
      return;
    }

    handleGenerateModals();
  }, [flashData]);

  return (
    <>
      {children}
      {modalName && (
        <Modal
          onClickOutside={onCloseModal}
          opened={isGeneratedModalOpen && !!modalName}
          size="lg"
          zIndex={100}
        >
          <Section
            buttons={<Button onClick={onCloseModal}>{t("buttonClose")}</Button>}
            description={t(`${modalName}.description` as any)}
            isInModal
            title={t(`${modalName}.title` as any)}
            withHTML={false}
            withTextsToUi
          />
        </Modal>
      )}
    </>
  );
};
