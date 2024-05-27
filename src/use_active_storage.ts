import { useEffect, useRef, useState } from "react";

import { checksum } from "./checksum";
import { upload } from "./upload";

const URL = "/rails/active_storage/direct_uploads";

type Progress = {
  loaded: number;
  total: number;
};

type Blob = {
  signed_id: string;
  filename: string;
};

type Upload = {
  url: string;
  headers: Record<string, string>;
};

type Callback = (params: { blob?: Blob; error?: Error }) => void;
type CSRF = string | null | (() => Promise<string>);

export const useActiveStorage = (
  file?: File,
  callback?: Callback,
  csrf?: CSRF /* specify a null CSRF to skips sending an "X-CSRF-TOKEN" header */
): {
  uploading: boolean;
  progress?: Progress;
} => {
  const [progress, setProgress] = useState<Progress | undefined>();
  const [uploading, setUploading] = useState<boolean>(false);
  const ref = useRef(callback);

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!file) return;

    (async () => {
      setUploading(true);
      setProgress(undefined);

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

      try {
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
        }: Blob & { direct_upload: Upload } = await response.json();

        await upload({
          method: "PUT",
          url,
          headers,
          file,
          progress: (progress) => {
            setProgress(progress);
          },
        });

        ref.current?.({ blob });
      } catch (error: Error | unknown) {
        ref.current?.({ error: error as Error });
      }

      setUploading(false);
      setProgress(undefined);
    })();
  }, [file]);

  return {
    uploading,
    progress,
  };
};
