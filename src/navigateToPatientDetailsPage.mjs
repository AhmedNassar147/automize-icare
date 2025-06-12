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
    console.log(`Trying Navigation using ColdFusion.navigate`);
    await page.evaluate((ref) => {
      ColdFusion.navigate(ref, "WorkArea");
    }, relativePath);
  } else {
    const url = createAbsoluteUrl(page, relativePath);
    console.log(`Trying Navigation using page.goto`);
    await page.goto(url);
  }

  await page.waitForSelector("#dvTitle", {
    timeout: 5000,
  });
};

export default navigateToPatientDetailsPage;
