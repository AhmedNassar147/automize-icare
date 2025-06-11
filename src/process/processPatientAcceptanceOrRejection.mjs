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
import sleep from "../sleep.mjs";
import closePageSafely from "../closePageSafely.mjs";

const { ACCEPT, REJECT } = USER_ACTION_TYPES;

const NORMAL_TIMEOUT_DURATION = 2 * 60 * 1000; // 2 minutes
const MAX_RETRIES = 5;

const processPatientAcceptanceOrRejection = async (options) => {
  const {
    browser,
    patientsStore,
    patient,
    actionType,
    sendWhatsappMessage,
    retryCount = 0,
  } = options;

  const { referralId, adherentName } = patient;
  const isAcceptance = actionType === ACCEPT;
  const actionTypeTitle = isAcceptance ? "Acceptance" : "Rejection";

  console.log(
    `✅ Starting Patient ${actionTypeTitle}: referralId=${referralId}`
  );

  let page, isLoggedIn;

  const actionLetterFile = path.resolve(
    generatedPdfsPath,
    `${actionType}-${referralId}.pdf`
  );

  const oppositeActionLetterFile = path.resolve(
    generatedPdfsPath,
    `${isAcceptance ? REJECT : ACCEPT}-${referralId}.pdf`
  );

  const baseMessage = `🚨 *\`${actionTypeTitle.toUpperCase()}\`* Case Alert! 🚨
🆔 Referral: *${referralId}*
👤 Name: _${adherentName}_

`;

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
        error.message
      );
    }
  }

  try {
    [page, isLoggedIn] = await makeUserLoggedInOrOpenHomePage(browser);
  } catch (error) {
    console.error(
      `🛑 Error When process patient ${actionTypeTitle}, ${error.message}`
    );
  }

  if (!isLoggedIn) {
    if (retryCount >= MAX_RETRIES) {
      await closePageSafely(page);

      const message = `🛑 Can't process patient ${actionTypeTitle}\nThe Site hangs and couldn't re-login for ${MAX_RETRIES} times.`;

      await sendWhatsappMessage(process.env.CLIENT_WHATSAPP_NUMBER, {
        message: `${baseMessage}❌ Status: *ERROR* \n *Reason*: _${message}_ ⚠️`,
      });

      return;
    }

    const message = `🛑 Can't process patient ${actionTypeTitle}, something went wrong when opening the icare app, retrying...`;
    console.error(message);
    await closePageSafely(page);
    await sleep(NORMAL_TIMEOUT_DURATION);

    return processPatientAcceptanceOrRejection({
      ...options,
      retryCount: retryCount + 1,
    });
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
    console.log(
      `🛑 Error when processing patient ${actionTypeTitle} (referralId=${referralId}):`,
      error
    );
  } finally {
    await closePageSafely(page);
  }
};

export default processPatientAcceptanceOrRejection;
