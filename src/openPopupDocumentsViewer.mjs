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
    (target) =>
      target.type() === "page" &&
      target.url() !== "about:blank" && // wait until it starts loading a real URL
      target.url().includes("common/attach_view.cfm"), // or whatever matches the opened URL
    { timeout: 9000 }
  );

  const popupPage = await popupTarget.page();
  await popupPage.bringToFront();

  return {
    popupPage,
    canUploadLetter,
  };
};

export default openPopupDocumentsViewer;
