/*
 *
 * Helper: `downloadAsBase64`.
 *
 */
import { URL } from "node:url";

const downloadAsBase64 = async ({ fileUrl, fileName }) => {
  const url = new URL(fileUrl);
  let extension = (url.searchParams.get("Ext") || "").toLowerCase();

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

    const contentType = response.headers.get("content-type") || "";
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // Guess extension from content type if not provided
    if (!extension && contentType) {
      extension = contentType.split("/")[1]?.split(";")[0] || "bin";
    }

    // Basic safety check
    if (base64.length < 100 || base64.includes("html")) {
      return {
        fileUrl,
        extension,
        fileName,
        message: "Downloaded content appears invalid or not binary.",
      };
    }

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
      message: error.toString(),
    };
  }
};

export default downloadAsBase64;
