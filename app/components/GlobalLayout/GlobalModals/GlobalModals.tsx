import { useCallback, useEffect, useState } from "react";

import { useUser } from "~/hooks/useUser";
import { ModalConfirmEmail } from "~/ui/ModalConfirmEmail";
import { ModalConfirmPhone } from "~/ui/ModalConfirmPhone";

export const GlobalModals = () => {
  const [modalEmailVerificationOpen, setModalEmailVerificationOpen] =
    useState(false);
  const [modalPhoneVerificationOpen, setModalPhoneVerificationOpen] =
    useState(false);
  const [
    modalPhoneCompanyVerificationOpen,
    setModalPhoneCompanyVerificationOpen,
  ] = useState(false);

  const { refreshData, user } = useUser({
    fetchUserIfNotExist: false,
    requireSession: false,
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user?.emailVerification?.verifiedAt) {
      setModalEmailVerificationOpen(false);
    } else {
      setModalEmailVerificationOpen(true);
      return;
    }

    if (user?.phone) {
      if (user?.phone?.verifiedAt) {
        if (user?.phone?.numberToConfirm && user?.phone?.countryCodeToConfirm) {
          setModalPhoneVerificationOpen(true);
          return;
        } else {
          setModalPhoneVerificationOpen(false);
        }
      } else if (
        user?.phone?.countryCodeToConfirm &&
        user?.phone?.numberToConfirm
      ) {
        setModalPhoneVerificationOpen(true);
        return;
      } else {
        setModalPhoneVerificationOpen(false);
      }
    }

    if (!user?.company) {
      return;
    }

    if (
      user?.company?.phone?.numberToConfirm &&
      user?.company?.phone?.countryCodeToConfirm
    ) {
      setModalPhoneCompanyVerificationOpen(true);
    } else {
      setModalPhoneCompanyVerificationOpen(false);
    }
  }, [user]);

  const handleOnSuccess = useCallback(() => {
    setModalEmailVerificationOpen(false);
    refreshData();
  }, []);

  const handleCloseModalCompanyPhone = useCallback(() => {
    setModalPhoneCompanyVerificationOpen(false);
  }, []);

  const handleCloseModalPhone = useCallback(() => {
    setModalPhoneVerificationOpen(false);
  }, []);

  const handleModalPhoneOnSuccess = useCallback(() => {
    setModalPhoneVerificationOpen(false);
    refreshData();
  }, []);

  const handleModalCompanyPhoneOnSuccess = useCallback(() => {
    setModalPhoneCompanyVerificationOpen(false);
    refreshData();
  }, []);

  const handleCloseConfirmEmail = useCallback(() => {
    setModalEmailVerificationOpen(false);
  }, []);

  if (!user) {
    return;
  }

  return (
    <>
      <ModalConfirmEmail
        onClose={handleCloseConfirmEmail}
        onSuccess={handleOnSuccess}
        opened={modalEmailVerificationOpen}
      />
      <ModalConfirmPhone
        onClose={handleCloseModalPhone}
        onSuccess={handleModalPhoneOnSuccess}
        opened={modalPhoneVerificationOpen}
        withButtonRollBack
      />
      <ModalConfirmPhone
        onClose={handleCloseModalCompanyPhone}
        onSuccess={handleModalCompanyPhoneOnSuccess}
        opened={modalPhoneCompanyVerificationOpen}
        toCompany
        withButtonRollBack={!!user?.company?.phone?.verifiedAt}
      />
    </>
  );
};
