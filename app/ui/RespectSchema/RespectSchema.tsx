import { type ReactNode } from "react";
import { useLoaderData } from "react-router";
import type { ZodSchema } from "zod";

import { ErrorPage } from "~/components/ErrorPage";

interface T_RespectSchema<T> {
  children: (data: T) => ReactNode;
  schema: ZodSchema<T>;
}

export function RespectSchema<T>({ children, schema }: T_RespectSchema<T>) {
  const loaderData = useLoaderData();
  const result = schema.safeParse(loaderData);

  if (!result.success) {
    console.error(result.error);
    return <ErrorPage />;
  }

  return <>{children(result.data)}</>;
}
