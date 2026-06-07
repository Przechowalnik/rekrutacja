import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";

import { Button } from "../Button";
import { ButtonArrowLeft } from "../ButtonArrowLeft";
import { Modal } from "../Modal";
import { Section } from "../Section";

type T_ModalCondition = {
  onClose?: () => void;
  onSuccess: () => void;
  opened: boolean;
};

export const ModalCondition = ({
  onClose,
  onSuccess,
  opened,
}: T_ModalCondition) => {
  const { t } = useTranslation(namespaces.common);

  return (
    <Modal opened={opened} size="lg" zIndex={2020}>
      <Section
        buttons={
          <>
            {onClose && <ButtonArrowLeft onClick={onClose} size="sm" />}
            <Button onClick={onSuccess} size="sm">
              {t("modalCondition.buttonSave")}
            </Button>
          </>
        }
        description={t("modalCondition.description")}
        isInModal
        title={t("modalCondition.title")}
      ></Section>
    </Modal>
  );
};
