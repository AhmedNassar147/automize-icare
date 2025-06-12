/*
 *
 * Helper: `openPopupDocumentsViewer`.
 *
 */
const openPopupDocumentsViewer = async (browser, page) => {
  console.log("🔎 Searching for 'View / Link documents'...");

  const canUploadLetter = await page.evaluate(() => {
    const link = document.querySelector(
      '#dvTitle a[onclick^="window.open(Webpath"]'
    );

    if (link) {
      const content = link.textContent || "";
      const canViewOnly = content.includes("View documents");
      const canUploadLetter = content.includes("Link documents");

      if (canViewOnly || canUploadLetter) {
        link.click();
        return canUploadLetter;
      }
    }

    return false;
  });

  const popupTarget = await browser.waitForTarget(
    (target) => {
      const isPageType = target.type() === "page";
      const url = target.url();

      const isPopupWindow =
        url.includes("common/attach.cfm") ||
        url.includes("common/attach_view.cfm");

      return isPageType && isPopupWindow; // or whatever matches the opened URL
    },

    { timeout: 70000 }
  );

  const popupPage = await popupTarget.page();
  await popupPage.bringToFront();

  return {
    popupPage,
    canUploadLetter,
  };
};

export default openPopupDocumentsViewer;
