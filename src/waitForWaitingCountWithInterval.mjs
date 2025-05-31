/*
 *
 * helper: `waitForWaitingCountWithInterval`.
 *
 */

const STATUS = {
  WAITING: {
    countFieldSelector: "spfnc_waiting_confirmation_referral",
    pupultaeFnText: "fnc_waiting_confirmation_referral",
    foundCountText: "waiting confirmation referrals",
    noCountText: "No waiting confirmation referrals found",
  },
  CONFIRMED: {
    countFieldSelector: "spfnc_confirmed_referral_requests",
    pupultaeFnText: "fnc_confirmed_referral_requests",
    foundCountText: "confirmed referrals requests",
    noCountText: "No confirmed referrals requests found",
  },
};

const waitForWaitingCountWithInterval = async (
  page,
  collectConfimrdPatient = false,
  intervalMs = 1000
) => {
  const { countFieldSelector, pupultaeFnText, foundCountText, noCountText } =
    STATUS[collectConfimrdPatient ? "CONFIRMED" : "WAITING"];

  await page.waitForSelector(`#${countFieldSelector}`);

  return new Promise((resolve) => {
    let intervalId;

    const check = async () => {
      const waitingCount = await page.evaluate(
        ({ countFieldSelector }) => {
          const span = document.getElementById(countFieldSelector);
          return span ? parseInt(span.textContent.trim(), 10) : 0;
        },
        { countFieldSelector }
      );

      if (waitingCount > 0) {
        console.log(`🔔 There are ${waitingCount} ${foundCountText}.`);

        await page.evaluate(
          ({ pupultaeFnText }) => {
            const anchor = document.querySelector(
              // `a[onclick^="populateNotificationsMOHTable(\'${pupultaeFnText}"]`
              `a[onclick^="populateNotificationsMOHTable('${pupultaeFnText}'"]`
            );

            if (anchor) {
              anchor.click();
            }
          },
          { pupultaeFnText }
        );

        if (intervalId) {
          clearInterval(intervalId);
        }
        resolve(waitingCount);
      } else {
        console.log(
          `✅ ${noCountText}, will check again in ${
            intervalMs / 1000
          } seconds..`
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
