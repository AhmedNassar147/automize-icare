/*
 *
 * Helper: `processPatientAcceptanceOrRejection`.
 *
 */
import path from "path";
import makeUserLoggedInOrOpenHomePage from "../makeUserLoggedInOrOpenHomePage.mjs";
import openDetailsPageAndDoUserAction from "../openDetailsPageAndDoUserAction.mjs";
import { generatedPdfsPath, USER_ACTION_TYPES } from "../constants.mjs";

const processPatientAcceptanceOrRejection = async ({
  browser,
  password,
  userName,
  patientsStore,
  patient,
  actionType,
  sendWhatsappMessage,
  whatsappNumber,
}) => {
  const { referralId } = patient;

  const isAcceptance = actionType === USER_ACTION_TYPES.ACCEPT;
  const actionTypeTitle = isAcceptance ? "Acceptance" : "Rejection";

  console.log(
    `✅ Starting Patient ${actionTypeTitle}: referralId=${referralId}`
  );

  const [page, isLoggedIn] = await makeUserLoggedInOrOpenHomePage({
    browser,
    password,
    userName,
  });

  if (!isLoggedIn) {
    await browser.close();
    console.error(
      `🛑 Can't processing patient ${actionTypeTitle}, Failed to login to icare app. Exiting...`
    );
    return process.exit(1);
  }

  try {
    const referralIdWithExtension = path.resolve(
      generatedPdfsPath,
      `${actionType}-${referralId}.pdf`
    );

    await openDetailsPageAndDoUserAction({
      actionType,
      browser,
      page,
      patient,
      letterFile: referralIdWithExtension,
    });
  } catch (error) {}
};

export default processPatientAcceptanceOrRejection;
