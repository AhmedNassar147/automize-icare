/*
 *
 * Helper: `getWhenCaseStarted`.
 *
 */
const MINUTES_TO_WAIT = 1;

// const formatDateToYMDHM = (date) => {
//   const pad = (n) => String(n).padStart(2, "0");
//   const padMs = (n) => String(n).padStart(3, "0");

//   const year = date.getFullYear();
//   const month = pad(date.getMonth() + 1);
//   const day = pad(date.getDate());
//   const hours = pad(date.getHours());
//   const minutes = pad(date.getMinutes());
//   const seconds = pad(date.getSeconds());
//   const milliseconds = padMs(date.getMilliseconds());

//   return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
// };

const getWhenCaseStarted = async (page) => {
  const timeout = MINUTES_TO_WAIT * 60000;

  console.log(
    `Waiting for #dvError to appear (timeout: ${MINUTES_TO_WAIT} minute)...`
  );

  await page.waitForSelector("#dvError", { timeout }).catch(() => null);

  const minutes = await page.evaluate(() => {
    const el = document.querySelector("#dvError");
    if (!el) return null;

    const text = el.textContent.trim();
    const match = text.match(/(\d+)\s*(minutes?|mins?)/i);
    return match ? parseInt(match[1], 10) : null;
  });

  const now = new Date();

  if (minutes !== null) {
    const startTime = new Date(now.getTime() - minutes * 60000);

    const isoFormated = startTime.toISOString();

    console.log(
      `Countdown detected in #dvError (${minutes} mins). Started at: ${isoFormated}`
    );

    return isoFormated;
  }

  const startTime = new Date(now.getTime() - 15 * 60000);

  const isoFormated = startTime.toISOString();

  console.log(
    `No #dvError or minutes found: backword 15 minutes: ${isoFormated}`
  );

  return isoFormated;
};

export default getWhenCaseStarted;
