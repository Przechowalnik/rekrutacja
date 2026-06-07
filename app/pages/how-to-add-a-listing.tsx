import { HowToAddListing } from "~/components/HowToAddListing";
import { namespaces } from "~/constants/namespaces";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { RespectLocalization } from "~/ui/RespectLocalization";

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.howToAddListing],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <HowToAddListing />
    </RespectLocalization>
  );
}
