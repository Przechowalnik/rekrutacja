import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import z from "zod";

import { formNames } from "~/lib/zodFormValidator";

import { environment } from "./environment.server";
import { isE2E } from "./isE2E.server";
import { getAndCheckUser } from "./prismaRequest.server";
import {
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { zodValidator } from "./zodValidator.server";

const SUPABASE_BUCKET = "assets";

// In E2E mode, use dummy values to avoid initialization errors
const supabaseUrl = isE2E
  ? "https://dummy.supabase.co"
  : environment("SUPABASE_URL");
const SUPABASE_IMAGES_URL = `${supabaseUrl}/storage/v1/object/public/${SUPABASE_BUCKET}/`;

const supabase: SupabaseClient = isE2E
  ? (null as unknown as SupabaseClient) // Will never be used in E2E mode
  : createClient(
      environment("SUPABASE_URL"),
      environment("SUPABASE_SERVICE_ROLE_KEY"),
    );

type T_Folder = "avatars" | "banners" | "bugs" | "listings";

type T_MainFolder = "draft/images" | "draft/videos" | "images" | "videos";

export type T_ResultUploadOrGetImage = {
  url: null | string;
};

export async function getImagePublicUrl({
  filePath,
  folder,
}: {
  filePath: string;
  folder: T_Folder;
}): Promise<T_ResultUploadOrGetImage> {
  const { data } = supabase.storage.from(folder).getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error(`Error on get file`);
  }

  return { url: data.publicUrl };
}

const uuidV4 = String.raw`[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}`;

export const regexDraftFolder = new RegExp(
  String.raw`^draft\/(images|videos)\/(bugs|avatars|banners|listings)\/${uuidV4}$`,
  "i",
);

export const regexFinalImagesFolder = new RegExp(
  String.raw`^(images|videos)\/(bugs|avatars|banners|listings)\/${uuidV4}$`,
  "i",
);

