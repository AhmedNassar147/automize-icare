/*
 *
 * Helper: `checkStopModalAndCloseIt`.
 *
 */
const checkStopModalAndCloseIt = async (page) => {
  const closeBtnSelector = ".ui-dialog-titlebar-close";

  try {
    // Try closing the modal from the main document
    await page.waitForSelector(closeBtnSelector);
    await page.click(closeBtnSelector);
    console.log("Modal closed from main page");
  } catch (mainError) {
    console.warn("Main page modal close failed, trying iframe...");

    try {
      // If not found in main page, try iframe
      const frameHandle = await page.$("iframe"); // replace with actual iframe selector if needed

      let frame;

      if (frameHandle) {
        frame = await frameHandle.contentFrame();
      }

      if (frame) {
        await frame.waitForSelector(closeBtnSelector, {
          visible: true,
          timeout: 3000,
        });
        await frame.click(closeBtnSelector);
        console.log("Modal closed from iframe");
      } else {
        console.warn("Iframe not found or not accessible");
      }
    } catch (iframeError) {
      console.error("Failed to close modal in both main page and iframe");
      console.error("Main Error:", mainError.message);
      console.error("Iframe Error:", iframeError.message);
    }
  }
};

export default checkStopModalAndCloseIt;
