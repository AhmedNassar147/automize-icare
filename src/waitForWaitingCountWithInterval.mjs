/*
 *
 * Helper: `waitForWaitingCountWithInterval`.
 *
 */
import clickAppLogo from "./clickAppLogo.mjs";
import sleep from "./sleep.mjs";
import findPatientsSectionAnchorAndClickIt from "./findPatientsSectionAnchorAndClickIt.mjs";
import processCollectingPatients from "./process/processCollectingPatients.mjs";
import makeUserLoggedInOrOpenHomePage from "./makeUserLoggedInOrOpenHomePage.mjs";
import closePageSafely from "./closePageSafely.mjs";
import { PATIENT_SECTIONS_STATUS } from "./constants.mjs";

// const MINUT_DURATION_MS = 1 * 60 * 1000; // 1 minutes
const MAX_FAILURE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const RETRY_FAILURE_DURATION_MS = 3 * 60 * 1000; // 3 minutes
const NORMAL_TIMEOUT_DURATION = 1.5 * 60 * 1000; // 1.5 minutes

const waitForWaitingCountWithInterval = async (options) => {
  let {
    collectConfimrdPatient = false,
    patientsStore,
    browser,
    currentPage,
    failureStartTime = null,
  } = options;

  while (true) {
    let page, isLoggedIn;

    // Attempt login or open home page
    try {
      [page, isLoggedIn] = await makeUserLoggedInOrOpenHomePage(
        browser,
        currentPage
      );
    } catch (err) {
      console.error("🛑 Error during login/home open:", err.message);
      await closePageSafely(page);
      await sleep(NORMAL_TIMEOUT_DURATION);
      currentPage = undefined;
      failureStartTime = failureStartTime || Date.now();
      continue;
    }

    if (!isLoggedIn) {
      const now = Date.now();
      const start =
        typeof failureStartTime === "number" ? failureStartTime : now;
      const isMaxFailureReached = now - start > MAX_FAILURE_DURATION_MS;

      const warningMessage = isMaxFailureReached
        ? "Reached 5 minutes. Closing page..."
        : "Refreshing page...";

      console.warn(`⚠️ Login failed. ${warningMessage}`);

      if (isMaxFailureReached) {
        await closePageSafely(page);
        await sleep(RETRY_FAILURE_DURATION_MS);
        currentPage = undefined;
        failureStartTime = null;
      } else {
        await sleep(NORMAL_TIMEOUT_DURATION);
        await page.reload({ waitUntil: "networkidle0" });
        currentPage = page;
        failureStartTime = start;
      }

      continue;
    }

    // Reset failure time after successful login
    failureStartTime = null;

    console.log(`🧐 Searching for next patients...`);

    const { countFieldSelector, foundCountText, noCountText, pupultaeFnText } =
      PATIENT_SECTIONS_STATUS[collectConfimrdPatient ? "CONFIRMED" : "WAITING"];

    let waitingCount = 0;

    try {
      const countHandle = await page.waitForFunction(
        (selector) => {
          const el = document.getElementById(selector);
          if (!el) return null;
          const value = parseInt(el.textContent.trim(), 10);
          return isNaN(value) ? 0 : value;
        },
        { timeout: NORMAL_TIMEOUT_DURATION * 1.5 },
        countFieldSelector
      );

      waitingCount = await countHandle.jsonValue();
    } catch (err) {
      console.warn(`⚠️ Failed to get waiting count: ${err.message}`);
    }

    if (waitingCount > 0) {
      console.log(`🔔 Found ${waitingCount} ${foundCountText}.`);

      try {
        await findPatientsSectionAnchorAndClickIt(page, pupultaeFnText);
      } catch (err) {
        console.warn("⚠️ Failed to click patient section anchor:", err.message);
        await sleep(NORMAL_TIMEOUT_DURATION);
        continue;
      }

      let isTableLoaded = false;
      try {
        const handle = await page.waitForFunction(
          () => {
            const rows = document.querySelectorAll(
              "#tblOutNotificationsTable tbody tr"
            );
            return rows.length >= 2;
          },
          { timeout: NORMAL_TIMEOUT_DURATION }
        );

        isTableLoaded = await handle.jsonValue();
      } catch (err) {
        console.warn("⚠️ Table not loaded in time:", err.message);
      }

      if (isTableLoaded) {
        try {
          await processCollectingPatients({
            browser,
            patientsStore,
            page,
          });
        } catch (err) {
          console.error("🛑 Error processing patients:", err.message);
        }
      }

      await clickAppLogo(page);
      // await sleep(NORMAL_TIMEOUT_DURATION);

      currentPage = page;
      continue;
    }

    console.log(`${noCountText}, refreshing...`);

    await sleep(NORMAL_TIMEOUT_DURATION);
    await clickAppLogo(page);

    currentPage = page;
  }
};

export default waitForWaitingCountWithInterval;
