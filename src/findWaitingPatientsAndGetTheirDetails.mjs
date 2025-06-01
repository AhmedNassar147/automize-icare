/*
 *
 * Helper: `findWaitingPatientsAndGetTheirDetails`.
 *
 */
import extractWaitingReferalTableData from "./extractWaitingReferalTableData.mjs";
import findPatientsSectionAnchorAndClickIt from "./findPatientsSectionAnchorAndClickIt.mjs";
import openPatientsDetailsPageAndDownloadDocuments from "./openPatientsDetailsPageAndDownloadDocuments.mjs";
import writePatientData from "./writePatientData.mjs";
import { PATIENT_SECTIONS_STATUS } from "./constants.mjs";

const findWaitingPatientsAndGetTheirDetails = async ({
  browser,
  page,
  collectConfimrdPatient,
}) => {
  const { pupultaeFnText } =
    PATIENT_SECTIONS_STATUS[collectConfimrdPatient ? "CONFIRMED" : "WAITING"];

  await findPatientsSectionAnchorAndClickIt(page, pupultaeFnText);

  await page.waitForFunction(() => {
    const rows = document.querySelectorAll(
      "#tblOutNotificationsTable tbody tr"
    );
    return rows.length >= 2;
  });

  await page.waitForFunction(() => {
    const rows = document.querySelectorAll(
      "#tblOutNotificationsTable tbody tr"
    );
    return rows.length >= 2;
  });

  const patientsData = await extractWaitingReferalTableData(page);

  // console.log("patientsData", JSON.stringify(patientsData, null, 2));

  console.time("fetchingEveryPatientDetails");

  const patientsWithFiles = await openPatientsDetailsPageAndDownloadDocuments({
    browser,
    page,
    patientsData,
  });

  await writePatientData(patientsWithFiles);

  console.timeEnd("fetchingEveryPatientDetails");

  return patientsWithFiles;
};

export default findWaitingPatientsAndGetTheirDetails;
