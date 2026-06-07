import { Button, FileButton } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import imageCompression from "browser-image-compression";
import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";

type T_ButtonGetImages = {
  label?: string;
  maxSizeMB?: 2 | 5;
  maxWidthOrHeight?: 1024 | 1440 | 1920 | 512;
  multiple?: boolean;
  onChange: (filesBase64: string[]) => void;
};

const ButtonGetImagesToMemoize = ({
  label,
  maxSizeMB = 2,
  maxWidthOrHeight = 1024,
  multiple,
  onChange,
}: T_ButtonGetImages) => {
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);

  const handleChangeImage = useCallback(
    async (file: File | File[] | null) => {
      try {
        if (file) {
          const files = Array.isArray(file) ? file : [file];

          const results: string[] = [];

          for (const singleFile of files) {
            if (singleFile.type.startsWith("image/")) {
              const compressedFile = await imageCompression(singleFile, {
                initialQuality: 0.9,
                maxSizeMB,
                maxWidthOrHeight: maxWidthOrHeight,
                useWebWorker: true,
              });

              const errorMessage = checkFormValidator({
                formName:
                  maxSizeMB === 2
                    ? formNames.fileImage2MB
                    : formNames.fileImage5MB,
                optional: true,
                value: compressedFile,
              });

              if (errorMessage) {
                notifications.show({
                  color: "red",
                  message: "",
                  title: tCommon(`formValidator.${errorMessage}`),
                });
                continue;
              }

              const reader = new FileReader();
              const result = await new Promise<null | string>(resolve => {
                reader.onloadend = () => {
                  if (typeof reader.result === "string") {
                    resolve(reader.result);
                  } else {
                    resolve(null);
                  }
                };
                reader.readAsDataURL(compressedFile);
              });

              if (result) {
                results.push(result);
              }
            }
          }

          onChange(results);
        } else {
          onChange([]);
        }
      } catch {
        onChange([]);
        notifications.show({
          color: "red",
          message: tNotifications(`somethingWentWrong.message`),
          title: tNotifications(`somethingWentWrong.title`),
        });
        return;
      }
    },
    [onChange, maxWidthOrHeight, maxSizeMB],
  );

  return (
    <FileButton
      accept="image/png,image/jpeg,image/webp"
      multiple={multiple}
      name={maxSizeMB === 2 ? formNames.fileImage2MB : formNames.fileImage5MB}
      onChange={handleChangeImage}
    >
      {properties => (
        <Button size="sm" {...properties}>
          {label ?? tCommon("buttonGetImage.addImage")}
        </Button>
      )}
    </FileButton>
  );
};

export const ButtonGetImages = memo(ButtonGetImagesToMemoize);
