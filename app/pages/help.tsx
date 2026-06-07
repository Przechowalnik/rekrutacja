import { HelpPage } from "~/components/HelpPage";
import { namespaces } from "~/constants/namespaces";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { RespectLocalization } from "~/ui/RespectLocalization";

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.help],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <HelpPage />
    </RespectLocalization>
  );
}
