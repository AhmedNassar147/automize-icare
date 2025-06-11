/*
 *
 * Helper: `findPatientsSectionAnchorAndClickIt`.
 *
 */
const findPatientsSectionAnchorAndClickIt = async (page, pupultaeFnText) => {
  const anchorFound = await page.evaluate(
    ({ pupultaeFnText }) => {
      const anchor = document.querySelector(
        `a[onclick^="populateNotificationsMOHTable('${pupultaeFnText}'"]`
      );

      if (anchor) {
        anchor.click();

        return true;
      }

      return false;
    },
    { pupultaeFnText }
  );

  // await page.waitForNetworkIdle();

  return anchorFound;
};

export default findPatientsSectionAnchorAndClickIt;
