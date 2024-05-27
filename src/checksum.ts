import SparkMD5 from "spark-md5";

const MEGABYTE = 1024 * 1024;
const CHUNK_SIZE = 2 * MEGABYTE;
const RAW = true;

export const checksum = async (file: File) => {
  const buffer = new SparkMD5.ArrayBuffer();

  for (let i = 0; i < file.size; i += CHUNK_SIZE) {
    const result = await new Promise<ArrayBuffer | null>((resolve, reject) => {
      const filereader = new FileReader();

      filereader.onload = (event) => {
        resolve(event.target?.result as ArrayBuffer | null);
      };

      filereader.onerror = () => {
        reject(new Error(`Unable to load "${file.name}". Please try again.`));
      };

      const blob = file.slice(i, i + CHUNK_SIZE);
      filereader.readAsArrayBuffer(blob);
    });

    if (result) buffer.append(result);
  }

  return btoa(buffer.end(RAW));
};
