import { formNames } from "~/lib/zodFormValidator";

export const inputMaxLength = {
  [formNames.listingArea]: 999_999_999,
  [formNames.listingPrice]: 999_999_999,
  [formNames.listingRentalDays]: 1000,
  [formNames.phoneNumber]: 999_999_999,
};

export const inputMinLength = {
  [formNames.listingRentalDays]: 1,
};
