/*
 *
 * Index
 *
 */
// import fs from "fs";
import puppeteer from "puppeteer";
import waitForWaitingCountWithInterval from "./waitForWaitingCountWithInterval.mjs";
import extractWaitingReferalTableData from "./extractWaitingReferalTableData.mjs";
import openPatientsDetailsPageAndDownloadDocuments from "./openPatientsDetailsPageAndDownloadDocuments.mjs";
import writePatientData from "./writePatientData.mjs";
// import generateAcceptancePdfLetters from "./generatePdfs.mjs";
import generateFolderIfNotExisting from "./generateFolderIfNotExisting.mjs";
// import generate_pdf from "./generate_pdf.mjs";
import {
  waitingPatientsFolderDirectory,
  patientsGeneratedPdfsFolderDirectory,
} from "./constants.mjs";

// install gs from https://ghostscript.com/releases/gsdnld.html

// 2- take iamge of the capture of the pdf
// 4- suppose cancel request
// ----------------------------------------

(async () => {
  try {
    // await generate_pdf()
    //   .then((pdfBytes) => {
    //     fs.writeFileSync(`${process.cwd()}/results/referral.pdf`, pdfBytes);
    //     console.log("PDF generated successfully!");
    //   })
    //   .catch((error) => console.log(error));
    // return;

    await generateFolderIfNotExisting(waitingPatientsFolderDirectory);
    await generateFolderIfNotExisting(patientsGeneratedPdfsFolderDirectory);

    const browser = await puppeteer.launch({ headless: false }); // Set true for no UI
    const page = await browser.newPage();

    // await generateAcceptancePdfLetters(browser, [
    //   {
    //     referralId: "124321",
    //     ihalatiReferralId: "2030269",
    //     requestedDate: "2022-01-02 23:09:00.0",
    //     adherentId: "33101631",
    //     adherentName: "Mohamed X Al shahrany",
    //     nationalId: "1036226577",
    //     referralType: "Long Term Care",
    //     requiredSpecialty: "Extended Care",
    //     sourceZone: "Asir",
    //     providerSourceName: "Asir Central Hospital",
    //   },
    //   {
    //     referralId: "127449",
    //     ihalatiReferralId: "2100526",
    //     requestedDate: "2022-02-19 07:44:00.0",
    //     adherentId: "33267273",
    //     adherentName: "Nawy X al shehry",
    //     nationalId: "1040073593",
    //     referralType: "Long Term Care",
    //     requiredSpecialty: "Extended Care",
    //     sourceZone: "Bisha",
    //     providerSourceName: "King Abdullah Hospital",
    //   },
    // ]);

    // return;

    // 1. Go to login page
    await page.goto("https://purchasingprogramsaudi.com/Index.cfm", {
      waitUntil: "networkidle2",
    });

    // Step 1: Wait for user to log in manually
    console.log("🕒 Waiting for user to log in...");

    // Step 2: Wait until a selector only present after login appears
    const homePageSelector = await page.waitForSelector(
      "#icare_global_header_menu",
      {
        timeout: 9 * 60 * 1000, // wait max 9 minutes
      }
    );

    if (!homePageSelector) {
      console.log("✅ User did not log in!");
      return;
    }

    console.log("✅ User Logged in successfully!");

    // New step: Check if the span has value > 0
    // New step: Re-Check every 200 ms if value < 1
    const count = await waitForWaitingCountWithInterval(page, 200);

    // await page.waitForSelector("#tblOutNotificationsTable tbody", {
    //   timeout: 3 * 60 * 1000, // wait max 3 minutes,
    // });

    const patientsData = await extractWaitingReferalTableData(page);

    await writePatientData({
      count,
      patientsData,
    });

    const patientsWithFiles = await openPatientsDetailsPageAndDownloadDocuments(
      {
        browser,
        page,
        patientsData,
      }
    );

    await writePatientData({
      patientsData: patientsWithFiles,
    });

    // when clicking the accept input button
    //  page.click('#accept')
  } catch (error) {
    console.error("❌ An error occurred:", error.message);
    console.error("Stack trace:", error.stack);
  }
})();

// timer
// //<div id="submit_div" style="float:left;padding-top: 30px;margin-left:300px;">

//      <div id="dvError" style="color:#006 !important;font-weight:bold;font-size:14px;">You still have to wait for 13 minutes to be able to take any action.Kindly refresh the page.</div>

// </div>

// https://purchasingprogramsaudi.com/OpenAttach.cfm?fileName=MH2-H50982_9518690_3_0.560148522034.pdf&Ext=pdf
