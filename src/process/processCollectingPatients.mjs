/*
 *
 * Helper: `processCollectingPatients`.
 *
 */
import makeUserLoggedInOrOpenHomePage from "../makeUserLoggedInOrOpenHomePage.mjs";
import findPatientsSectionAnchorAndClickIt from "../findPatientsSectionAnchorAndClickIt.mjs";
import extractWaitingReferalTableData from "../extractWaitingReferalTableData.mjs";
import openDetailsPageAndDoUserAction from "../openDetailsPageAndDoUserAction.mjs";
import generateAcceptancePdfLetters from "../generatePdfs.mjs";
import { PATIENT_SECTIONS_STATUS, USER_ACTION_TYPES } from "../constants.mjs";

const processCollectingPatients = async ({
  browser,
  password,
  userName,
  patientsStore,
  collectConfimrdPatient,
}) => {
  console.log("✅ start Collecting Patients...");

  const [page, isLoggedIn] = await makeUserLoggedInOrOpenHomePage({
    browser,
    password,
    userName,
  });

  if (!isLoggedIn) {
    await browser.close();
    console.error(
      "🛑 Can't collect patients, Failed to login to icare app. Exiting..."
    );
    return process.exit(1);
  }

  try {
    const { pupultaeFnText } =
      PATIENT_SECTIONS_STATUS[collectConfimrdPatient ? "CONFIRMED" : "WAITING"];

    await findPatientsSectionAnchorAndClickIt(page, pupultaeFnText);

    await page.waitForFunction(() => {
      const rows = document.querySelectorAll(
        "#tblOutNotificationsTable tbody tr"
      );
      return rows.length >= 2;
    });

    const patientsData = await extractWaitingReferalTableData(page);

    console.time("openPatientsDetailsPageAndDoAction");

    const patientsLength = patientsData.length;
    const lastPatientIndex = patientsLength - 1;

    const results = [];
    let currentIndex = 0;

    while (currentIndex <= lastPatientIndex) {
      const patient = patientsData[currentIndex];

      const collectedPatientData = await openDetailsPageAndDoUserAction({
        actionType: USER_ACTION_TYPES.COLLECT,
        browser,
        page,
        patient,
      });

      results[currentIndex] = collectedPatientData;

      currentIndex++;
    }

    patientsStore.addPatients(results);
    console.timeEnd("openPatientsDetailsPageAndDoAction");
    await Promise.all([
      generateAcceptancePdfLetters(browser, patientsData, true),
      generateAcceptancePdfLetters(browser, patientsData),
    ]);
  } catch (err) {
    console.log("🛑 Error when collecting patients:", err);
  } finally {
    patientsStore.finishCollecting(); // allow next collection
    await page.close();
  }
};

export default processCollectingPatients;
