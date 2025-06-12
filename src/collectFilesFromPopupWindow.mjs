/*
 *
 * Helper: `collectFilesFromPopupWindow`.
 *
 */
import downloadAsBase64 from "./downloadAsBase64.mjs";

const collectFilesFromPopupWindow = async (
  popupPage,
  referralId,
  requiredSpecialty
) => {
  const attachments = await popupPage.evaluate(
    ({ referralId, requiredSpecialty }) => {
      return Array.from(document.querySelectorAll("li"))
        .map((li) => {
          const font = li.querySelector("font");
          const link = li.querySelector('a[href*="OpenAttach.cfm"]');

          if (!font || !link || !link.href) return null;

          const baseFileName = font.textContent?.trim() || "unnamed";
          const fileUrl = link.href.replace(/&amp;/g, "&");

          console.log("fileUrl", fileUrl);
          console.log("link.href", link.href);

          if (!fileUrl.startsWith("http")) return null;

          return {
            fileName: `ReferralId${referralId}-Specialty=${requiredSpecialty}-${baseFileName}`,
            fileUrl,
          };
        })
        .filter(Boolean); // Remove nulls
    },
    { referralId, requiredSpecialty }
  );

  if (!attachments.length) {
    console.warn("⚠️ No valid attachments found.");
    return [];
  }

  const concurrency = 2;
  const results = [];

  for (let i = 0; i < attachments.length; i += concurrency) {
    const chunk = attachments.slice(i, i + concurrency);

    const chunkResults = await Promise.all(
      chunk.map(async (attachment) => {
        try {
          return await downloadAsBase64(attachment);
        } catch (err) {
          console.error(`❌ Failed to download: ${attachment.fileUrl}`, err);
          return null;
        }
      })
    );

    results.push(...chunkResults.filter(Boolean)); // Remove failed
  }

  console.log(`✅ ${results.length} file(s) downloaded as base64.`);
  return results;
};

export default collectFilesFromPopupWindow;
