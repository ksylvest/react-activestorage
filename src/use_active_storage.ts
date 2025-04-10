import { useEffect, useRef, useState } from "react";

import type { ActiveStorageProgress } from "./types/active_storage_progress";
import type { ActiveStorageBlob } from "./types/active_storage_blob";
import type { ActiveStorageCSRF } from "./types/active_storage_csrf";

import { upload } from "./upload";

export const useActiveStorage = (
  file?: File,
  callback?: (_: { blob?: ActiveStorageBlob; error?: Error }) => void,
  csrf?: ActiveStorageCSRF /* specify a null CSRF to skips sending an "X-CSRF-TOKEN" header */,
) => {
  const [progress, setProgress] = useState<ActiveStorageProgress | undefined>();
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

      try {
        const blob = await upload({
          file,
          csrf,
          progress: setProgress,
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
