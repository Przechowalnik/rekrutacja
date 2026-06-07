function putWithProgress({
  file,
  onProgress,
  signal,
  url,
}: {
  file: File;
  onProgress?: (pct: number) => void;
  signal?: AbortSignal;
  url: string;
}) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.addEventListener("progress", event => {
      if (!event.lengthComputable) {
        return;
      }
      onProgress?.(Math.round((event.loaded / event.total) * 100));
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });

    // eslint-disable-next-line unicorn/prefer-add-event-listener
    xhr.onerror = () => reject(new Error("Network error"));

    if (signal) {
      signal.addEventListener("abort", () => {
        xhr.abort();
        reject(new Error("Aborted"));
      });
    }

    xhr.send(file);
  });
}

async function retry<T>(function_: () => Promise<T>, tries = 3) {
  let lastError: unknown;
  for (let index = 0; index < tries; index++) {
    try {
      return await function_();
    } catch (error) {
      lastError = error;
      await new Promise(r => setTimeout(r, 400 * (index + 1)));
    }
  }
  throw lastError;
}

async function runWithLimit<T>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<void>,
) {
  const queue = items.map((item, index) => ({ index, item }));
  const runners = Array.from(
    { length: Math.min(limit, queue.length) },
    async () => {
      while (queue.length > 0) {
        const next = queue.shift();
        if (!next) {
          return;
        }
        await worker(next.item, next.index);
      }
    },
  );
  await Promise.all(runners);
}

export async function uploadImagesInBackground({
  files,
  onProgress,
  uploadImagesGroupId,
}: {
  files: File[];
  onProgress?: (index: number, pct: number) => void;
  uploadImagesGroupId: string;
}): Promise<string[]> {
  const signResponse = await fetch("/api/upload/images", {
    body: JSON.stringify({
      files: files.map(file => ({ mime: file.type })),
      uploadImagesGroupId,
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!signResponse.ok) {
    throw new Error("Sign failed");
  }
  const { uploads } = (await signResponse.json()) as {
    uploads: Array<{ path: string; publicUrl: string; signedUrl: string }>;
  };

  await runWithLimit(uploads, 2, async (u, index) => {
    const file = files[index]!;

    await retry(
      () =>
        putWithProgress({
          file,
          onProgress: pct => onProgress?.(index, pct),
          url: u.signedUrl,
        }),
      3,
    );
  });

  return uploads.map(u => u.path);
}
