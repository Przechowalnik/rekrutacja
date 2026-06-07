import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useActionData, useNavigate, useSearchParams } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { queryKey } from "~/constants/queryAndHashes";
import { E_Routes } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSubmitWithActions } from "~/hooks/useSubmitWithActions";
import { formNames } from "~/lib/zodFormValidator";
import { Section } from "~/ui/Section";
import { convertToFormData } from "~/utilities/form";

export const RecoveryAccountBackupEmailPage = () => {
  const [startRecoveryAccount, setStartRecoveryAccount] = useState(false);

  const { t } = useTranslation(namespaces.recoveryAccountBackupEmail);
  const [searchParameters] = useSearchParams();
  const navigate = useNavigate();
  const submit = useSubmitWithActions();
  const { getLocalizedRoute } = useLocalizedRoute();
  const actionData = useActionData<{
    data?: unknown;
    message?: string;
  }>();

  useEffect(() => {
    if (!startRecoveryAccount) {
      return;
    }

    if (actionData?.message || actionData?.data) {
      navigate(
        getLocalizedRoute({
          route: E_Routes.home,
        }),
      );
      return;
    }
  }, [actionData, startRecoveryAccount]);

  useEffect(() => {
    if (startRecoveryAccount) {
      return;
    }

    const code = searchParameters.get(queryKey.code);
    const userId = searchParameters.get(queryKey.userId);

    if (!code || !userId) {
      navigate(
        getLocalizedRoute({
          route: E_Routes.home,
        }),
      );
      return;
    }

    submit(
      convertToFormData({
        [formNames.code]: code,
        [formNames.userId]: userId,
      }),
      {
        action: getLocalizedRoute({
          route: E_Routes.apiRecoveryAccountBackupEmail,
        }),
        method: "post",
      },
    );
    setStartRecoveryAccount(false);
  }, [searchParameters, startRecoveryAccount]);

  return (
    <Section
      breadcrumbs={[E_Routes.home, E_Routes.recoveryAccountBackupEmail]}
      description={t("description")}
      pageMeta={{
        route: E_Routes.recoveryAccountBackupEmail,
      }}
      title={t("title")}
    ></Section>
  );
};
