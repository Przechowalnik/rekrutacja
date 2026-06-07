import { useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { type T_ListingDeleteReason } from "~/models/enums";

import { Button } from "../Button";
import { ButtonArrowLeft } from "../ButtonArrowLeft";
import { Modal } from "../Modal";
import { Section } from "../Section";
import { SelectListingDeleteReason } from "../SelectListingDeleteReason";

type T_ModalDeleteListingReason = {
  onClose: () => void;
  onSuccess: (reason: T_ListingDeleteReason) => void;
  opened: boolean;
};

export const ModalDeleteListingReason = ({
  onClose,
  onSuccess,
  opened,
}: T_ModalDeleteListingReason) => {
  const { t } = useTranslation(namespaces.common);
  const [selectedReason, setSelectedReason] =
    useState<null | T_ListingDeleteReason>(null);

  const handleConfirm = () => {
    if (selectedReason) {
      onSuccess(selectedReason);
      setSelectedReason(null);
    }
  };

  const handleClose = () => {
    setSelectedReason(null);
    onClose();
  };

  return (
    <Modal opened={opened} size="lg" zIndex={2020}>
      <Section
        buttons={
          <>
            <ButtonArrowLeft onClick={handleClose} size="sm" />
            <Button
              disabled={!selectedReason}
              onClick={handleConfirm}
              size="sm"
            >
              {t("modalDeleteListingReason.buttonConfirm")}
            </Button>
          </>
        }
        description={t("modalDeleteListingReason.description")}
        isInModal
        title={t("modalDeleteListingReason.title")}
      >
        <SelectListingDeleteReason
          label={t("inputs.listingDeleteReason")}
          onChange={value =>
            setSelectedReason((value as T_ListingDeleteReason) ?? null)
          }
          required
          value={selectedReason}
        />
      </Section>
    </Modal>
  );
};
