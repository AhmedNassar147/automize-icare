/*
 *
 * helper: `navigateToPatientDetailsPage`.
 *
 */
import createAbsoluteUrl from "./createAbsoluteUrl.mjs";

const navigateToPatientDetailsPage = async (page, relativePath) => {
  const hasColdFusionNavigate = await page.evaluate(() => {
    return (
      typeof ColdFusion !== "undefined" &&
      typeof ColdFusion.navigate === "function"
    );
  });

  if (hasColdFusionNavigate) {
    await page.evaluate((ref) => {
      ColdFusion.navigate(ref, "WorkArea");
    }, relativePath);
  } else {
    const url = createAbsoluteUrl(page, relativePath);
    await page.goto(url);
  }

  await page.waitForSelector("#dvTitle", {
    timeout: 4000,
  });
};

export default navigateToPatientDetailsPage;
