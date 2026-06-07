import type { PropsWithChildren } from "react";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router";

import { fetchUserSession } from "~/apiCalls/user";
import { E_Routes } from "~/constants/routes";
import { sessionStorageKeys } from "~/constants/sessionStorage";
import { useFlash } from "~/hooks/useFlash";
import { useLoading } from "~/hooks/useLoading";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useUserCookie } from "~/hooks/useUserCookie";
import { expiryCache } from "~/lib/cache";
import { T_UserCookie, Z_UserCookie } from "~/models/userCookie";
import { type T_UserSession, Z_UserSession } from "~/models/userSession";

export type T_UserContext = {
  forceRefreshData: () => void;
  isAfterGetUser: boolean;
  isAfterGetUserCookie: boolean;
  isUserFetching: boolean;
  logout: () => Promise<void>;
  refreshData: () => void;
  user: null | T_UserSession;
  userCookie: null | T_UserCookie;
};

export const UserContext = createContext<T_UserContext>({
  forceRefreshData: () => {},
  isAfterGetUser: false,
  isAfterGetUserCookie: false,
  isUserFetching: false,
  logout: async () => {},
  refreshData: () => {},
  user: null,
  userCookie: null,
});

export const UserContextProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<null | T_UserSession>(null);
  const [isUserFetching, setIsUserFetching] = useState(false);
  const [isAfterGetUser, setIsAfterGetUser] = useState(false);
  const { flashData } = useFlash();
  const lastRefreshReference = useRef(0);
  const userHadActiveSession = useRef(false);
  const { onChangeLoading } = useLoading();
  const { getLocalizedRoute } = useLocalizedRoute();

  const { isAfterGetUserCookie, onUpdateUserCookie, userCookie } =
    useUserCookie();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAfterGetUserCookie && !userCookie) {
      setIsAfterGetUser(true);
    }
  }, [isAfterGetUserCookie, userCookie]);

  const refreshData = useCallback(async () => {
    const now = Date.now();
    if (now - lastRefreshReference.current < 500) {
      return;
    }
    lastRefreshReference.current = now;

    setIsUserFetching(true);
    const result = await fetchUserSession({
      forceNoCache: false,
    });
    setIsUserFetching(false);
    setIsAfterGetUser(true);

    if (result.isError) {
      navigate(getLocalizedRoute({ route: E_Routes.error }));
      return;
    }

    if (result?.data && "userCookie" in result.data) {
      onUpdateUserCookie(result?.data?.userCookie ?? null);
    }
    setUser(result?.data?.userSession ?? null);
  }, [navigate]);

  const forceRefreshData = useCallback(async () => {
    setIsUserFetching(true);
    const result = await fetchUserSession({
      forceNoCache: true,
    });
    setIsUserFetching(false);
    setIsAfterGetUser(true);

    if (result.isError) {
      navigate(getLocalizedRoute({ route: E_Routes.error }));
      return;
    }

    if (result?.data && "userCookie" in result.data) {
      onUpdateUserCookie(result?.data?.userCookie ?? null);
    }
    setUser(result?.data?.userSession ?? null);
  }, [navigate]);

  const logout = async () => {
    onChangeLoading({
      duration: 0,
      value: true,
    });
    const cacheSession = expiryCache({
      key: sessionStorageKeys.userSession,
      schema: Z_UserSession,
      storage: sessionStorage,
    });

    const cacheCookie = expiryCache({
      key: sessionStorageKeys.userCookie,
      schema: Z_UserCookie,
      storage: sessionStorage,
    });

    setIsAfterGetUser(false);
    setUser(null);
    onUpdateUserCookie(null);
    cacheSession.clear();
    cacheCookie.clear();

    globalThis.location.assign(getLocalizedRoute({ route: E_Routes.logout }));
  };

  useEffect(() => {
    if (!userHadActiveSession.current) {
      userHadActiveSession.current = !!userCookie;
      return;
    }

    if (!userCookie && isAfterGetUserCookie) {
      logout();
    }
  }, [userCookie, isAfterGetUserCookie]);

  const handleUserActions = useCallback(async () => {
    if (flashData?.logout || flashData?.refetchUserSession) {
      if (flashData?.logout) {
        await logout();
        return;
      }

      if (flashData?.refetchUserSession) {
        forceRefreshData();
      }
    }
  }, [flashData, forceRefreshData, logout]);

  useEffect(() => {
    if (flashData?.logout || flashData?.refetchUserSession) {
      handleUserActions();
    }
  }, [flashData]);

  useEffect(() => {
    if (!userCookie?.forceFetchUserData) {
      return;
    }

    forceRefreshData();
  }, [userCookie?.forceFetchUserData]);

  const contextValues = useMemo(() => {
    return {
      forceRefreshData,
      isAfterGetUser,
      isAfterGetUserCookie,
      isUserFetching,
      logout,
      refreshData,
      user,
      userCookie,
    };
  }, [
    forceRefreshData,
    isAfterGetUser,
    isAfterGetUserCookie,
    isUserFetching,
    logout,
    refreshData,
    user,
    userCookie,
  ]);

  return (
    <UserContext.Provider value={contextValues}>
      {children}
    </UserContext.Provider>
  );
};
