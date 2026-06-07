import { namespaces } from "~/constants/namespaces";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectUser } from "~/ui/RespectUser";

const CompanyPointsPage = dynamic(() =>
  import("~/components/CompanyPointsPage").then(module => ({
    default: module.CompanyPointsPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.companyPoints],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectUser respectCompany userRoles={[E_Roles.B2B_OWNER]}>
        <CompanyPointsPage />
      </RespectUser>
    </RespectLocalization>
  );
}
