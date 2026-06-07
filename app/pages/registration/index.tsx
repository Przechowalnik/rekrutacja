import { RegistrationPage } from "~/components/RegistrationPage";
import { namespaces } from "~/constants/namespaces";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectNotLoggedUser } from "~/ui/RespectNotLoggedUser";

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.registration],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectNotLoggedUser>
        <RegistrationPage />
      </RespectNotLoggedUser>
    </RespectLocalization>
  );
}
