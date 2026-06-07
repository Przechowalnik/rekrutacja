import type { T_FormNames } from "~/lib/zodFormValidator";

type T_ResultZodError = {
  field: T_FormNames;
  message: string;
};

export type T_ResponseOnFailure = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  formErrors: T_ResultZodError[];
  message?: null | string;
  status?: number;
};
