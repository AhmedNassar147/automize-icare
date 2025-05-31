/*
 *
 * Helper: `findPatientsSectionAnchorAndClickIt`.
 *
 */
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

  await page.waitForNetworkIdle();
};

export default findPatientsSectionAnchorAndClickIt;
