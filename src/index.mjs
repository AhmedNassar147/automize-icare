/*
 *
 * Index
 *
 */
// import fs from "fs";
import puppeteer from "puppeteer";
import PatientStore from "./PatientStore.mjs";
import waitForWaitingCountWithInterval from "./waitForWaitingCountWithInterval.mjs";
import generateFolderIfNotExisting from "./generateFolderIfNotExisting.mjs";
import readJsonFile from "./readJsonFile.mjs";
import sendMessageUsingWhatsapp from "./sendMessageUsingWhatsapp.mjs";
// import generateAcceptancePdfLetters from "./generatePdfs.mjs";
// import generate_pdf from "./generate_pdf.mjs";
import {
  waitingPatientsFolderDirectory,
  patientsGeneratedPdfsFolderDirectory,
  configFilePath,
} from "./constants.mjs";
import findWaitingPatientsAndGetTheirDetails from "./findWaitingPatientsAndGetTheirDetails.mjs";

// install gs from https://ghostscript.com/releases/gsdnld.html

// 2- take iamge of the capture of the pdf
// 4- suppose cancel request
// ----------------------------------------

const collectConfimrdPatient = true;

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
    const { userName, password } = await readJsonFile(configFilePath, true);

    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null, // Allow full window resizing
      args: ["--start-maximized"], // Maximize window on launch
    });

    const page = await browser.newPage();

    // 1. Go to login page
    await page.goto("https://purchasingprogramsaudi.com/Index.cfm", {
      waitUntil: "networkidle2",
    });

    await page.type("#j_username", userName);
    await page.type("#j_password", password);

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

    console.log("✅ initializing PatientStore!");
    const patientsStore = new PatientStore();

    (async () =>
      await waitForWaitingCountWithInterval({
        page,
        collectConfimrdPatient,
        patientsStore,
      }))();

    patientsStore.on("startCollectingPatients", async () => {
      console.log("startCollectingPatients starts");
      const newPage = await browser.newPage();

      try {
        // 1. Go to login page
        await newPage.goto("https://purchasingprogramsaudi.com/Index.cfm", {
          waitUntil: "networkidle2",
        });

        const result = await findWaitingPatientsAndGetTheirDetails({
          browser,
          page: newPage,
          collectConfimrdPatient,
        });

        patientsStore.addPatients(result);
      } catch (err) {
        // patientsStore.emit("collectionError", err);
        console.log("Error:", err);
      } finally {
        await newPage.close();
        patientsStore.finishCollecting(); // allow next collection
      }
    });

    patientsStore.on("patientAdded", async (addedPatients) => {
      console.log("addedPatients", addedPatients);

      // Format the message
      const formatPatient = (p, i) =>
        `🧾 Patient #${i + 1}:\n` +
        `• Name: ${p.adherentName}\n` +
        `• Nationalty: ${p.nationality}\n` +
        `• National ID: ${p.nationalId}\n` +
        `• Referral Type: ${p.referralType}\n` +
        `• Specialty: ${p.requiredSpecialty}\n` +
        `• Hospital: ${p.providerSourceName}\n` +
        `• Zone: ${p.sourceZone}\n` +
        `• Requested: ${p.requestedDate}\n` +
        `• Referral ID: ${p.referralId}\n` +
        `• Action: ${p.actionLinkRef}\n`;

      const fullMessage = addedPatients
        .map(formatPatient)
        .join("\n-------------------\n");

      await sendMessageUsingWhatsapp(fullMessage);
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
