import { SearchListingCategoriesPage } from "~/components/SearchListingCategoriesPage";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { RespectLocalization } from "~/ui/RespectLocalization";

export const handle = getI18nextNamespaces({
  extraNamespaces: [],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <SearchListingCategoriesPage />
    </RespectLocalization>
  );
}
