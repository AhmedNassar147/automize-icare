/*
 *
 * helper: `waitForWaitingCountWithInterval`.
 *
 */
import clickAppLogo from "./clickAppLogo.mjs";
import sleep from "./sleep.mjs";
import processCollectingPatients from "./process/processCollectingPatients.mjs";
import { PATIENT_SECTIONS_STATUS } from "./constants.mjs";

const waitForWaitingCountWithInterval = async (options) => {
  const {
    page,
    collectConfimrdPatient = false,
    patientsStore,
    sleepMs = 0.75 * 60 * 1000,
    browser,
  } = options;

  console.log(`🧐 Searching for next patients...`);

  const { countFieldSelector, foundCountText, noCountText } =
    PATIENT_SECTIONS_STATUS[collectConfimrdPatient ? "CONFIRMED" : "WAITING"];

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

    await processCollectingPatients({
      browser,
      patientsStore,
      collectConfimrdPatient,
      page,
    });

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
