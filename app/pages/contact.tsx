import { ContactPage } from "~/components/ContactPage";
import { namespaces } from "~/constants/namespaces";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { RespectLocalization } from "~/ui/RespectLocalization";

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.contact],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <ContactPage />
    </RespectLocalization>
  );
}
