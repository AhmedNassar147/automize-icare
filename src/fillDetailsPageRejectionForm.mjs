/*
 *
 * Helper: `fillDetailsPageRejectionForm`.
 *
 */
import getDropdownKeyBasedValue from "./getDropdownKeyBasedValue.mjs";

const desiredText = "Specialist Dr Unavailable";

const fillDetailsPageRejectionForm = async (page) => {
  // 2. get dynamic key based value
  const key = await getDropdownKeyBasedValue(page, "#RejReason", desiredText);

  // 2. set default key if not found
  const keyToBeSelected = key || "3783"; // "Specialist Dr Unavailable"

  // 2. Fill form fields in details page
  await page.select("#RejReason", keyToBeSelected);
  // await popupPage.type("#remarksDV", desiredText);
};

export default fillDetailsPageRejectionForm;
