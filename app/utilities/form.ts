import { FormErrors, UseFormReturnType } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { TFunction } from "i18next";

import { T_FormNames } from "~/lib/zodFormValidator";

export function convertToFormData(
  data: Record<
    string,
    | (boolean | number | string)[]
    | { count: number; id: string }[]
    | { id: string; priority: number }[]
    | boolean
    | Date
    | File
    | null
    | number
    | string
    | undefined
  >,
): FormData {
  const formDataToSend = new FormData();

  for (const key in data) {
    if (Object.hasOwn(data, key)) {
      const value = data[key];

      if (Array.isArray(value)) {
        for (const item of value) {
          if (item instanceof File) {
            formDataToSend.append(key, item);
          } else if (typeof item === "string" && item.startsWith("data:")) {
            const base64Data = item.split(",")[1];
            if (!base64Data) {
              throw new Error("Invalid base64 data");
            }

            const mimeTypeMatch = item.split(";")?.[0]?.split(":")[1];
            if (!mimeTypeMatch) {
              throw new Error("Invalid MIME type in base64 string");
            }
            const mimeType = mimeTypeMatch;

            const byteCharacters = atob(base64Data);
            const byteArrays = new Uint8Array(byteCharacters.length);

            for (let index = 0; index < byteCharacters.length; index++) {
              byteArrays[index] = byteCharacters.codePointAt(index) ?? 0;
            }

            const blob = new Blob([byteArrays], { type: mimeType });
            formDataToSend.append(key, blob, `${key}.jpg`);
          } else if (typeof item === "object") {
            formDataToSend.append(key, JSON.stringify(item));
          } else {
            formDataToSend.append(key, item.toString());
          }
        }
      } else if (value instanceof Date) {
        formDataToSend.append(key, value.toString());
      } else if (
        typeof value === "boolean" ||
        typeof value === "number" ||
        typeof value === "bigint"
      ) {
        formDataToSend.append(key, value.toString());
      } else if (typeof value === "string" && value.startsWith("data:")) {
        const base64Data = value.split(",")[1];
        if (!base64Data) {
          throw new Error("Invalid base64 data");
        }

        const mimeTypeMatch = value.split(";")?.[0]?.split(":")[1];
        if (!mimeTypeMatch) {
          throw new Error("Invalid MIME type in base64 string");
        }
        const mimeType = mimeTypeMatch;

        const byteCharacters = atob(base64Data);
        const byteArrays = new Uint8Array(byteCharacters.length);

        for (let index = 0; index < byteCharacters.length; index++) {
          byteArrays[index] = byteCharacters.codePointAt(index) ?? 0;
        }

        const blob = new Blob([byteArrays], { type: mimeType });
        formDataToSend.append(key, blob, `${key}.jpg`);
      } else if (value && typeof value === "string") {
        formDataToSend.append(key, value.toString());
      } else if (value instanceof File) {
        formDataToSend.append(key, value);
      }
    }
  }

  return formDataToSend;
}

export const resetFormFieldsAndShowNotification = ({
  fieldsToReset,
  form,
  notification,
}: {
  fieldsToReset: T_FormNames[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturnType<any>;
  notification?: () => void;
}) => {
  const values = form.getValues();

  const hadValues = fieldsToReset.some(field => {
    const value = values[field];
    return Array.isArray(value) ? value.length > 0 : !!value;
  });

  for (const field of fieldsToReset) {
    form.setFieldValue(field, Array.isArray(values[field]) ? [] : "");
  }

  if (hadValues) {
    notification?.();
  }
};

export const showAllErrorsForm = ({
  tNotifications,
  validationErrors,
}: {
  tNotifications: TFunction<"notifications", undefined>;
  validationErrors: FormErrors;
}) => {
  notifications.show({
    color: "red",
    message: tNotifications(`errorsInForm.message`),
    title: tNotifications(`errorsInForm.title`),
  });
  if (validationErrors && typeof validationErrors === "object") {
    for (const keyValidationErrors in validationErrors) {
      const value = validationErrors[keyValidationErrors];

      if (typeof value !== "string") {
        continue;
      }

      notifications.show({
        color: "red",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        message: tNotifications(`${value}.message`),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        title: tNotifications(`${value}.title`),
      });
    }
  }
};
