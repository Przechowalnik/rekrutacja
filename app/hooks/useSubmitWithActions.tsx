/* eslint-disable @typescript-eslint/no-explicit-any */

import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { SubmitFunction } from "react-router";
import {
  useActionData,
  useNavigate,
  useNavigation,
  useSubmit,
} from "react-router";

import { namespaces } from "~/constants/namespaces";
import type { T_GetRouteExtraQuery, T_RouteName } from "~/constants/routes";
import type localesNotificationsPL from "~/locales/pl/notifications.json";
import { reduceToUniqueFields } from "~/utilities/functions";
import { trackByMessage } from "~/utilities/tracking";

import { useGlobalGeneratedModalContext } from "./useGlobalGeneratedModalContext";
import { useLoading } from "./useLoading";
import { useLocalizedRoute } from "./useLocalizedRoute";
import { useUser } from "./useUser";

type T_Messages = keyof typeof localesNotificationsPL;
type T_RedirectTo = {
  extraPath?: string;
  extraQuery?: T_GetRouteExtraQuery;
  route: T_RouteName;
};

type T_UseSubmitWithActionsActionData = {
  formErrors?: {
    field: string;
    message: string;
  }[];
  message?: T_Messages;
  modal?: string;
  redirectTo?: T_RedirectTo | T_RouteName;
  refetchUserSession?: boolean;
  status?: number;
};

export const useSubmitWithActions = (properties?: {
  disabledAlert?: boolean;
  disabledFormErrors?: boolean;
  disabledRedirect?: boolean;
  onSuccessRefetchUserData?: boolean;
  onUpdateSubmitData?: (actionData: unknown) => void;
}): SubmitFunction => {
  const [actionDataHook, setActionDataHook] =
    useState<null | T_UseSubmitWithActionsActionData>(null);

  const { t } = useTranslation(namespaces.notifications);
  const { t: tModals } = useTranslation(namespaces.modals);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { onChangeModalName } = useGlobalGeneratedModalContext();
  const actionData = useActionData<T_UseSubmitWithActionsActionData>();
  const submit = useSubmit();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const { getLocalizedRoute } = useLocalizedRoute();
  const { onChangeLoading } = useLoading();
  const { forceRefreshData, logout } = useUser({
    fetchUserIfNotExist: false,
    requireSession: false,
  });

  useEffect(() => {
    onChangeLoading({
      value: navigation.state === "submitting",
    });
  }, [navigation.state]);

  useEffect(() => {
    setActionDataHook(actionData ?? null);
  }, [actionData]);

  useEffect(() => {
    if (!actionData) {
      return;
    }

    const run = async () => {
      const isErrorStatus = (actionData?.status ?? 200) >= 400;

      if (!isErrorStatus) {
        properties?.onUpdateSubmitData?.(actionData);
      }

      if (actionData?.message && !properties?.disabledAlert) {
        notifications.show({
          color: isErrorStatus ? "red" : "green",
          message: t(`${actionData?.message}.message` as any),
          title: t(`${actionData?.message}.title` as any),
        });
        if (actionData?.status === 401) {
          await logout();
          return;
        }
      }

      if (!isErrorStatus && actionData?.message) {
        trackByMessage(actionData.message);
      }

      if (
        actionData?.formErrors &&
        Array.isArray(actionData.formErrors) &&
        !properties?.disabledFormErrors
      ) {
        const reducedArray = reduceToUniqueFields(actionData.formErrors);
        for (const formError of reducedArray) {
          notifications.show({
            color: "red",
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            message: t(`${formError?.message}.message`),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            title: `${t(`${formError?.message}.title`)} ${tCommon(`inputs.${formError?.field}`)}`,
          });
        }
      }

      if (
        actionData?.modal &&
        tModals(`${actionData?.modal}.title` as any) !==
          `${actionData?.modal}.title` &&
        tModals(`${actionData?.modal}.description` as any) !==
          `${actionData?.modal}.description`
      ) {
        onChangeModalName({
          newModalName: actionData?.modal,
          withConfetti:
            tModals(`${actionData?.modal}.confetti` as any) === "true",
        });
      }
      if (
        actionData?.refetchUserSession ||
        properties?.onSuccessRefetchUserData
      ) {
        forceRefreshData();
      }

      if (actionData?.redirectTo && !properties?.disabledRedirect) {
        const redirectTo = actionData.redirectTo;
        const path =
          typeof redirectTo === "string"
            ? getLocalizedRoute({ route: redirectTo })
            : getLocalizedRoute({
                extraPath: redirectTo.extraPath,
                route: redirectTo.route,
              });
        navigate(path);
      }
    };

    run();
  }, [actionDataHook]);

  return submit;
};
