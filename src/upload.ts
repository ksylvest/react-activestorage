import type { ActiveStorageBlob } from "./types/active_storage_blob";
import type { ActiveStorageCSRF } from "./types/active_storage_csrf";
import type { ActiveStorageProgress } from "./types/active_storage_progress";

import { checksum } from "./utils/checksum";
import { xhr } from "./utils/xhr";

const URL = "/rails/active_storage/direct_uploads";

export const upload = async ({
  file,
  csrf,
  progress,
}: {
  file: File;
  csrf?: ActiveStorageCSRF /* specify a null CSRF to skips sending an "X-CSRF-TOKEN" header */;
  progress?(_: ActiveStorageProgress): void;
}): Promise<ActiveStorageBlob> => {
  const token = await (async () => {
    if (typeof csrf === "function") {
      return await csrf();
    } else {
      return csrf === undefined
        ? document
            ?.querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content")
        : csrf;
    }
  })();

  const response = await fetch(URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { "X-CSRF-Token": token } : {}),
    },
    body: JSON.stringify({
      blob: {
        filename: file.name,
        content_type: file.type,
        byte_size: file.size,
        checksum: await checksum(file),
      },
    }),
  });

  if (!response.ok)
    throw new Error(`Unable to upload "${file.name}". Please try again.`);

  const {
    direct_upload: { url, headers },
    ...blob
  }: ActiveStorageBlob & {
    direct_upload: {
      url: string;
      headers: Record<string, string>;
    };
  } = await response.json();

  await xhr({
    method: "PUT",
    url,
    headers,
    file,
    progress,
  });

  return blob;
};
