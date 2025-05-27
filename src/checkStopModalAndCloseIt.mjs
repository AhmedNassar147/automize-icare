/*
 *
 * Helper: `checkStopModalAndCloseIt`.
 *
 */
const checkStopModalAndCloseIt = async (page) => {
  const modalSelector = "div.ui-dialog";
  const closeBtnSelector = "button.ui-dialog-titlebar-close";

  try {
    // Wait for the modal, timeout quickly if not found
    const diaglog = await page.waitForSelector(modalSelector, {
      timeout: 4000,
    });

    if (diaglog) {
      // Modal found, click close button
      await page.click(closeBtnSelector);
    }

    console.log("Modal found and closed.");
  } catch (error) {
    // Timeout means modal not found, so do nothing or handle accordingly
    console.log("Modal not found, nothing to close.");
  }
};

export default checkStopModalAndCloseIt;
