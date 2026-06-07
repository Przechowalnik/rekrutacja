import { ErrorLoginFromGooglePage } from "~/components/ErrorLoginFromGooglePage";
import { errorPageLoader } from "~/data/seoStatus.server";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { RespectLocalization } from "~/ui/RespectLocalization";

export const handle = getI18nextNamespaces({
  extraNamespaces: [],
});

export const loader = () => errorPageLoader(404);

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <ErrorLoginFromGooglePage />
    </RespectLocalization>
  );
}
