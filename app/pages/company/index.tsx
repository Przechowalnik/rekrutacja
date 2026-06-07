import { namespaces } from "~/constants/namespaces";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectUser } from "~/ui/RespectUser";

const CompanyPage = dynamic(() =>
  import("~/components/CompanyPage").then(module => ({
    default: module.CompanyPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.company],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectUser
        respectCompany
        respectCompanyPhoneVerificationWhenIsAddedRespectCompany={false}
        respectUserEmailVerification={false}
      >
        <CompanyPage />
      </RespectUser>
    </RespectLocalization>
  );
}
