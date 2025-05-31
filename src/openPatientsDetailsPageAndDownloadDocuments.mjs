/*
 *
 * Helper: `openPatientsDetailsPageAndDownloadDocuments`.
 *
 */
import os from "os";
import pLimit from "p-limit";
import downloadDocumentsFromPopupViewer from "./downloadDocumentsFromPopupViewer.mjs";
import checkStopModalAndCloseIt from "./checkStopModalAndCloseIt.mjs";
import navigateToPatientDetailsPage from "./navigateToPatientDetailsPage.mjs";
import goBack from "./goBack.mjs";
import getSelectedNationalityFromDropdwon from "./getSelectedNationalityFromDropdwon.mjs";

const openPatientsDetailsPageAndDownloadDocuments = async (
  browser,
  page,
  patientsData
) => {
  const cpuCount = os.cpus().length; // Get the number of CPU cores

  const results = patientsData;

  const limit = pLimit(Math.min(2, cpuCount));

  const tasks = patientsData.map(({ adherentName, referralId }, i) =>
    limit(async () => {
      const rowId = i + 1;

      console.log(
        `visit details page for patient=${adherentName} referralId=${referralId} row=${rowId} ...`
      );

      try {
        await navigateToPatientDetailsPage(page, actionLinkRef);

        await checkStopModalAndCloseIt(page);

        const { text } = await getSelectedNationalityFromDropdwon(page);

        results[i].nationality = text;

        const files = await downloadDocumentsFromPopupViewer(browser, page);
        results[i].files = files || [];

        console.log(
          `✅ Successfully processed patient=${adherentName} referralId=${referralId} row=${rowId}`,
          files
        );
      } catch (err) {
        console.error(
          `❌ Failed on patient=${adherentName} referralId=${referralId} row=${rowId}:`,
          err.message
        );
        results[i].detailsPageError = err.message;
      }

      await goBack(page);
      await page.waitForTimeout(25);
    })
  );

  await Promise.all(tasks);

  return results;
};

export default openPatientsDetailsPageAndDownloadDocuments;
