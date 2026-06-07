import type { BoxProps, MantineSize } from "@mantine/core";
import { Box, FileInput as MantineInputFile } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import imageCompression from "browser-image-compression";
import type { ReactNode } from "react";
import { memo, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useActionData } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { useLoading } from "~/hooks/useLoading";
import type { T_FormNames } from "~/lib/zodFormValidator";
import type { T_ResponseOnFailure } from "~/models/response";
import { countSpaces } from "~/utilities/functions";

import { Collapse } from "../Collapse";
import { Image } from "../Image";
import { Slider } from "../Slider";

type T_InputFile = {
  accept?: "image/png,image/jpeg" | "video/mp4";
  clearable?: boolean;
  description?: string;
  disabled?: boolean;
  error?: string;
  label?: ReactNode;
  maxSizeMB?: 2 | 5;
  maxWidthOrHeight?: 1024 | 1440 | 1920 | 512;
  multiple?: boolean;
  name: T_FormNames;
  onChange?: (value: string[] & File[]) => void;
  placeholder?: string;
  required?: boolean;
  size?: MantineSize | (string & {}); // NOSONAR
  withoutDescription?: boolean;
} & BoxProps;

const InputFile = ({
  accept,
  clearable,
  description,
  disabled,
  error,
  label,
  maxSizeMB,
  maxWidthOrHeight,
  multiple = false,
  name,
  onChange,
  placeholder,
  required = true,
  size = "md",
  withoutDescription = false,
  ...restProps
}: T_InputFile) => {
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [globalError, setGlobalError] = useState<string | undefined>();

  const actionData = useActionData<T_ResponseOnFailure>();
  const { onChangeLoading } = useLoading();
  const { t } = useTranslation(namespaces.notifications);
  const { t: tSeo } = useTranslation(namespaces.seo);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);

  const inputDescription = withoutDescription
    ? null
    : (description ?? tCommon(`inputsDescription.${name}`));

  const inputLabel = label ?? tCommon(`inputs.${name}`);

  const errorValue: string | undefined = (() => {
    if (globalError) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return t(`${globalError}.message`);
    }
    if (error) {
      if (countSpaces(error) > 0) {
        return error;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return tCommon(`formValidator.${error}` as any);
    }
    return;
  })();

  useEffect(() => {
    if (actionData?.formErrors && Array.isArray(actionData?.formErrors)) {
      const findFieldInFormErrors = actionData?.formErrors.find(
        item => item?.field === name,
      );
      if (findFieldInFormErrors) {
        setGlobalError(findFieldInFormErrors?.message);
        return;
      }
    }

    setGlobalError(undefined);
  }, [actionData]);

  const handleChangeImage = useCallback(
    async (file: File | File[] | null) => {
      onChangeLoading({
        value: true,
      });

      try {
        if (file) {
          const files = Array.isArray(file) ? file : [file];

          const results: string[] & File[] = [];

          for (const singleFile of files) {
            if (singleFile.type.startsWith("image/")) {
              const compressedFile = await imageCompression(singleFile, {
                initialQuality: 0.9,
                maxSizeMB,
                maxWidthOrHeight: maxWidthOrHeight,
                useWebWorker: true,
              });

              const reader = new FileReader();
              const result = await new Promise<null | string>(resolve => {
                reader.onloadend = () => {
                  resolve(
                    typeof reader.result === "string" ? reader.result : null,
                  );
                };
                reader.readAsDataURL(compressedFile);
              });

              if (result) {
                results.push(result);
              }
            } else if (singleFile.type === "video/mp4") {
              results.push(singleFile);
            }
          }

          if (accept === "image/png,image/jpeg") {
            setCurrentImages(results);
          }
          onChange?.(results);
        } else {
          if (accept === "image/png,image/jpeg") {
            setCurrentImages([]);
          }
          onChange?.([]);
        }
        onChangeLoading({
          value: false,
        });
        setGlobalError(undefined);
      } catch {
        if (accept === "image/png,image/jpeg") {
          setCurrentImages([]);
        }
        onChangeLoading({
          value: false,
        });
        onChange?.([]);
        notifications.show({
          color: "red",
          message: tNotifications(`somethingWentWrong.message`),
          title: tNotifications(`somethingWentWrong.title`),
        });
        return;
      }
    },
    [onChange, maxWidthOrHeight, maxSizeMB, accept],
  );

  const mapFiles = currentImages.map(item => {
    return (
      <Image
        alt={tSeo("imagesAlt.previewImage")}
        customSrc={item}
        key={`preview_${item}`}
        style={{ height: "auto", width: "100%" }}
      />
    );
  });

  return (
    <Box w="100%">
      <MantineInputFile
        {...restProps}
        accept={accept}
        clearable={clearable}
        description={inputDescription}
        disabled={disabled}
        error={errorValue}
        label={inputLabel}
        multiple={multiple}
        name={name}
        onChange={handleChangeImage}
        placeholder={
          placeholder ?? (required ? undefined : tCommon("inputs.optional"))
        }
        required={required}
        size={size}
        variant="filled"
        w="100%"
      />
      <Collapse fullWith opened={currentImages.length > 0}>
        <Box pt={12} w="100%">
          <Slider
            carousel={{
              gap: 8,
              width: 200,
            }}
            containScroll="keepSnaps"
            dragFree
            onlySliderOnMobile={null}
          >
            {mapFiles}
          </Slider>
        </Box>
      </Collapse>
    </Box>
  );
};

export default memo(InputFile);
