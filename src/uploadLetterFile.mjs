/*
 *
 * Helper: `uploadLetterFile`.
 *
 */
import getDropdownKeyBasedValue from "./getDropdownKeyBasedValue.mjs";
import sleep from "./sleep.mjs";

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

  await sleep(40);

  await popupPage.click("#submit");
  await sleep(20);
};

export default uploadLetterFile;
