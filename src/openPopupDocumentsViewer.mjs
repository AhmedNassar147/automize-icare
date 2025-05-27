/*
 *
 * Helper: `openPopupDocumentsViewer`.
 *
 */
const openPopupDocumentsViewer = async (browser, page) => {
  // Wait and click "View documents"
  await page.waitForSelector('a[onclick*="attach_view.cfm"]', {
    timeout: 5000,
  });

  // Click the "View documents" and wait for popup
  const [popupPage] = await Promise.all([
    new Promise((resolve) =>
      browser.once("targetcreated", (target) => resolve(target.page()))
    ),
    page.click('a[onclick*="attach_view.cfm"]'),
  ]);

  await popupPage.bringToFront();
  await popupPage.waitForSelector('a[href*="OpenAttach.cfm"]');

  // Get base URL of popup (e.g., https://purchasingprogramsaudi.com/some/path/)
  const baseUrl = await popupPage.evaluate(
    () =>
      window.location.origin + window.location.pathname.replace(/[^/]+$/, "")
  );

  return [popupPage, baseUrl];
};

export default openPopupDocumentsViewer;
