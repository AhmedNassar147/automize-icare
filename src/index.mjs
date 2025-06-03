/*
 *
 * Index
 *
 */
import puppeteer from "puppeteer";
import makeUserLoggedInOrOpenHomePage from "./makeUserLoggedInOrOpenHomePage.mjs";
import PatientStore from "./PatientStore.mjs";
import waitForWaitingCountWithInterval from "./waitForWaitingCountWithInterval.mjs";
import generateFolderIfNotExisting from "./generateFolderIfNotExisting.mjs";
import readJsonFile from "./readJsonFile.mjs";
import sendMessageUsingWhatsapp, {
  shutdownAllClients,
} from "./sendMessageUsingWhatsapp.mjs";
import processCollectingPatients from "./process/processCollectingPatients.mjs";
import processSendCollectedPatientsToWhatsapp from "./process/processSendCollectedPatientsToWhatsapp.mjs";
import processPatientAcceptanceOrRejection from "./process/processPatientAcceptanceOrRejection.mjs";
import {
  waitingPatientsFolderDirectory,
  generatedPdfsPath,
  configFilePath,
  COLLECTD_PATIENTS_FULL_FILE_PATH,
  USER_ACTION_TYPES,
} from "./constants.mjs";

// install gs from https://ghostscript.com/releases/gsdnld.html

// 2- take iamge of the capture of the pdf
// 4- suppose cancel request
// ----------------------------------------

// python
// https://www.python.org/downloads/
// py --version
// py -m pip --version

// install
// py -m pip install paddlepaddle -f https://www.paddlepaddle.org.cn/whl/windows/mkl/avx/stable.html
// py -m pip install paddleocr

// inside captcha_recognize
// python -m venv venv
// Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
// PS D:\work\future\clone-icare\icare-automize\captcha_recognize> venv\Scripts\Activate.ps1
// pip install pillow numpy tensorflow

const collectConfimrdPatient = true;

(async () => {
  try {
    await generateFolderIfNotExisting(waitingPatientsFolderDirectory);
    await generateFolderIfNotExisting(generatedPdfsPath);

    // 966569157706
    const { whatsappNumber, password, userName } = await readJsonFile(
      configFilePath,
      true
    );

    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null, // Allow full window resizing
      args: ["--start-maximized"], // Maximize window on launch
    });

    const [page, isLoggedIn] = await makeUserLoggedInOrOpenHomePage({
      browser,
      password,
      userName,
    });

    if (!isLoggedIn) {
      await browser.close();
      console.error("🛑 Failed to login to icare app. Exiting...");
      return process.exit(1);
    }

    const collectedPatients = await readJsonFile(
      COLLECTD_PATIENTS_FULL_FILE_PATH,
      true
    );

    const patientsStore = new PatientStore(collectedPatients || []);

    (async () =>
      await waitForWaitingCountWithInterval({
        page,
        collectConfimrdPatient,
        patientsStore,
      }))();

    const sendWhatsappMessage = sendMessageUsingWhatsapp(patientsStore);

    patientsStore.on(
      "collectPatients",
      async () =>
        await processCollectingPatients({
          browser,
          collectConfimrdPatient,
          password,
          patientsStore,
          userName,
        })
    );

    patientsStore.on(
      "patientsAdded",
      processSendCollectedPatientsToWhatsapp(
        sendWhatsappMessage,
        whatsappNumber
      )
    );

    patientsStore.on("patientAccepted", async (patient) =>
      processPatientAcceptanceOrRejection({
        browser,
        password,
        userName,
        actionType: USER_ACTION_TYPES.ACCEPT,
        patient,
        patientsStore,
        sendWhatsappMessage,
        whatsappNumber,
      })
    );

    patientsStore.on("patientRejected", async (patient) =>
      processPatientAcceptanceOrRejection({
        browser,
        password,
        userName,
        actionType: USER_ACTION_TYPES.REJECT,
        patient,
        patientsStore,
        sendWhatsappMessage,
        whatsappNumber,
      })
    );
  } catch (error) {
    console.error("❌ An error occurred:", error.message);
    console.error("Stack trace:", error.stack);
    await shutdownAllClients();
  }
})();

// post to query table data
// https://purchasingprogramsaudi.com/cfc/get_notif_moh.cfm

{
  /* <div id="dvError" style="color:#006 !important;font-weight:bold;font-size:14px;">You still have to wait for 12 minutes to be able to take any action.Kindly refresh the page.</div> */
}
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

// const patientsArray = [
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
//     nationality: "SAUDI",
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
//     nationality: "SAUDI",
//   },
//   {
//     referralId: "133167",
//     ihalatiReferralId: "30067212",
//     requestedDate: "2022-06-12 14:38:00.0",
//     adherentId: "34082324",
//     adherentName: "Sultan X Alqahtani",
//     nationalId: "1119714010",
//     referralType: "Emergency",
//     requiredSpecialty: "Neuro Surgery",
//     sourceZone: "Asir",
//     providerSourceName: "Asir Central Hospital",
//     nationality: "SAUDI",
//   },
// ];
