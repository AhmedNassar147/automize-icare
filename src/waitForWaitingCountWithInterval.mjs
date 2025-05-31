/*
 *
 * helper: `waitForWaitingCountWithInterval`.
 *
 */
import clickAppLogo from "./clickAppLogo.mjs";
import sleep from "./sleep.mjs";
import findPatientsSectionAnchorAndClickIt from "./findPatientsSectionAnchorAndClickIt.mjs";
import { PATIENT_SECTIONS_STATUS } from "./constants.mjs";

const waitForWaitingCountWithInterval = async (options) => {
  const {
    page,
    collectConfimrdPatient = false,
    patientsStore,
    sleepMs = 0.5 * 60 * 1000,
  } = options;

  const { countFieldSelector, pupultaeFnText, foundCountText, noCountText } =
    PATIENT_SECTIONS_STATUS[collectConfimrdPatient ? "CONFIRMED" : "WAITING"];

  await page.waitForNetworkIdle();
  await page.waitForSelector(`#${countFieldSelector}`);

  const waitingCount = await page.evaluate(
    ({ countFieldSelector }) => {
      const span = document.getElementById(countFieldSelector);
      return span ? parseInt(span.textContent.trim(), 10) : 0;
    },
    { countFieldSelector }
  );

  if (waitingCount > 0) {
    console.log(`🔔 There are ${waitingCount} ${foundCountText}.`);

    await findPatientsSectionAnchorAndClickIt(page, pupultaeFnText);

    await patientsStore.startCollectingPatients();
    console.log(`re-searching fro next count...`);
    await sleep(sleepMs);
    await waitForWaitingCountWithInterval(options);
  } else {
    console.log(`${noCountText}, refreshing...`);
    await clickAppLogo(page);
    await sleep(sleepMs);
    await waitForWaitingCountWithInterval(options);
  }
};

export default waitForWaitingCountWithInterval;
