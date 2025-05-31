/*
 *
 * Helper: `findPatientsSectionAnchorAndClickIt`.
 *
 */
import sleep from "./sleep.mjs";

const findPatientsSectionAnchorAndClickIt = async (page, pupultaeFnText) => {
  await page.evaluate(
    ({ pupultaeFnText }) => {
      const anchor = document.querySelector(
        `a[onclick^="populateNotificationsMOHTable('${pupultaeFnText}'"]`
      );

      if (anchor) {
        anchor.click();
      }
    },
    { pupultaeFnText }
  );

  await sleep(200);
};

export default findPatientsSectionAnchorAndClickIt;
