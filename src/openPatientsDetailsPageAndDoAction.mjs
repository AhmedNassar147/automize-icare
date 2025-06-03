/*
 *
 * Helper: `openPatientsDetailsPageAndDoAction`.
 *
 */
import collectFilesFromPopupWindow from "./collectFilesFromPopupWindow.mjs";
import checkStopModalAndCloseIt from "./checkStopModalAndCloseIt.mjs";
import navigateToPatientDetailsPage from "./navigateToPatientDetailsPage.mjs";
import clickAppLogo from "./clickAppLogo.mjs";
import sleep from "./sleep.mjs";
import getSelectedNationalityFromDropdwon from "./getSelectedNationalityFromDropdwon.mjs";
import openPopupDocumentsViewer from "./openPopupDocumentsViewer.mjs";
import uploadAcceptanceLetter from "./uploadLetterFile.mjs";

// actionType = "accept" | "reject";

const openPatientsDetailsPageAndDoAction = async ({
  browser,
  page,
  patientsData,
  letterFile,
}) => {
  const results = patientsData;
  const clonedPatientData = [...patientsData];

  let currentIndex = 0;

  while (clonedPatientData.length) {
    const [{ adherentName, referralId, actionLinkRef }] =
      clonedPatientData.splice(0, 1);

    try {
      await navigateToPatientDetailsPage(page, actionLinkRef);
      // await checkStopModalAndCloseIt(page);

      const { popupPage, canUploadAcceptanceLetter } =
        await openPopupDocumentsViewer(browser, page);

      let files;

      if (canUploadAcceptanceLetter) {
        await uploadAcceptanceLetter(popupPage, letterFile);
      } else {
        files = await collectFilesFromPopupWindow(popupPage); // ✅ Collects files;
      }

      if (!popupPage.isClosed()) {
        await popupPage.close(); // ✅ Closes the popup
      }

      if (results[currentIndex]) {
        const { text } = await getSelectedNationalityFromDropdwon(page);

        if (text) {
          results[currentIndex].nationality = text;
        }

        if (files) {
          results[currentIndex].files = files || [];
        }
      }

      if (isAcceptType) {
      }

      console.log(
        `✅ Successfully processed patient=${adherentName} referralId=${referralId}`
      );
    } catch (err) {
      console.error(
        `❌ Failed on patient=${adherentName} referralId=${referralId}:`,
        err.message
      );
    }

    await clickAppLogo(page);
    await sleep(25);
    currentIndex++;
  }

  return results;
};

export default openPatientsDetailsPageAndDoAction;
