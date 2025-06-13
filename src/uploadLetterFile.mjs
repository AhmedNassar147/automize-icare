/*
 *
 * Helper: `uploadLetterFile`.
 *
 */
import { writeFile } from "fs/promises";
import path from "path";
import getRandomId from "./getRandomId.mjs";
import getDropdownKeyBasedValue from "./getDropdownKeyBasedValue.mjs";
import { htmlFilesPath } from "./constants.mjs";

const uploadLetterFile = async ({
  popupPage,
  letterFile,
  isAcceptingPatient,
  referralId,
}) => {
  const desiredText = isAcceptingPatient ? "Acceptance" : "Other";
  const key = await getDropdownKeyBasedValue(popupPage, "#Type1", desiredText);
  const keyToBeSelected = isAcceptingPatient ? key || "11" : key || "2";

  const title = isAcceptingPatient ? "Acceptance" : "Rejection";

  await popupPage.type("#Title", title);
  await popupPage.select("#Type1", keyToBeSelected);

  const inputUploadHandle = await popupPage.$("input[type=file]#file1");

  if (!inputUploadHandle) {
    console.error(
      `❌ Upload input field not found in popup for referralId=${referralId}.`
    );
    return false;
  }

  console.log(`letterFilePath for referralId=${referralId}`, letterFile);
  await inputUploadHandle.uploadFile(letterFile);

  await popupPage.waitForFunction(
    () => {
      const element = document.querySelector("input[type=file]#file1");

      if (element && element.files && element.files.length > 0) {
        return true;
      }

      return false;
    },
    { timeout: 2000 }
  );

  const popupResponsePromise = popupPage.waitForResponse(
    (res) =>
      res.url().toLowerCase().includes("common/attach.cfm") &&
      res.request().method() === "POST" &&
      res.status() >= 200 &&
      res.status() < 300,
    { timeout: 70000 }
  );

  await popupPage.click("#submit");

  const popupNewHtmlResult = await popupResponsePromise;

  let isDone = false;

  if (popupNewHtmlResult) {
    const pageHtml = (await popupNewHtmlResult.text()) || "";
    isDone = pageHtml.includes(title);

    const popupWindowDocuemntPath = path.join(
      htmlFilesPath,
      `${title}_popup_${referralId}_${getRandomId()}.html`
    );

    await writeFile(popupWindowDocuemntPath, pageHtml);
  }

  console.log(
    `${isDone ? "✅" : "❌"} ${title} Letter File ${
      isDone ? "" : "NOT"
    } Uploaded for referralId=${referralId}.`
  );

  return isDone;
};

export default uploadLetterFile;
