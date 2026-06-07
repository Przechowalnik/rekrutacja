import { namespaces } from "~/constants/namespaces";
import { resources } from "~/localization/resources";
import { E_Language } from "~/models/enums";

export default {
  defaultNS: namespaces.common,
  fallbackLng: E_Language.PL.toLowerCase(),
  interpolation: {
    escapeValue: false,
  },
  react: { useSuspense: false },
  resources,
  returnEmptyString: true,
  supportedLngs: [E_Language.EN.toLowerCase(), E_Language.PL.toLowerCase()],
};
