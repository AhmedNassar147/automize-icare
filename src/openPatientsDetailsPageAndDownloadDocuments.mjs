/*
 *
 * Helper: `openPatientsDetailsPageAndDownloadDocuments`.
 *
 */
import os from "os";
import pLimit from "p-limit";
import downloadDocumentsFromPopupViewer from "./downloadDocumentsFromPopupViewer.mjs";
import checkStopModalAndCloseIt from "./checkStopModalAndCloseIt.mjs";

const openPatientsDetailsPageAndDownloadDocuments = async (
  browser,
  page,
  viewLinks
) => {
  const cpuCount = os.cpus().length; // Get the number of CPU cores

  const results = {
    succeeded: [],
    failed: [],
  };

  const limit = pLimit(Math.min(3, cpuCount));

  const tasks = viewLinks.map((_, i) =>
    limit(async () => {
      console.log(`Processing row ${i + 1} of ${viewLinks.length}...`);

      // // Refetch the view buttons
      // const viewLinksNow = await page.$$(
      //   "#tblOutNotificationsTable tbody tr td a.input_btn"
      // );

      const viewBtn = viewLinks[i];

      if (!viewBtn) {
        console.warn(`⚠️ Could not find view button for row ${i + 1}`);
        results.failed.push({ row: i + 1, reason: "Missing view button" });
        return;
      }

      try {
        await Promise.all([
          page.waitForSelector('a[onclick*="attach_view.cfm"]', {
            timeout: 5000,
          }),
          viewBtn.click(),
        ]);

        await checkStopModalAndCloseIt(page);

        const downloaded = await downloadDocumentsFromPopupViewer(
          browser,
          page
        );

        results.succeeded.push({
          row: i + 1,
          downloaded,
        });
        console.log(`✅ Successfully processed row ${i + 1}`, downloaded);
      } catch (err) {
        console.error(`❌ Failed on row ${i + 1}:`, err.message);
        results.failed.push({
          row: i + 1,
          reason: err.message,
        });
      }

      // Optional throttle
      await page.waitForTimeout(600);
    })
  );

  await Promise.all(tasks);

  return results;
};

export default openPatientsDetailsPageAndDownloadDocuments;
