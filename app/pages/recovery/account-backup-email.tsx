import { RecoveryAccountBackupEmailPage } from "~/components/RecoveryAccountBackupEmailPage";
import { namespaces } from "~/constants/namespaces";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { RespectLocalization } from "~/ui/RespectLocalization";

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.recoveryAccountBackupEmail],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RecoveryAccountBackupEmailPage />
    </RespectLocalization>
  );
}
