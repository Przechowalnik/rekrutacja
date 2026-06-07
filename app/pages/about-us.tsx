import { AboutUsPage } from "~/components/AboutUsPage";
import { namespaces } from "~/constants/namespaces";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { RespectLocalization } from "~/ui/RespectLocalization";

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.aboutUs],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <AboutUsPage />
    </RespectLocalization>
  );
}
