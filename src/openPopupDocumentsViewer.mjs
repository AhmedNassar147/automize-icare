/*
 *
 * Helper: `openPopupDocumentsViewer`.
 *
 */
const openPopupDocumentsViewer = async (browser, page) => {
  // Click the "View documents" and wait for popup
  const [popupPage] = await Promise.all([
    new Promise((resolve) =>
      browser.once("targetcreated", (target) => resolve(target.page()))
    ),

    page.evaluate(() => {
      const link = Array.from(document.querySelectorAll("#dvTitle a")).find(
        (a) => {
          const content = a.textContent || "";

          return (
            content.includes("View documents") ||
            content.includes("Link documents")
          );
        }
      );
      if (link) {
        link.click();
      }
    }),
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
