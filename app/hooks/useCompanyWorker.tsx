import { useEffect } from "react";
import { useMatches, useNavigate } from "react-router";

import { E_Routes } from "~/constants/routes";
import type { T_CompanyWorker } from "~/models/company/companyWorker";

import { useLocalizedRoute } from "./useLocalizedRoute";

type MatchLoaderData = {
  companyWorker?: null | T_CompanyWorker;
};

function hasCompanyWorker(loaderData: unknown): loaderData is MatchLoaderData {
  return (
    !!loaderData &&
    typeof loaderData === "object" &&
    "companyWorker" in loaderData
  );
}

export const useCompanyWorker = (properties?: { requireSession: boolean }) => {
  const matches = useMatches();
  const navigate = useNavigate();
  const { getLocalizedRoute } = useLocalizedRoute();

  const requireSession = properties?.requireSession ?? true;

  const matchWithWorkerId = matches.findLast(m => !!m?.params?.workerId);

  let companyWorker: null | T_CompanyWorker = null;

  const loaderData = matchWithWorkerId?.loaderData;

  if (hasCompanyWorker(loaderData)) {
    companyWorker = loaderData.companyWorker ?? null;
  }

  useEffect(() => {
    if (companyWorker || !requireSession) {
      return;
    }

    navigate(
      getLocalizedRoute({
        route: E_Routes.error,
      }),
    );
  }, [companyWorker, requireSession, navigate]);

  return { companyWorker };
};
