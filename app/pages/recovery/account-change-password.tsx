import { RecoveryAccountChangePasswordPage } from "~/components/RecoveryAccountChangePasswordPage";
import { namespaces } from "~/constants/namespaces";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { RespectGoogleRecaptcha } from "~/ui/RespectGoogleRecaptcha";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectNotLoggedUser } from "~/ui/RespectNotLoggedUser";

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.recoveryAccountChangePassword],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectNotLoggedUser>
        <RespectGoogleRecaptcha>
          <RecoveryAccountChangePasswordPage />
        </RespectGoogleRecaptcha>
      </RespectNotLoggedUser>
    </RespectLocalization>
  );
}
