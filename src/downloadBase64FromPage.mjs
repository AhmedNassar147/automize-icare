/*
 *
 * Helper: `downloadBase64FromPage`.
 *
 */
const downloadBase64FromPage = async (page, { fileUrl, fileName }) => {
  const result = await page.evaluate(async (fileUrl) => {
    try {
      const response = await fetch(fileUrl);

      const contentType = response.headers.get("content-type") || "";
      const blob = await response.blob();
      const buffer = await blob.arrayBuffer();

      const binaryString = Array.from(new Uint8Array(buffer))
        .map((b) => String.fromCharCode(b))
        .join("");

      const base64 = btoa(binaryString);

      const textSample = binaryString.slice(0, 500).trim();

      const isHtml =
        textSample.startsWith("<!DOCTYPE html") || textSample.includes("<html");

      return {
        base64,
        contentType,
        isHtml,
      };
    } catch (error) {
      return { error: error.toString() };
    }
  }, fileUrl);

  if (result?.error) {
    return {
      fileUrl,
      fileName,
      extension: "",
      message: result.error,
    };
  }

  if (result.isHtml) {
    return {
      fileUrl,
      fileName,
      extension: "",
      message: "Downloaded content appears invalid it's html.",
    };
  }

  const supportedTypes = {
    "application/pdf": "pdf",
    "image/jpeg": "jpeg",
    "image/jpg": "jpg",
    "image/png": "png",
  };

  const extension = supportedTypes[result.contentType] || "";

  if (!extension) {
    return {
      fileUrl,
      fileName,
      extension: "",
      message: `Unsupported content type: ${result.contentType}`,
    };
  }

  return {
    fileUrl,
    extension,
    fileName,
    fileBase64: result.base64,
  };
};

export default downloadBase64FromPage;
