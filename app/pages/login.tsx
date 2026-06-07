import { LoginPage } from "~/components/LoginPage";
import { namespaces } from "~/constants/namespaces";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { RespectGoogleRecaptcha } from "~/ui/RespectGoogleRecaptcha";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectNotLoggedUser } from "~/ui/RespectNotLoggedUser";

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.login],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectNotLoggedUser>
        <RespectGoogleRecaptcha>
          <LoginPage />
        </RespectGoogleRecaptcha>
      </RespectNotLoggedUser>
    </RespectLocalization>
  );
}
