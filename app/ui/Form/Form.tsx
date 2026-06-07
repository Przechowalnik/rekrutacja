import type { RefAttributes } from "react";
import type { FormProps } from "react-router";
import { Form as FormRemix } from "react-router";

import classes from "./form.module.css";

export const Form = (
  properties: FormProps & RefAttributes<HTMLFormElement>,
) => {
  return <FormRemix {...properties} className={classes.form} />;
};
