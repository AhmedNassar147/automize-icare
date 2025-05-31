/*
 *
 * Helper: `openPatientsDetailsPageAndDownloadDocuments`.
 *
 */
import downloadDocumentsFromPopupViewer from "./downloadDocumentsFromPopupViewer.mjs";
import checkStopModalAndCloseIt from "./checkStopModalAndCloseIt.mjs";
import navigateToPatientDetailsPage from "./navigateToPatientDetailsPage.mjs";
import goBack from "./goBack.mjs";
import getSelectedNationalityFromDropdwon from "./getSelectedNationalityFromDropdwon.mjs";

const openPatientsDetailsPageAndDownloadDocuments = async ({
  browser,
  page,
  patientsData,
}) => {
  const results = patientsData;
  const clonedPatientData = [...patientsData];

  while (clonedPatientData.length) {
    const [{ adherentName, referralId, actionLinkRef }] =
      clonedPatientData.splice(0, 1);

    try {
      console.log(
        `visit details page for patient=${adherentName} referralId=${referralId} ...`
      );

      await navigateToPatientDetailsPage(page, actionLinkRef);

      await checkStopModalAndCloseIt(page);

      const { text } = await getSelectedNationalityFromDropdwon(page);

      results[i].nationality = text;

      const files = await downloadDocumentsFromPopupViewer(browser, page);
      results[i].files = files || [];

      console.log(
        `✅ Successfully processed patient=${adherentName} referralId=${referralId}`
      );
    } catch (err) {
      console.error(
        `❌ Failed on patient=${adherentName} referralId=${referralId}:`,
        err.message
      );
    }

    await goBack(page);
    // await page.waitForTimeout(10);
  }

  return results;
};

export default openPatientsDetailsPageAndDownloadDocuments;
