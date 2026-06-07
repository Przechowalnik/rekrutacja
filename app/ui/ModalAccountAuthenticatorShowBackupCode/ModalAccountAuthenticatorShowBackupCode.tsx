import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { useLayout } from "~/hooks/useLayout";
import { Button } from "~/ui/Button";
import { Modal } from "~/ui/Modal";
import { Section } from "~/ui/Section";
import { Title } from "~/ui/Title";

type T_ModalAccountAuthenticatorShowBackupCode = {
  backupCode: string | undefined;
};

export const ModalAccountAuthenticatorShowBackupCode = ({
  backupCode,
}: T_ModalAccountAuthenticatorShowBackupCode) => {
  const [modalOpen, setModalOpen] = useState(false);

  const { platformColor } = useLayout();
  const { t } = useTranslation(namespaces.accountAuthenticator);

  useEffect(() => {
    setModalOpen(!!backupCode);
  }, [backupCode]);

  const handleOnCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  return (
    <Modal opened={modalOpen} size="md" zIndex={2020}>
      <Section
        buttons={
          <Button onClick={handleOnCloseModal} size="sm" variant="light">
            {t("backup.buttonConfirm")}
          </Button>
        }
        description={t("backup.description")}
        isInModal
        title={t("backup.title")}
      >
        <Title c={platformColor} center fw="bold" order={1}>
          {backupCode}
        </Title>
      </Section>
    </Modal>
  );
};
