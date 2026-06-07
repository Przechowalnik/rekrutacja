import { namespaces } from "~/constants/namespaces";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectUser } from "~/ui/RespectUser";

const AccountPage = dynamic(() =>
  import("~/components/AccountPage").then(module => ({
    default: module.AccountPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.account],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectUser respectUserEmailVerification={false}>
        <AccountPage />
      </RespectUser>
    </RespectLocalization>
  );
}
