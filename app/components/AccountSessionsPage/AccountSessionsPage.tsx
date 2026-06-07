import { type MouseEvent, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { dynamic } from "~/hoc/dynamic";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSubmitWithActions } from "~/hooks/useSubmitWithActions";
import { formNames } from "~/lib/zodFormValidator";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { Section } from "~/ui/Section";
import { convertToFormData } from "~/utilities/form";

const ModalAuthenticator = dynamic(() =>
  import("~/ui/ModalAuthenticator").then(module => ({
    default: module.ModalAuthenticator,
  })),
);

export const AccountSessionsPage = () => {
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);
  const { getLocalizedRoute } = useLocalizedRoute();

  const { t } = useTranslation(namespaces.accountSessions);
  const submit = useSubmitWithActions();

  const handleSubmit = (event: MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    setAuthenticatorOpen(true);
  };

  const handleCloseAuthenticator = useCallback(() => {
    setAuthenticatorOpen(false);
  }, []);

  const handleAuthenticatorOnSuccess = useCallback(
    async (authenticator: number | string) => {
      setAuthenticatorOpen(false);

      submit(
        convertToFormData({
          [formNames.authenticator]: authenticator,
        }),
        {
          action: getLocalizedRoute({
            route: E_Routes.accountSessions,
          }),
          method: "patch",
        },
      );
    },
    [],
  );

  return (
    <>
      <ModalAuthenticator
        onClose={handleCloseAuthenticator}
        onSuccess={handleAuthenticatorOnSuccess}
        opened={authenticatorOpen}
      />
      <Section
        breadcrumbs={[E_Routes.home, E_Routes.account, E_Routes.accountDelete]}
        buttons={
          <>
            <ButtonArrowLeft routeTo={E_Routes.account} />
            <Button color="red" onClick={handleSubmit} variant="filled">
              {t("buttonSave")}
            </Button>
          </>
        }
        description={t("description")}
        pageMeta={{
          route: E_Routes.accountDelete,
        }}
        size="md"
        title={t("title")}
      ></Section>
    </>
  );
};
