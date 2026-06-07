import { RegistrationCompanyPage } from "~/components/RegistrationCompanyPage";
import { namespaces } from "~/constants/namespaces";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { RespectCreateOrLoginCompany } from "~/ui/RespectCreateOrLoginCompany";
import { RespectGoogleRecaptcha } from "~/ui/RespectGoogleRecaptcha";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectNotLoggedUser } from "~/ui/RespectNotLoggedUser";

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.registrationCompany],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectCreateOrLoginCompany>
        <RespectNotLoggedUser>
          <RespectGoogleRecaptcha>
            <RegistrationCompanyPage />
          </RespectGoogleRecaptcha>
        </RespectNotLoggedUser>
      </RespectCreateOrLoginCompany>
    </RespectLocalization>
  );
}
