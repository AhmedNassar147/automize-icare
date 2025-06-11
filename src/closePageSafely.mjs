/*
 *
 * Helper: `closePageSafely`.
 *
 */
const closePageSafely = async (page, isPopup) => {
  const isConnected = isPopup ? page && page.isConnected() : true;

  if (page && isConnected && !page.isClosed()) {
    await page.close();
  }
};

export default closePageSafely;
