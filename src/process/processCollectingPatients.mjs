/*
 *
 * Helper: `processCollectingPatients`.
 *
 */
import extractWaitingReferalTableData from "../extractWaitingReferalTableData.mjs";
import openDetailsPageAndDoUserAction from "../openDetailsPageAndDoUserAction.mjs";
import generateAcceptancePdfLetters from "../generatePdfs.mjs";
import { USER_ACTION_TYPES } from "../constants.mjs";

const processCollectingPatients = async ({ browser, patientsStore, page }) => {
  console.log("✅ start Collecting Patients...");
  try {
    const patientsData = await extractWaitingReferalTableData(page);

    if (!patientsData || !patientsData.length) {
      console.log("✅ No patients in table, canceling...");
      return;
    }

    const filteredPatientsData = patientsData.filter(({ referralId }) => {
      const { patient: found } =
        patientsStore.findPatientByReferralId(referralId);
      return !found && !!referralId;
    });

    const filteredPatientLength = filteredPatientsData.length;

    if (!filteredPatientLength) {
      console.log("✅ No new patients found.");
      return;
    }

    console.time("collecting patient data from details page");

    const results = [];

    for (let i = 0; i < filteredPatientLength; i++) {
      const patient = filteredPatientsData[i];

      console.log(
        `🔍 Processing patient ${i + 1} of ${filteredPatientLength}...`
      );

      try {
        const { patientDetails } = await openDetailsPageAndDoUserAction({
          actionType: USER_ACTION_TYPES.COLLECT,
          browser,
          page,
          patient,
        });

        if (patientDetails) {
          results.push(patientDetails);
        }
      } catch (err) {
        console.warn(`❌ Failed to process patient ${i + 1}:`, err.message);
      }
    }

    await patientsStore.addPatients(results.filter(Boolean));
    console.timeEnd("collecting patient data from details page");

    (async () => {
      try {
        await Promise.all([
          generateAcceptancePdfLetters(browser, filteredPatientsData, true),
          generateAcceptancePdfLetters(browser, filteredPatientsData),
        ]);
      } catch (error) {
        console.error("🛑 Error generating PDFs:", error.message);
      }
    })();
  } catch (err) {
    console.error("🛑 Fatal error during collecting patients:", err.message);
  }
};

export default processCollectingPatients;
