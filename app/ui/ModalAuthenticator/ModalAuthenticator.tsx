import type { PropsWithChildren } from "react";
import { useCallback, useState } from "react";

import { useUser } from "~/hooks/useUser";

import { WrapperRemoveOnHidden } from "../WrapperRemoveOnHidden";
import { ModalAuthenticatorForm } from "./ModalAuthenticatorForm";
import { ModalAuthenticatorReset2Fa } from "./ModalAuthenticatorReset2Fa";

export type T_ModalAuthenticatorNoLoggedUser = {
  authenticator2FAEnabled: boolean;
  authenticatorEmailOTPEnabled: boolean;
  authenticatorPassword: boolean;
  onSuccessReset2FA?: () => void;
  userId: string;
};

type T_ModalAuthenticator = {
  alert?: string;
  noLoggedUser?: T_ModalAuthenticatorNoLoggedUser;
  onClose: () => void;
  onSuccess: (authenticator: number | string) => void;
  opened: boolean;
};

export const ModalAuthenticator = ({
  alert,
  noLoggedUser,
  onClose = () => {},
  onSuccess,
  opened = false,
}: T_ModalAuthenticator) => {
  const [reset2FAOpen, setReset2FAOpen] = useState(false);

  const { user } = useUser({
    requireSession: false,
  });

  const enabledEmailOTP =
    (noLoggedUser?.authenticatorEmailOTPEnabled ||
      user?.authenticatorEmailOTP?.enabledAt) ??
    false;

  const enabled2FA =
    (noLoggedUser?.authenticator2FAEnabled ||
      user?.authenticator2FA?.enabledAt) ??
    false;

  let enabledPassword = noLoggedUser?.authenticatorPassword ?? false;
  if (
    user &&
    !user?.authenticatorEmailOTP?.enabledAt &&
    !user?.authenticator2FA?.enabledAt
  ) {
    enabledPassword = true;
  }

  const enabledReset2FA = opened && reset2FAOpen && enabled2FA;
  const userId = noLoggedUser
    ? (noLoggedUser.userId ?? null)
    : (user?.id ?? null);

  const handleToggleReset2FA = useCallback(() => {
    setReset2FAOpen(previousState => !previousState);
  }, []);

  const handleCloseAllAuthenticator = () => {
    onClose();
    setReset2FAOpen(false);
  };

  return (
    <>
      <ModalAuthenticatorReset2Fa
        handleCloseAllAuthenticator={handleCloseAllAuthenticator}
        onClose={handleToggleReset2FA}
        opened={!!enabledReset2FA}
        userId={userId}
      />
      <ModalAuthenticatorForm
        alert={alert}
        enabled2FA={!!enabled2FA}
        enabledEmailOTP={!!enabledEmailOTP}
        enabledPassword={enabledPassword}
        handleToggleReset2FA={handleToggleReset2FA}
        noLoggedUser={noLoggedUser}
        onClose={onClose}
        onSuccess={onSuccess}
        opened={opened && !enabledReset2FA}
      />
    </>
  );
};

export const ModalWrapper = (
  properties: PropsWithChildren<T_ModalAuthenticator>,
) => {
  return (
    <WrapperRemoveOnHidden opened={properties.opened}>
      {({ visible }) => <ModalAuthenticator {...properties} opened={visible} />}
    </WrapperRemoveOnHidden>
  );
};
