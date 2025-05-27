/*
 *
 * Helper: `generateAcceptancePdfLetters`.
 *
 */
import os from "os";
import pLimit from "p-limit";
import generateAcceptanceLetterHtml from "./generateAcceptanceLetterHtml.mjs";

const generateAcceptancePdfLetters = async (browser, patientsArray) => {
  const result = {};

  const cpuCount = os.cpus().length; // Get the number of CPU cores

  const limit = pLimit(Math.min(4, cpuCount)); // Max 3 concurrent tabs

  const tasks = patientsArray.map((patient) =>
    limit(async () => {
      const page = await browser.newPage();
      const html = generateAcceptanceLetterHtml(patient); // Assume you already have this
      await page.setContent(html, { waitUntil: "networkidle0" });

      await page.bringToFront();

      const buffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: undefined,
        waitForFonts: true,
      });

      await page.close();
      result[patient.referId] = buffer.toString("base64");
    })
  );

  await Promise.all(tasks);
  return result;
};

export default generateAcceptancePdfLetters;
