import {
  faImages,
  faPlus,
  faTrashCan,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import { AspectRatio, Box, Flex, Loader, MantineSize } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import imageCompression from "browser-image-compression";
import { ChangeEvent, memo, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { uploadImagesInBackground } from "~/apiCalls/uploadImages";
import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { globalClasses } from "~/constants/styles";
import { useLayout } from "~/hooks/useLayout";
import { T_FormNames } from "~/lib/zodFormValidator";
import { T_ListingImage } from "~/models/listingNested";
import { Text } from "~/ui/Text";
import { getNextMantineSize } from "~/utilities/functions";

import { Button } from "../Button";
import { IconSeo } from "../IconSeo";
import { Image } from "../Image";
import { Slider } from "../Slider";

export type T_SelectImagesUploaded = {
  path: string;
  progress: number;
  uploaded: boolean;
};

export type T_SelectImagesOnChange = {
  removed: string[];
  uploaded: T_SelectImagesUploaded[];
};

type T_SelectImages = {
  defaultImages?: T_ListingImage[];
  limit?: number;
  maxSizeMB?: 2 | 5;
  maxWidthOrHeight?: 1024 | 1440 | 1920 | 512;
  name: T_FormNames;
  onChange: (value: T_SelectImagesOnChange) => void;
  quality?: number;
  required?: boolean;
  size?: MantineSize;
  uploadImagesGroupId: string;
};

type T_ImageStatus =
  | "compressing"
  | "error"
  | "idle"
  | "uploaded"
  | "uploading";

type T_ImageUpload = {
  path?: string;
  progress: number;
  status: T_ImageStatus;
};

type T_ImageItem = {
  file: File | null;
  isDefault?: boolean;
  upload: T_ImageUpload;
  url: null | string;
};

type T_CombinedImages = {
  isDefault: boolean;
  upload: null | T_ImageUpload;
  url: null | string;
};

const SelectImagesToMemoize = ({
  defaultImages = [],
  limit = 6,
  maxSizeMB = 2,
  maxWidthOrHeight,
  name,
  onChange,
  quality = 0.9,
  required,
  size = "sm",
  uploadImagesGroupId,
}: T_SelectImages) => {
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [images, setImages] = useState<T_ImageItem[]>(
    defaultImages.map(item => {
      return {
        file: null,
        isDefault: item.isDefault ?? undefined,
        upload: {
          path: item.url,
          progress: 100,
          status: "uploaded",
        },
        url: null,
      };
    }),
  );

  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tSeo } = useTranslation(namespaces.seo);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { platformColor } = useLayout();

  const isReadyReference = useRef(false);

  const inputLabel = tCommon(`inputs.${name}`);
  const inputDescription = tCommon(`inputsDescription.${name}`);
  const inputReference = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      for (const img of images) {
        if (img.url) {
          URL.revokeObjectURL(img.url);
        }
      }
    };
  }, [images]);

  useEffect(() => {
    if (!isReadyReference.current) {
      isReadyReference.current = true;
    }

    const removed = removedImages;
    const uploaded = images
      .filter(
        item =>
          !defaultImages.some(
            itemDefault => itemDefault.url === item.upload.path,
          ),
      )
      .map(item => {
        return {
          path: item.upload.path ?? "",
          progress: item.upload.progress,
          uploaded: item.upload.status === "uploaded" && !!item.upload.path,
        };
      });

    if (removed.length === 0 && uploaded.length === 0) {
      return;
    }

    onChange({
      removed,
      uploaded,
    });
  }, [images, removedImages]);

  const handleClickAdd = () => {
    inputReference.current?.click();
  };

  const handleRemoveImage = ({ imageToRemove }: { imageToRemove: string }) => {
    setRemovedImages(previous => [...previous, imageToRemove]);
    setImages(previous => {
      const img = previous.find(item => item.upload.path === imageToRemove);
      if (img?.url) {
        URL.revokeObjectURL(img.url);
      }
      return previous.filter(index => index.upload.path !== imageToRemove);
    });
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const files = [...(input.files ?? [])];
    input.value = "";

    if (files.length === 0) {
      return;
    }

    const imagesExists: File[] = [];

    const filteredFiles = files.filter(file => {
      const exists = images.some(
        img =>
          img &&
          (img?.file?.name === file?.name || img?.file?.size === file.size),
      );

      if (exists) {
        imagesExists.push(file);
      }

      return !exists;
    });

    if (imagesExists.length > 0) {
      for (const item of imagesExists) {
        notifications.show({
          color: "red",
          message: tNotifications("fileAlreadyExists.message", {
            fileName: item.name,
          }),
          title: tNotifications("fileAlreadyExists.title"),
        });
      }
      return;
    }

    if (filteredFiles.length === 0) {
      return;
    }

    const freeSlots = Math.max(0, limit - images.length);
    if (freeSlots === 0) {
      notifications.show({
        color: "red",
        message: tNotifications("tooManyImages.message"),
        title: tNotifications("tooManyImages.title"),
      });
      return;
    }

    const limitedFiles = filteredFiles.slice(0, freeSlots);

    const pending = limitedFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImages(previous => [
      ...previous,
      ...pending.map(item => ({
        file: item.file,
        upload: { progress: 0, status: "compressing" as const },
        url: item.url,
      })),
    ]);

    try {
      const compressedFiles = await Promise.all(
        limitedFiles.map(file =>
          imageCompression(file, {
            initialQuality: quality,
            maxSizeMB,
            maxWidthOrHeight,
            useWebWorker: true,
          }),
        ),
      );

      setImages(previous => {
        const next = [...previous];
        const start = Math.max(0, next.length - pending.length);

        for (let index = 0; index < pending.length; index++) {
          const item = next[start + index];
          if (!item) {
            continue;
          }

          if (item.url) {
            URL.revokeObjectURL(item.url);
          }

          const compressed = compressedFiles[index] as File;
          next[start + index] = {
            ...item,
            file: compressed,
            upload: { progress: 0, status: "uploading" as const },
          };
        }

        return next;
      });

      const N = compressedFiles.length;

      const paths = await uploadImagesInBackground({
        files: compressedFiles,
        onProgress: (index, pct) => {
          setImages(previous => {
            const next = [...previous];
            const start = Math.max(0, next.length - N);
            const pos = start + index;
            const item = next[pos];
            if (!item) {
              return previous;
            }

            next[pos] = {
              ...item,
              upload: { ...item.upload, progress: pct, status: "uploading" },
            };
            return next;
          });
        },
        uploadImagesGroupId,
      });

      setImages(previous => {
        const next = [...previous];
        const start = Math.max(0, next.length - paths.length);

        for (const [index, path] of paths.entries()) {
          const item = next[start + index];
          if (!item) {
            continue;
          }

          next[start + index] = {
            ...item,
            upload: {
              path: path,
              progress: 100,
              status: "uploaded" as const,
            },
          };
        }

        return next;
      });
    } catch {
      setImages(previous => {
        const next = [...previous];
        const start = Math.max(0, next.length - pending.length);

        for (let index = start; index < next.length; index++) {
          const item = next[index];
          if (!item) {
            continue;
          }

          next[index] = {
            ...item,
            upload: { ...item.upload, status: "error" as const },
          };
        }
        return next;
      });

      notifications.show({
        color: "red",
        message: tNotifications("uploadImageFailed.message"),
        title: tNotifications("uploadImageFailed.title"),
      });
    }
  };

  const combinedImages: T_CombinedImages[] = images.map(img => ({
    isDefault: !!img.isDefault,
    upload: img.upload,
    url: img.url,
  }));

  while (combinedImages.length < limit) {
    combinedImages.push({
      isDefault: false,
      upload: null,
      url: null,
    });
  }

  const mapBoxes = combinedImages.map((image, index) => {
    const hasImage = image?.url || image?.upload?.path;

    return (
      <AspectRatio
        key={`image_${image.url}_${image.upload?.path}_${index}`}
        ratio={4 / 3}
        w={{
          base: "100%",
          sm: "calc(33.5% - 8px)",
          xs: "calc(50% - 8px)",
        }}
      >
        <Flex
          align="center"
          bg={`light-dark(${colorsMantine.gray1}, ${colorsMantine.dark7})`}
          direction="column"
          justify="center"
          onClick={hasImage ? undefined : handleClickAdd}
          pos="relative"
          style={{
            borderRadius: "4px",
            overflow: "hidden",
            ...(hasImage
              ? {}
              : {
                  cursor: "pointer",
                }),
          }}
        >
          {hasImage ? (
            <Box>
              <Image
                alt={tSeo("imagesAlt.selectImagesItem")}
                className={globalClasses.fade}
                customSrc={image?.upload?.path ?? image.url ?? ""}
                fit="cover"
                style={{
                  height: "180px",
                  objectFit: "cover",
                  width: "100%",
                  zIndex: 1,
                }}
              />
              <Box
                bg="red"
                pos="absolute"
                right={0}
                style={{
                  borderBottomLeftRadius: "8px",
                }}
                top={0}
              >
                <Button
                  ariaLabel={tSeo("imagesAlt.clear")}
                  h={34}
                  onClick={event => {
                    event.stopPropagation();
                    handleRemoveImage({
                      imageToRemove: image?.upload?.path ?? "",
                    });
                  }}
                  px={8}
                  variant="transparent"
                  withAnimation={false}
                >
                  <IconSeo color="white" icon={faTrashCan} size="1x" />
                </Button>
              </Box>
              {index === 0 && (
                <Box
                  bg={platformColor}
                  left="50%"
                  pos="absolute"
                  px={8}
                  py={4}
                  style={{
                    borderRadius: "8px",
                    opacity: 0.98,
                    overflow: "hidden",
                    transform: "translate(-50%, -50%)",
                    userSelect: "none",
                  }}
                  top="85%"
                  w="130px"
                >
                  <Text
                    c="white"
                    center
                    fw="bold"
                    size="sm"
                    style={{
                      userSelect: "none",
                    }}
                  >
                    {tCommon("selectImages.mainImage")}
                  </Text>
                </Box>
              )}
              {image.upload?.status === "error" && (
                <Box
                  bg={colorsMantine.red}
                  left={0}
                  pos="absolute"
                  px={8}
                  py={4}
                  style={{
                    borderRadius: "8px",
                    opacity: 0.98,
                    overflow: "hidden",
                    userSelect: "none",
                  }}
                  top={0}
                >
                  <IconSeo color="white" icon={faWarning} size="1x" />
                </Box>
              )}
              {(image.upload?.status === "compressing" ||
                image.upload?.status === "uploading") && (
                <Flex
                  align="center"
                  bottom={0}
                  justify="center"
                  left={0}
                  pos="absolute"
                  right={0}
                  top={0}
                >
                  <Loader />
                </Flex>
              )}
            </Box>
          ) : (
            <>
              <Box pos="relative">
                <IconSeo
                  color={`light-dark(${colorsMantine.primary7}, ${colorsMantine.gray5})`}
                  icon={faImages}
                  size="xl"
                />
              </Box>
              <Box
                pos="absolute"
                right="50%"
                style={{
                  transform: "translate(calc(50% + 18px), calc(-50% - 16px))",
                }}
                top="50%"
              >
                <IconSeo
                  color={`light-dark(${colorsMantine.primary7}, ${colorsMantine.gray5})`}
                  icon={faPlus}
                  size="md"
                />
              </Box>
            </>
          )}
        </Flex>
      </AspectRatio>
    );
  });

  return (
    <Box w="100%">
      <Flex align="flex-start" justify="flex-start" pb={4} w="100%">
        <label>
          <Text fw="bold" size={getNextMantineSize({ size })}>
            {inputLabel}
            {required && (
              <span
                style={{
                  color: colorsMantine.error,
                  paddingLeft: 4,
                }}
              >
                *
              </span>
            )}
          </Text>
          <Text
            size={size}
            style={{
              color: colorsMantine.dimmed,
            }}
          >
            {inputDescription}
          </Text>
        </label>
      </Flex>
      <Flex
        align="flex-start"
        gap={8}
        justify="flex-start"
        visibleFrom="xs"
        w="100%"
        wrap="wrap"
      >
        {mapBoxes}
      </Flex>
      <Box hiddenFrom="xs">
        <Slider
          carousel={{
            gap: 8,
            width: 200,
          }}
          containScroll="keepSnaps"
          dragFree
          onlySliderOnMobile={null}
        >
          {mapBoxes}
        </Slider>
      </Box>
      <input
        accept="image/png, image/jpeg, image/webp"
        multiple
        onChange={handleFileChange}
        ref={inputReference}
        style={{ display: "none" }}
        type="file"
      />
    </Box>
  );
};

export const SelectImages = memo(SelectImagesToMemoize);
