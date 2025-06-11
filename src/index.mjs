/*
 *
 * Index
 *
 */
import dotenv from "dotenv";
dotenv.config();

import puppeteer from "puppeteer";
import makeUserLoggedInOrOpenHomePage from "./makeUserLoggedInOrOpenHomePage.mjs";
import PatientStore from "./PatientStore.mjs";
import waitForWaitingCountWithInterval from "./waitForWaitingCountWithInterval.mjs";
import generateFolderIfNotExisting from "./generateFolderIfNotExisting.mjs";
import readJsonFile from "./readJsonFile.mjs";
import sendMessageUsingWhatsapp, {
  shutdownAllClients,
} from "./sendMessageUsingWhatsapp.mjs";
import processSendCollectedPatientsToWhatsapp from "./process/processSendCollectedPatientsToWhatsapp.mjs";
import processPatientAcceptanceOrRejection from "./process/processPatientAcceptanceOrRejection.mjs";
import {
  waitingPatientsFolderDirectory,
  generatedPdfsPath,
  COLLECTD_PATIENTS_FULL_FILE_PATH,
  USER_ACTION_TYPES,
  receivedRejectedCaptchasPath,
  receivedResolvedCaptchasPath,
} from "./constants.mjs";

const collectConfimrdPatient = true;

(async () => {
  try {
    await Promise.all([
      generateFolderIfNotExisting(waitingPatientsFolderDirectory),
      generateFolderIfNotExisting(generatedPdfsPath),
      generateFolderIfNotExisting(receivedResolvedCaptchasPath),
      generateFolderIfNotExisting(receivedRejectedCaptchasPath),
    ]);

    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null, // Allow full window resizing
      args: ["--start-maximized"], // Maximize window on launch
    });

    const collectedPatients = await readJsonFile(
      COLLECTD_PATIENTS_FULL_FILE_PATH,
      true
    );

    const patientsStore = new PatientStore(collectedPatients || []);
    await patientsStore.scheduleAllInitialPatients();

    (async () =>
      await waitForWaitingCountWithInterval({
        collectConfimrdPatient,
        browser,
        patientsStore,
      }))();

    const sendWhatsappMessage = sendMessageUsingWhatsapp(patientsStore);

    patientsStore.on(
      "patientsAdded",
      processSendCollectedPatientsToWhatsapp(sendWhatsappMessage)
    );

    patientsStore.on("patientAccepted", async (patient) =>
      processPatientAcceptanceOrRejection({
        browser,
        actionType: USER_ACTION_TYPES.ACCEPT,
        patient,
        patientsStore,
        sendWhatsappMessage,
      })
    );

    patientsStore.on("patientRejected", async (patient) =>
      processPatientAcceptanceOrRejection({
        browser,
        actionType: USER_ACTION_TYPES.REJECT,
        patient,
        patientsStore,
        sendWhatsappMessage,
      })
    );
  } catch (error) {
    console.error("❌ An error occurred:", error.message);
    console.error("Stack trace:", error.stack);
    await shutdownAllClients();
  }
})();

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

// post to query table data
// https://purchasingprogramsaudi.com/cfc/get_notif_moh.cfm

{
  /* <div id="dvError" style="color:#006 !important;font-weight:bold;font-size:14px;">You still have to wait for 12 minutes to be able to take any action.Kindly refresh the page.</div> */
}
// timer
// //<div id="submit_div" style="float:left;padding-top: 30px;margin-left:300px;">

//      <div id="dvError" style="color:#006 !important;font-weight:bold;font-size:14px;">You still have to wait for 13 minutes to be able to take any action.Kindly refresh the page.</div>

// </div>

// https://purchasingprogramsaudi.com/CFFileServlet/_cf_captcha/_captcha_img-6657639295369885109.png

// https://purchasingprogramsaudi.com/OpenAttach.cfm?fileName=MH2-H50982_9518690_3_0.560148522034.pdf&Ext=pdf

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

// https://purchasingprogramsaudi.com/common/captcha_reject.cfm
// paylaod: captchaText=iqnsjsm5&referral_id=294841&RejReason=3783&submit=Validate&_cf_containerId=WorkArea&_cf_nodebug=true&_cf_nocache=true&_cf_clientid=7C5FED3316991F638B281A3AAFFFCF2B
{
  /*

	<link rel="stylesheet" href="https://purchasingprogramsaudi.com:443/css/mm_health_nutr.css" type="text/css" />

      <script>
		JQueryAlert("You did not enter the right text.You cannot proceed!");
	</script>






<div id="captcha_div" style="float:left;text-align:left;">

		<form name="CAPTCHAfrm" id="CAPTCHAfrm" action="../common/captcha_reject.cfm" method="post" onsubmit="return ColdFusion.Ajax.checkForm(this, _CF_checkCAPTCHAfrm,'WorkArea')">




		    <div style="float:left;width:100%;margin:5px;">

				<img src="/CFFileServlet/_cf_captcha/_captcha_img-7838586407990719196.png" alt="" height="80" width="250" />


            </div>

			<div style="float:left;width:100%;margin:5px;">

            <span style="font-weight:bold;color:#808285;width:170px;font-size:12px;text-align:left;">
				Enter Text :
			</span>
			<span>
			<input
				type="text"
				name="captchaText"
				id="captchaText"
				value="" style="width:180px;"
				/> </span>
                <input type="hidden" id="referral_id" name="referral_id" value="294841" />
                <input type="hidden" id="RejReason" name="RejReason" value="3783" />
               	<input name="submit" id="submit"  type="submit" value="Validate" />
            </div>



    </div>
	</form> */
}
// after captch submit modal You did not enter the right text.You cannot proceed!

// if success it requests
// https://purchasingprogramsaudi.com/Assistance/MohDashboard.cfm?_cf_containerId=WorkArea&_cf_nodebug=true&_cf_nocache=true&_cf_clientid=7C5FED3316991F638B281A3AAFFFCF2B&_cf_rc=2
