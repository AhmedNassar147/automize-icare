/*
 *
 * Helper: `generateAcceptancePdfLetters`.
 *
 */
import os from "os";
import pLimit from "p-limit";
import generateAcceptanceLetterHtml from "./generateAcceptanceLetterHtml.mjs";
import { patientsGeneratedPdfsFolderDirectory } from "./constants.mjs";

const generateAcceptancePdfLetters = async (browser, patientsArray) => {
  const cpuCount = os.cpus().length; // Get the number of CPU cores

  const limit = pLimit(Math.min(4, cpuCount)); // Max 3 concurrent tabs

  const tasks = patientsArray.map((patient) =>
    limit(async () => {
      const page = await browser.newPage();
      const html = generateAcceptanceLetterHtml(patient); // Assume you already have this
      await page.setContent(html, { waitUntil: "domcontentloaded" });

      await page.bringToFront();

      const { referralId } = patient;

      await page.pdf({
        path: `${patientsGeneratedPdfsFolderDirectory}/${referralId}.pdf`,
        format: "A4",
        // Avoid printBackground: true unless absolutely necessary — it increases size significantly
        printBackground: false,
        margin: {
          top: "10mm",
          bottom: "10mm",
          left: "10mm",
          right: "10mm",
        },
        scale: 1,
      });

      await page.close();
    })
  );

  await Promise.all(tasks);
};

export default generateAcceptancePdfLetters;
