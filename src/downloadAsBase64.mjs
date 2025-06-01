/*
 *
 * Helper: `downloadAsBase64`.
 *
 */
import { URL } from "node:url";

const downloadAsBase64 = async ({ fileUrl, fileName }) => {
  const url = new URL(fileUrl);
  const extension = url.searchParams.get("Ext").toLowerCase();

  try {
    const response = await fetch(fileUrl);

    if (!response.ok) {
      return {
        fileUrl,
        extension,
        fileName,
        message: `Failed to download: ${fileUrl} (status ${response.status})`,
      };
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return {
      fileUrl,
      extension,
      fileName,
      fileBase64: base64,
    };
  } catch (error) {
    return {
      fileUrl,
      extension,
      fileName,
      message: error,
    };
  }
};

export default downloadAsBase64;
