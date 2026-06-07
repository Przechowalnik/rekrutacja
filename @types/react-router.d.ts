import type localesNotificationsPL from "public/locales/pl/notifications.json";

type HeadersInit = Headers | string[][] | Record<string, string>;
interface ResponseInit {
  headers?: HeadersInit;
  status?: number;
  statusText?: string;
}

type TypedResponse<T> = Promise<T>;
export type T_Messages = keyof typeof localesNotificationsPL;
declare module "@react-router/node" {
  export function data<Data>(
    data: Data & { message?: T_Messages | null },
    init?: number | ResponseInit,
  ): TypedResponse<Data>;
}

type CustomErrorMessage = "loginErr" | "passErr";
