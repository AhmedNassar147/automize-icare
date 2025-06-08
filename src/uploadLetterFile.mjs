/*
 *
 * Helper: `uploadLetterFile`.
 *
 */
import getDropdownKeyBasedValue from "./getDropdownKeyBasedValue.mjs";

const uploadLetterFile = async ({
  popupPage,
  letterFile,
  isAcceptingPatient,
}) => {
  const desiredText = isAcceptingPatient ? "Acceptance" : "Other";

  const key = await getDropdownKeyBasedValue(popupPage, "#Type1", desiredText);

  const keyToBeSelected = isAcceptingPatient ? key || "11" : key || "2";

  // 3. Fill form fields in popup
  await popupPage.type("#Title", desiredText);
  await popupPage.select("#Type1", keyToBeSelected);

  const inputUploadHandle = await popupPage.$("input[type=file]#file1");

  await inputUploadHandle.uploadFile(letterFile);

  const [popupNewHtml] = await Promise.all([
    popupPage.waitForResponse(
      (res) =>
        res.url().toLowerCase().includes("common/attach.cfm") &&
        res.request().method() === "POST" &&
        res.status() >= 200 &&
        res.status() < 300
    ),
    popupPage.click("#submit"),
  ]);

  if (popupNewHtml) {
    const fileType = isAcceptingPatient ? "Acceptance" : "Rejection";

    console.log(`✅ ${fileType} Letter File Uploaded.`);
  }
};

export default uploadLetterFile;
