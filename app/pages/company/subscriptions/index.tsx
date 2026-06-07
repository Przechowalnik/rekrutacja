import { namespaces } from "~/constants/namespaces";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectNotFreeListings } from "~/ui/RespectNotFreeListings";
import { RespectUser } from "~/ui/RespectUser";

const CompanySubscriptionsPage = dynamic(() =>
  import("~/components/CompanySubscriptionsPage").then(module => ({
    default: module.CompanySubscriptionsPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.companySubscriptions],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectNotFreeListings>
        <RespectUser respectCompany userRoles={[E_Roles.B2B_OWNER]}>
          <CompanySubscriptionsPage />
        </RespectUser>
      </RespectNotFreeListings>
    </RespectLocalization>
  );
}
