import { type PropsWithChildren, useEffect } from "react";
import { useNavigate } from "react-router";

import { E_Routes } from "~/constants/routes";
import { useCompanyWorker } from "~/hooks/useCompanyWorker";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useUser } from "~/hooks/useUser";
import {
  allRoles,
  E_Roles,
  type T_CompanyWorkerPermissions,
  type T_PlanType,
  type T_Roles,
} from "~/models/enums";
import {
  checkCompanySubscriptionIsActive,
  checkIfUserHasActivePlanTypes,
} from "~/utilities/functions";

import { RespectClientSideRendering } from "../RespectClientSideRendering";

type T_RespectUser = {
  activeFreeTrialOrSubscriptionCompany?: boolean;
  companyPlanTypes?: T_PlanType[];
  redirectOnError?: E_Routes;
  respectCompany?: boolean;
  respectCompanyPhoneVerification?: boolean;
  respectCompanyPhoneVerificationWhenIsAddedRespectCompany?: boolean;
  respectCompanyWorkerId?: boolean;
  respectUserEmailVerification?: boolean;
  respectUserPhoneVerification?: boolean;
  skipsPermissionsIfUserIsCompanyWorker?: boolean;
  userCompanyPermissions?: T_CompanyWorkerPermissions[];
  userRoles?: T_Roles[];
  workerCompanyPermissions?: T_CompanyWorkerPermissions[];
  workerCompanyRoles?: T_Roles[];
};

const RespectUserAfterClientSideRendering = ({
  activeFreeTrialOrSubscriptionCompany = false,
  children,
  companyPlanTypes,
  redirectOnError,
  respectCompany = false,
  respectCompanyPhoneVerification,
  respectCompanyPhoneVerificationWhenIsAddedRespectCompany = true,
  respectCompanyWorkerId = false,
  respectUserEmailVerification = true,
  respectUserPhoneVerification,
  skipsPermissionsIfUserIsCompanyWorker = false,
  userCompanyPermissions = [],
  userRoles = allRoles,
  workerCompanyPermissions = [],
  workerCompanyRoles,
}: PropsWithChildren<T_RespectUser>) => {
  const { isAfterGetUser, isAfterGetUserCookie, user, userCookie } = useUser();
  const { companyWorker } = useCompanyWorker({
    requireSession: respectCompanyWorkerId,
  });
  const { getLocalizedRoute } = useLocalizedRoute();

  const navigate = useNavigate();
  const userRespectRole = user?.role ? userRoles.includes(user?.role) : false;

  let isForceUserIsCompanyWorker = false;
  let isErrorInSkipsPermissionsIfUserIsCompanyWorker = false;

  const userHasVerifiedPhone = respectUserPhoneVerification
    ? user?.phone?.verifiedAt && user?.phone?.number && user?.phone?.countryCode
    : true;

  const companyHasVerifiedPhone = respectCompanyPhoneVerification
    ? user?.company?.phone?.verifiedAt &&
      user?.company?.phone?.number &&
      user?.company?.phone?.countryCode
    : true;

  if (skipsPermissionsIfUserIsCompanyWorker) {
    if (user?.id && companyWorker?.id) {
      isForceUserIsCompanyWorker = user.id === companyWorker.id;
    } else {
      isErrorInSkipsPermissionsIfUserIsCompanyWorker = true;
    }
  }

  let userRespectUserCompanyPermissions = true;
  if (
    (user?.workerSettings || user?.company) &&
    user?.role !== E_Roles.B2B_OWNER &&
    userCompanyPermissions.length > 0 &&
    !isForceUserIsCompanyWorker
  ) {
    userRespectUserCompanyPermissions = userCompanyPermissions.some(item =>
      user?.workerSettings?.permissions?.includes(item),
    );
  }

  let workerRespectCompanyPermissions = true;
  if (
    companyWorker &&
    companyWorker?.role !== E_Roles.B2B_OWNER &&
    workerCompanyPermissions.length > 0 &&
    !isForceUserIsCompanyWorker
  ) {
    workerRespectCompanyPermissions =
      workerCompanyPermissions?.some(item =>
        companyWorker?.workerSettings?.permissions?.includes(item),
      ) ?? false;
  }

  let workerRespectCompanyRoles = true;
  if (workerCompanyRoles) {
    workerRespectCompanyRoles = companyWorker?.role
      ? workerCompanyRoles?.includes(companyWorker?.role)
      : false;
  }

  let respectActiveFreeTrialOrSubscriptionCompany =
    !activeFreeTrialOrSubscriptionCompany;
  if (user?.company && activeFreeTrialOrSubscriptionCompany) {
    respectActiveFreeTrialOrSubscriptionCompany =
      checkCompanySubscriptionIsActive({ company: user?.company });
  }

  const userRespectPlanTypes = companyPlanTypes
    ? checkIfUserHasActivePlanTypes({
        planTypes: companyPlanTypes,
        user,
      })
    : true;

  const redirectToOtherSite =
    !user ||
    !userHasVerifiedPhone ||
    !companyHasVerifiedPhone ||
    !userRespectPlanTypes ||
    (respectCompany && !user?.company) ||
    !userRespectRole ||
    !userRespectUserCompanyPermissions ||
    !workerRespectCompanyPermissions ||
    !workerRespectCompanyRoles ||
    !respectActiveFreeTrialOrSubscriptionCompany ||
    isErrorInSkipsPermissionsIfUserIsCompanyWorker ||
    (respectUserEmailVerification
      ? !user?.emailVerification?.verifiedAt
      : false) ||
    (respectCompanyPhoneVerificationWhenIsAddedRespectCompany &&
      respectCompany &&
      !user?.company?.phone?.verifiedAt);

  useEffect(() => {
    const shouldWait = (() => {
      if (!isAfterGetUserCookie || !isAfterGetUser) {
        return true;
      }
      if (user && userCookie) {
        return false;
      }

      return true;
    })();

    if (shouldWait) {
      return;
    }

    if (redirectToOtherSite) {
      navigate(
        getLocalizedRoute({
          route:
            redirectOnError ?? (userCookie ? E_Routes.error : E_Routes.login),
        }),
      );
      return;
    }
  }, [
    user,
    redirectToOtherSite,
    isAfterGetUser,
    userCookie,
    isAfterGetUserCookie,
    redirectOnError,
    getLocalizedRoute,
    navigate,
  ]);

  if (redirectToOtherSite || !isAfterGetUser || !user) {
    return null;
  }

  return <>{children}</>;
};

export const RespectUser = (properties: PropsWithChildren<T_RespectUser>) => {
  return (
    <RespectClientSideRendering>
      <RespectUserAfterClientSideRendering {...properties} />
    </RespectClientSideRendering>
  );
};
