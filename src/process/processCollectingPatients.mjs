/*
 *
 * Helper: `processCollectingPatients`.
 *
 */
import findPatientsSectionAnchorAndClickIt from "../findPatientsSectionAnchorAndClickIt.mjs";
import extractWaitingReferalTableData from "../extractWaitingReferalTableData.mjs";
import openDetailsPageAndDoUserAction from "../openDetailsPageAndDoUserAction.mjs";
import generateAcceptancePdfLetters from "../generatePdfs.mjs";
import clickAppLogo from "../clickAppLogo.mjs";
import { PATIENT_SECTIONS_STATUS, USER_ACTION_TYPES } from "../constants.mjs";

const processCollectingPatients = async ({
  browser,
  patientsStore,
  collectConfimrdPatient,
  page,
}) => {
  console.log("✅ start Collecting Patients...");
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

    if (!patientsData || !patientsData.length) {
      console.log(
        "✅ Could not find Patients in table, Cancelling Collecting Patients..."
      );
      return;
    }

    const filteredPatientsData = patientsData.filter(({ referralId }) => {
      const { patient: foundPatient } =
        patientsStore.findPatientByReferralId(referralId);
      return !foundPatient && !!referralId;
    });

    if (!filteredPatientsData || !filteredPatientsData.length) {
      console.log(
        "✅ No New Patients Found, Cancelling Collecting Patients..."
      );
      return;
    }

    console.time("collecting patient data from details page");

    const patientsLength = filteredPatientsData.length;
    const lastPatientIndex = patientsLength - 1;

    const results = [];
    let currentIndex = 0;

    while (currentIndex <= lastPatientIndex) {
      const patient = filteredPatientsData[currentIndex];

      const { patientDetails } = await openDetailsPageAndDoUserAction({
        actionType: USER_ACTION_TYPES.COLLECT,
        browser,
        page,
        patient,
      });

      results[currentIndex] = patientDetails;

      currentIndex++;
    }

    patientsStore.addPatients(results);
    console.timeEnd("collecting patient data from details page");

    // we do this so the generation done in background
    // and we don't to block the next count search
    (async () => {
      try {
        await Promise.all([
          generateAcceptancePdfLetters(browser, filteredPatientsData, true),
          generateAcceptancePdfLetters(browser, filteredPatientsData),
        ]);
      } catch (error) {
        console.log("🛑 Error when generating patient Letters:", error);
      }
    })();
  } catch (err) {
    console.log("🛑 Error when collecting patients:", err);
  } finally {
    try {
      await clickAppLogo(page);
    } catch (error) {
      console.log(
        "🛑 Error when clicking app logo when collecting patients:",
        error
      );
    }
  }
};

export default processCollectingPatients;
