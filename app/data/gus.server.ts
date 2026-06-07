import Bir from "bir1";

import { environment } from "./environment.server";

type T_GetGUSCompanyInfo = {
  companyNip: null | number;
};

type T_ResponseGetGUSCompanyInfo = {
  DataZakonczeniaDzialalnosci: null | string;
  Gmina: string;
  KodPocztowy: string;
  Miejscowosc: string;
  MiejscowoscPoczty: string;
  Nazwa: string;
  Nip: string;
  NrLokalu: null | string;
  NrNieruchomosci: string;
  Powiat: string;
  Regon: string;
  SilosID: string;
  StatusNip: null | string;
  Typ: string;
  Ulica: string;
  Wojewodztwo: string;
};

export const getGUSCompanyInfo = async ({
  companyNip = null,
}: T_GetGUSCompanyInfo) => {
  try {
    if (companyNip) {
      const bir = new Bir({ key: environment("GUS_USER_KEY") });
      await bir.login();
      const result: T_ResponseGetGUSCompanyInfo = await bir.search({
        nip: companyNip.toString(),
      });
      return result;
    } else {
      return null;
    }
  } catch {
    return null;
  }
};
