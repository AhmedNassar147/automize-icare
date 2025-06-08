/*
 *
 * Helper: `processPatientAcceptanceOrRejection`.
 *
 */
import { unlink } from "fs/promises";
import path from "path";
import makeUserLoggedInOrOpenHomePage from "../makeUserLoggedInOrOpenHomePage.mjs";
import openDetailsPageAndDoUserAction from "../openDetailsPageAndDoUserAction.mjs";
import fillCaptchaFormAndSubmit from "../fillCaptchaFormAndSubmit.mjs";
import { generatedPdfsPath, USER_ACTION_TYPES } from "../constants.mjs";

const { ACCEPT, REJECT } = USER_ACTION_TYPES;

const processPatientAcceptanceOrRejection = async ({
  browser,
  patientsStore,
  patient,
  actionType,
  sendWhatsappMessage,
}) => {
  const { referralId, adherentName } = patient;
  const isAcceptance = actionType === ACCEPT;
  const actionTypeTitle = isAcceptance ? "Acceptance" : "Rejection";

  console.log(
    `✅ Starting Patient ${actionTypeTitle}: referralId=${referralId}`
  );

  const [page, isLoggedIn] = await makeUserLoggedInOrOpenHomePage(browser);

  if (!isLoggedIn) {
    console.error(
      `🛑 Can't process patient ${actionTypeTitle}, Failed to login to icare app. Exiting...`
    );
    await browser.close();
  }

  const actionLetterFile = path.resolve(
    generatedPdfsPath,
    `${actionType}-${referralId}.pdf`
  );
  const oppositeActionLetterFile = path.resolve(
    generatedPdfsPath,
    `${isAcceptance ? REJECT : ACCEPT}-${referralId}.pdf`
  );

  async function cleanupPatientAndFiles() {
    try {
      await Promise.all([
        patientsStore.removePatientByReferralId(referralId),
        unlink(actionLetterFile),
        unlink(oppositeActionLetterFile),
      ]);
    } catch (error) {
      console.log(
        `🛑 Error when deleting patient letters and data for referralId=${referralId}:`,
        error
      );
    }
  }

  try {
    const {
      captchaBase64,
      captchaExtension,
      captchaFileName,
      wasTryingToUpload,
      isDoneSuccessfully,
      uploadError,
    } = await openDetailsPageAndDoUserAction({
      actionType,
      browser,
      page,
      patient,
      letterFile: actionLetterFile,
    });

    const baseMessage = `🚨 *\`${actionTypeTitle.toUpperCase()}\`* Case Alert! 🚨
🆔 Referral: *${referralId}*
👤 Name: _${adherentName}_

`;

    if (wasTryingToUpload && !isDoneSuccessfully) {
      await sendWhatsappMessage(process.env.CLIENT_WHATSAPP_NUMBER, {
        message: `${baseMessage}❌ Status: *ERROR* \n *Reason*: _${uploadError}_ ⚠️`,
      });

      await cleanupPatientAndFiles();
      return;
    }

    const { isAccepted, message } = await fillCaptchaFormAndSubmit({
      captchaBase64,
      isAcceptance,
      page,
      captchaExtension,
      captchaFileName,
    });

    await sendWhatsappMessage(process.env.CLIENT_WHATSAPP_NUMBER, {
      message: isAccepted
        ? `${baseMessage}_${message}_ \n✅ Status: *ACCEPTED* 🎉`
        : `${baseMessage}❌ Status: *REJECTED* \n *Reason*: _${message}_ ⚠️`,
    });
  } catch (error) {
    await cleanupPatientAndFiles();
    console.log(
      `🛑 Error when processing patient ${actionTypeTitle} (referralId=${referralId}):`,
      error
    );
  } finally {
    await page.close();
  }
};

export default processPatientAcceptanceOrRejection;
