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
import fillDetailsPageRejectionForm from "./fillDetailsPageRejectionForm.mjs";
import { USER_ACTION_TYPES } from "./constants.mjs";
import clickAppLogo from "./clickAppLogo.mjs";
import sleep from "./sleep.mjs";
import getCaptchaResponsePromiseFromPage from "./getCaptchaResponsePromiseFromPage.mjs";
import getWhenCaseStarted from "./getWhenCaseStarted.mjs";

const MAX_UPLOAD_RETRIES = 6;

const closePopupPage = async (popupPage) => {
  if (popupPage && popupPage.isConnected() && !popupPage.isClosed()) {
    await popupPage.close();
  }
};

const openDetailsPageAndDoUserAction = async (options) => {
  const {
    browser,
    page,
    patient,
    letterFile,
    actionType,
    retryCount = 0,
  } = options;

  const isAcceptType = actionType === USER_ACTION_TYPES.ACCEPT;
  const isRejectType = actionType === USER_ACTION_TYPES.REJECT;
  const isCollectType = actionType === USER_ACTION_TYPES.COLLECT;

  let patientDetails = patient;
  const { adherentName, referralId, actionLinkRef } = patient;

  try {
    console.log(
      `visit details page for patient=${adherentName} referralId=${referralId} ...`
    );

    await navigateToPatientDetailsPage(page, actionLinkRef);
    // await checkStopModalAndCloseIt(page);

    const { popupPage, canUploadLetter } = await openPopupDocumentsViewer(
      browser,
      page
    );

    if (popupPage) {
      await popupPage.waitForSelector(
        !isCollectType ? "#attach_frm" : 'a[href*="OpenAttach.cfm"]'
      );
    }

    if (isCollectType) {
      const [files, nationalityOptions, startedAt] = await Promise.all([
        collectFilesFromPopupWindow(popupPage),
        getSelectedNationalityFromDropdwon(page),
        getWhenCaseStarted(page),
      ]);

      // const files = await collectFilesFromPopupWindow(popupPage); // ✅ Collects files;
      // const { text } = await getSelectedNationalityFromDropdwon(page);
      // const startedAt = await getWhenCaseStarted(page);

      patientDetails.nationality = (nationalityOptions || {}).text;
      patientDetails.startedAt = startedAt;

      if (files) {
        patientDetails.files = files || [];
      }

      await closePopupPage(popupPage);

      console.log(
        `✅ Successfully collected patient=${adherentName} referralId=${referralId}`
      );

      return { patientDetails, isDoneSuccessfully: true };
    }

    if (!canUploadLetter) {
      if (retryCount >= MAX_UPLOAD_RETRIES) {
        const message = `❌ ${retryCount} retries reached: we couldn't find a way to upload the letter for patient=${patient.adherentName} referralId=${patient.referralId}`;
        console.error(message);
        return {
          patientDetails,
          isDoneSuccessfully: false,
          wasTryingToUpload: true,
          uploadError: message,
        };
      }

      await clickAppLogo(page);
      await sleep(200);

      // Increase retry count for recursive call
      return await openDetailsPageAndDoUserAction({
        ...options,
        retryCount: retryCount + 1,
      });
    }

    await uploadLetterFile({
      popupPage,
      letterFile,
      isAcceptingPatient: isAcceptType,
    });

    if (isRejectType) {
      await fillDetailsPageRejectionForm(page);
    }

    await closePopupPage(popupPage);

    // never put await here so we can listen for the captcha response
    const captchaResponsePromise = getCaptchaResponsePromiseFromPage(page);

    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click(isAcceptType ? "#accept" : "#reject"),
    ]);

    console.log(
      `✅ Visiting the captcha page for patient=${adherentName} referralId=${referralId}`
    );

    const captchaFileName = `${adherentName}_${referralId}`;

    const result = await captchaResponsePromise;
    const hasCaptchaResponse = !!result;

    const message = hasCaptchaResponse
      ? "✅ Captcha Image Found, "
      : "❌ No captcha response received in time";

    console.log(
      `${message} for patient=${adherentName} referralId=${referralId}`
    );

    return {
      patientDetails,
      isDoneSuccessfully: hasCaptchaResponse,
      captchaFileName,
      ...(result || {}),
    };
  } catch (error) {
    console.error(
      `❌ Failed processing patient=${adherentName} referralId=${referralId}:`,
      error.message
    );

    return { patientDetails, isDoneSuccessfully: false };
  }
};

export default openDetailsPageAndDoUserAction;
