/*
 *
 * helper: `waitForWaitingCountWithInterval`.
 *
 */
const waitForWaitingCountWithInterval = async (page, intervalMs = 1000) => {
  return new Promise((resolve) => {
    let intervalId;

    const check = async () => {
      const waitingCount = await page.evaluate(() => {
        const span = document.querySelector(
          "#spfnc_waiting_confirmation_referral"
        );
        return span ? parseInt(span.textContent.trim(), 10) : 0;
      });

      if (waitingCount > 0) {
        console.log(
          `🔔 There are ${waitingCount} waiting confirmation referrals.`
        );
        if (intervalId) {
          clearInterval(intervalId);
        }
        resolve(waitingCount);
      } else {
        console.log(
          `✅ No waiting confirmation referrals found, will check again in ${
            intervalMs / 1000
          } seconds...`
        );
      }
    };

    // Run the first check immediately, then start interval only after it completes
    check().then(() => {
      // Start interval only if not resolved yet
      if (!intervalId) {
        intervalId = setInterval(check, intervalMs);
      }
    });
  });
};

export default waitForWaitingCountWithInterval;
