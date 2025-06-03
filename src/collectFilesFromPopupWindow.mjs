/*
 *
 * Helper: `collectFilesFromPopupWindow`.
 *
 */
import downloadAsBase64 from "./downloadAsBase64.mjs";

const collectFilesFromPopupWindow = async (popupPage) => {
  const attachments = await popupPage.evaluate(() => {
    return Array.from(document.querySelectorAll("li"))
      .map((li) => {
        const font = li.querySelector("font");
        const link = li.querySelector('a[href*="OpenAttach.cfm"]');

        if (font && link) {
          return {
            fileName: font.textContent.trim(),
            fileUrl: link.href.replace(/&amp;/g, "&"),
          };
        }
      })
      .filter(Boolean); // remove undefined entries
  });

  // Limit concurrency to avoid hammering server
  const concurrency = 2;
  const results = [];

  for (let i = 0; i < attachments.length; i += concurrency) {
    const chunk = attachments.slice(i, i + concurrency);
    const chunkResults = await Promise.all(chunk.map(downloadAsBase64));
    results.push(...chunkResults);
  }

  console.log("✅ All files downloaded as base64");
  return results;
};

export default collectFilesFromPopupWindow;
