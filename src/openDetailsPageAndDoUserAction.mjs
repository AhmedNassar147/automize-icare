/*
 *
 * Helper: `openDetailsPageAndDoUserAction`.
 *
 */
import navigateToPatientDetailsPage from "./navigateToPatientDetailsPage.mjs";
import checkStopModalAndCloseIt from "./checkStopModalAndCloseIt.mjs";
import collectFilesFromPopupWindow from "./collectFilesFromPopupWindow.mjs";
import getSelectedNationalityFromDropdwon from "./getSelectedNationalityFromDropdwon.mjs";
import openPopupDocumentsViewer from "./openPopupDocumentsViewer.mjs";
import uploadLetterFile from "./uploadLetterFile.mjs";
import { USER_ACTION_TYPES } from "./constants.mjs";
// import clickAppLogo from "./clickAppLogo.mjs";
// import sleep from "./sleep.mjs";

// actionType = "accept" | "reject" | "collect";

const openDetailsPageAndDoUserAction = async ({
  browser,
  page,
  patient,
  letterFile,
  actionType,
}) => {
  const isAcceptType = actionType === USER_ACTION_TYPES.ACCEPT;
  const isRejectType = actionType === USER_ACTION_TYPES.REJECT;
  const isCollectType = actionType === USER_ACTION_TYPES.COLLECT;

  let patientDetails = patient;
  const { adherentName, referralId, actionLinkRef } = patient;

  return new Promise(async (resolve) => {
    try {
      console.log(
        `visit details page for patient=${adherentName} referralId=${referralId} ...`
      );

      await navigateToPatientDetailsPage(page, actionLinkRef);
      // await checkStopModalAndCloseIt(page);

      const { popupPage, canUploadAcceptanceLetter } =
        await openPopupDocumentsViewer(browser, page);

      if (popupPage) {
        await popupPage.waitForSelector(
          !isCollectType ? "#attach_frm" : 'a[href*="OpenAttach.cfm"]'
        );
      }

      if (isCollectType) {
        const files = await collectFilesFromPopupWindow(popupPage); // ✅ Collects files;
        const { text } = await getSelectedNationalityFromDropdwon(page);

        patientDetails.nationality = text;

        if (files) {
          patientDetails.files = files || [];
        }

        if (!popupPage.isClosed()) {
          await popupPage.close(); // ✅ Closes the popup
        }

        console.log(
          `✅ Successfully collected patient=${adherentName} referralId=${referralId}`
        );

        return resolve(patientDetails);
      }

      const isAcceptingOrRejectingPatient =
        (isAcceptType || isRejectType) && canUploadAcceptanceLetter;

      if (isAcceptingOrRejectingPatient) {
        await uploadLetterFile({
          popupPage,
          letterFile,
          isAcceptingPatient: isAcceptType,
        });
        console.log(
          `✅ Successfully uploaded letter file for patient=${adherentName} referralId=${referralId}`
        );
      }

      if (!popupPage.isClosed()) {
        await popupPage.close(); // ✅ Closes the popup
      }

      if (isAcceptingOrRejectingPatient) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: "networkidle2" }),
          page.click(isAcceptType ? "#accept" : "#reject"),
        ]);

        console.log(
          `✅ Visiting the captcha page for patient=${adherentName} referralId=${referralId}`
        );
      }
      return resolve(patientDetails);
    } catch (error) {
      console.error(
        `❌ Failed processing patient=${adherentName} referralId=${referralId}:`,
        err.message
      );

      return resolve(patientDetails);
    }
  });
};

export default openDetailsPageAndDoUserAction;
