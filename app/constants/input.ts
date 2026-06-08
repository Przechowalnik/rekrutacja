import { formNames } from "~/lib/zodFormValidator";

export const inputMaxLength = {
  [formNames.listingSalary]: 1_000_000,
  [formNames.phoneNumber]: 999_999_999,
};

export const inputMinLength = {
  [formNames.listingSalary]: 0,
};
