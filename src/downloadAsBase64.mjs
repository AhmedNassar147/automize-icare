/*
 *
 * Helper: `downloadAsBase64`.
 *
 */
import { URL } from "node:url";

const isHtml = (content) =>
  content.trim().startsWith("<!DOCTYPE html") || content.includes("<html");

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

    // Guard against HTML masquerading as a file
    if (
      contentType.includes("text/html") ||
      isHtml(Buffer.from(arrayBuffer).toString("utf-8"))
    ) {
      return {
        fileUrl,
        extension,
        fileName,
        message: "Downloaded content appears invalid it's html.",
      };
    }

    const supportedTypes = {
      "application/pdf": "pdf",
      "image/jpeg": "jpeg",
      "image/jpg": "jpg",
      "image/png": "png",
    };

    if (!(contentType in supportedTypes)) {
      console.log("❌ Error contentType", contentType);
      return {
        fileUrl,
        extension,
        fileName,
        message: "Downloaded content appears to be unsupported",
      };
    }

    extension = supportedTypes[contentType];

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
      message: error.toString(),
    };
  }
};

export default downloadAsBase64;