const extractPathFromPublicUrl = (pathOrUrl: string) => {
  const marker = `/storage/v1/object/public/${SUPABASE_BUCKET}/`;
  const index = pathOrUrl.indexOf(marker);

  if (index === -1) {
    return pathOrUrl.replace(/^\//, "");
  }

  return pathOrUrl.slice(index + marker.length);
};

const joinPath = (...parts: string[]) =>
  parts
    .filter(Boolean)
    .map(p => p.replaceAll(/(^\/)|(\/$)/g, ""))
    .join("/");

type T_StorageFolder = "avatars" | "banners" | "bugs" | "listings";

type T_ManageFilesInStorageReport = {
  deleted: string[];
  deleteErrors: Array<{ error: string; urlOrPath: string }>;
  moved: Array<{ from: string; to: string; url: string }>;
  moveErrors: Array<{ error: string; from: string; to: string }>;
};

export async function manageFilesInStorage({
  delete: pathsToDelete,
  folder,
  move,
  type,
}: {
  delete?: string[];
  folder: null | T_StorageFolder;
  move?: {
    destinationFolder: string;
    paths: string[];
  };
  type: "images" | "videos" | null;
}): Promise<T_ManageFilesInStorageReport> {
  const report: T_ManageFilesInStorageReport = {
    deleted: [],
    deleteErrors: [],
    moved: [],
    moveErrors: [],
  };

  if (move && move.paths.length > 0) {
    const validDestinationFolder = `${type}/${folder}/${move.destinationFolder}`;

    if (!regexFinalImagesFolder.test(validDestinationFolder)) {
      throw new Error("Bad destination folder name");
    }

    const toMove = move.paths.map(urlOrPath =>
      extractPathFromPublicUrl(urlOrPath),
    );

    for (const from of toMove) {
      const fileName = from.split("/").pop() || "file";
      const to = joinPath(validDestinationFolder, fileName);

      try {
        const { error: copyError } = await supabase.storage
          .from(SUPABASE_BUCKET)
          .copy(from, to);

        if (copyError) {
          report.moveErrors.push({
            error: `Copy failed: ${copyError.message}`,
            from,
            to,
          });
          continue;
        }

        const { error: removeError } = await supabase.storage
          .from(SUPABASE_BUCKET)
          .remove([from]);

        if (removeError) {
          report.moveErrors.push({
            error: `Remove failed: ${removeError.message}`,
            from,
            to,
          });
          continue;
        }

        const url = `${SUPABASE_IMAGES_URL}${to}`;
        report.moved.push({ from, to, url });
      } catch (error) {
        report.moveErrors.push({
          error: error instanceof Error ? error.message : String(error),
          from,
          to,
        });
      }
    }
  }

  if (pathsToDelete && pathsToDelete.length > 0) {
    const paths = pathsToDelete.map(urlOrPath =>
      extractPathFromPublicUrl(urlOrPath),
    );

    try {
      const { error } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .remove(paths);

      if (error) {
        console.error("Error deleting files:", error.message);
        for (const path of paths) {
          report.deleteErrors.push({
            error: error.message,
            urlOrPath: path,
          });
        }
      } else {
        report.deleted.push(...paths);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Error deleting files:", errorMessage);
      for (const path of paths) {
        report.deleteErrors.push({
          error: errorMessage,
          urlOrPath: path,
        });
      }
    }
  }

  return report;
}

export type T_SignedUpload = {
  path: string;
  signedUrl: string;
  url: string;
};

const extensionFromMime = (mime: string) => {
  if (mime === "image/jpeg") {
    return "jpg";
  }
  if (mime === "image/png") {
    return "png";
  }
  if (mime === "image/webp") {
    return "webp";
  }
  throw new Error("Unsupported mime");
};

const regexCheckFolder =
  /^draft\/(images|videos)\/(bugs|avatars|banners|listings)\/[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;

type T_CleanOldDraftFilesReport = {
  deletedCount: number;
  errors: Array<{ error: string; path: string }>;
};

export async function cleanOldDraftFiles(): Promise<T_CleanOldDraftFilesReport> {
  const report: T_CleanOldDraftFilesReport = {
    deletedCount: 0,
    errors: [],
  };

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const draftFolders = [
    "draft/images/bugs",
    "draft/images/avatars",
    "draft/images/banners",
    "draft/images/listings",
    "draft/videos/bugs",
  ];

  try {
    for (const folder of draftFolders) {
      try {
        const { data: files, error: listError } = await supabase.storage
          .from(SUPABASE_BUCKET)
          .list(folder, {
            limit: 1000,
            sortBy: { column: "created_at", order: "asc" },
          });

        if (listError) {
          console.error(`Error listing files in ${folder}:`, listError.message);
          report.errors.push({
            error: listError.message,
            path: folder,
          });
          continue;
        }

        if (!files || files.length === 0) {
          continue;
        }

        for (const file of files) {
          if (file.name === ".emptyFolderPlaceholder") {
            continue;
          }

          const fileCreatedAt = new Date(file.created_at);
          if (fileCreatedAt < oneDayAgo) {
            const { data: subFiles, error: subListError } =
              await supabase.storage
                .from(SUPABASE_BUCKET)
                .list(`${folder}/${file.name}`, {
                  limit: 100,
                });

            if (subListError) {
              console.error(
                `Error listing subfiles in ${folder}/${file.name}:`,
                subListError.message,
              );
              report.errors.push({
                error: subListError.message,
                path: `${folder}/${file.name}`,
              });
              continue;
            }

            if (!subFiles || subFiles.length === 0) {
              continue;
            }

            const filesToDelete = subFiles.map(
              subFile => `${folder}/${file.name}/${subFile.name}`,
            );

            const { error: removeError } = await supabase.storage
              .from(SUPABASE_BUCKET)
              .remove(filesToDelete);

            if (removeError) {
              console.error(
                `Error deleting files in ${folder}/${file.name}:`,
                removeError.message,
              );
              report.errors.push({
                error: removeError.message,
                path: `${folder}/${file.name}`,
              });
            } else {
              report.deletedCount += filesToDelete.length;
              console.warn(
                `Deleted ${filesToDelete.length} files from ${folder}/${file.name}`,
              );
            }
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(`Error processing folder ${folder}:`, errorMessage);
        report.errors.push({
          error: errorMessage,
          path: folder,
        });
      }
    }

    console.warn(
      `Draft cleanup completed: ${report.deletedCount} files deleted, ${report.errors.length} errors`,
    );

    return report;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in cleanOldDraftFiles:", errorMessage);
    return report;
  }
}

export async function createSignedUploadUrls({
  folder,
  mimes,
}: {
  folder: string;
  mimes: string[];
}): Promise<T_SignedUpload[]> {
  try {
    if (!folder) {
      throw new Error("Missing folder");
    }
    if (!mimes?.length) {
      throw new Error("No files to sign");
    }

    const isValid = regexCheckFolder.test(folder);

    if (!isValid) {
      throw new Error("Bad folder name");
    }

    const uploads: T_SignedUpload[] = [];

    for (const mime of mimes) {
      const extension = extensionFromMime(mime);
      const path = `${folder}/${uuidv4()}_${Date.now()}.${extension}`;

      const { data, error } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .createSignedUploadUrl(path);

      if (error || !data?.signedUrl) {
        console.error(error);
        throw new Error("Cannot sign upload");
      }

      uploads.push({
        path,
        signedUrl: data.signedUrl,
        url: `${SUPABASE_IMAGES_URL}${path}`,
      });
    }

    return uploads;
  } catch (error) {
    throw new Error(`Error on send file ${error}`);
  }
}

export async function uploadImageOrVideo({
  file,
  folder,
}: {
  file: Blob;
  folder: T_Folder;
}): Promise<T_ResultUploadOrGetImage> {
  try {
    const extension = extensionFromMime(file.type);
    const fileName = `${uuidv4()}_${Date.now()}.${extension}`;
    const path = `${folder}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    const url = `${SUPABASE_IMAGES_URL}${path}`;
    return { url };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error(`Error on upload file: ${error}`);
  }
}

const MAX_CONCURRENT_UPLOADS = 6;

export async function uploadImagesOrVideos({
  files,
  folder,
}: {
  files: Blob[];
  folder: T_Folder;
}): Promise<T_ResultUploadOrGetImage[]> {
  const results: T_ResultUploadOrGetImage[] = Array.from(
    { length: files.length },
    () => ({ url: null }),
  );

  for (let index = 0; index < files.length; index += MAX_CONCURRENT_UPLOADS) {
    const batch = files.slice(index, index + MAX_CONCURRENT_UPLOADS);
    const batchResults = await Promise.allSettled(
      batch.map(file => uploadImageOrVideo({ file, folder })),
    );

    for (const [index_, result] of batchResults.entries()) {
      results[index + index_] =
        result.status === "fulfilled" ? result.value : { url: null };
    }
  }

  return results;
}

const allowedImageMimes = ["image/webp", "image/png", "image/jpeg"] as const;

const Z_SignDraftListingImagesUploadSchema = z.object({
  files: z
    .array(
      z.object({
        mime: z
          .string()
          .refine(
            (mime): mime is (typeof allowedImageMimes)[number] =>
              (allowedImageMimes as readonly string[]).includes(mime),
            { message: "unsupportedFileType" },
          ),
      }),
    )
    .min(1, "noFilesProvided")
    .max(6, "tooManyFiles"),
  [formNames.uploadImagesGroupId]: zodValidator.uploadImagesGroupId,
});

export const signDraftImagesUpload = async ({
  folder,
  mainFolder,
  request,
  userId,
  userSessionVersion,
}: {
  folder: T_Folder;
  mainFolder: T_MainFolder;
  request: Request;
  userId: string;
  userSessionVersion: null | number;
}) => {
  try {
    const rawBody: unknown = await request.json();

    const parsed = Z_SignDraftListingImagesUploadSchema.safeParse(rawBody);
    if (!parsed.success) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const { files, uploadImagesGroupId } = parsed.data;

    const { existingUser, responseError } = await getAndCheckUser({
      prismaArguments: {
        select: { id: true },
        where: { id: userId },
      },
      request,
      userSessionVersion,
    });

    if (responseError) {
      return await responseOnFailure(responseError);
    }

    if (!existingUser) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    const mimes = files.map(file => file.mime);

    const uploads = await createSignedUploadUrls({
      folder: `${mainFolder}/${folder}/${uploadImagesGroupId}`,
      mimes,
    });

    return await responseOnSuccess({
      data: {
        uploads: uploads.map(upload => ({
          path: `${SUPABASE_IMAGES_URL}${upload.path}`,
          publicUrl: upload.url,
          signedUrl: upload.signedUrl,
        })),
      },
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};
