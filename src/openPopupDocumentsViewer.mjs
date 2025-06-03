/*
 *
 * Helper: `openPopupDocumentsViewer`.
 *
 */
const openPopupDocumentsViewer = async (browser, page) => {
  console.log("🔎 Trying to find 'View / Link documents' and click it...");

  const [popupPage, canUploadAcceptanceLetter] = await Promise.all([
    new Promise((resolve) => {
      browser.once("targetcreated", async (target) => {
        const page = await target.page();

        if (!page) return; // Safety

        if (page) {
          await page.bringToFront();
          resolve(page);
        }
      });
    }),
    page.evaluate(() => {
      const link = document.querySelector(
        '#dvTitle a[onclick^="window.open(Webpath"]'
      );
      if (link) {
        const content = link.textContent || "";

        const canViewOnly = content.includes("View documents");
        const canUploadAcceptanceLetter = content.includes("Link documents");

        if (canViewOnly || canUploadAcceptanceLetter) {
          link.click();
        }

        return canUploadAcceptanceLetter;
      }

      return false; // Explicit fallback if no link is found
    }),
  ]);

  return {
    popupPage,
    canUploadAcceptanceLetter,
  };
};

export default openPopupDocumentsViewer;
