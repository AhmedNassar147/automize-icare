/**
 *
 * Helper: `getSelectedNationalityFromDropdwon`.
 *
 */
const defaultValue = {
  value: "",
  text: "SAUDI",
};

const getSelectedNationalityFromDropdwon = async (page) => {
  try {
    // Wait for the dropdown to be available
    const element = await page.waitForSelector("#txtNaty");

    if (!element) {
      return defaultValue;
    }

    // Extract selected value and text
    return await page.$eval("#txtNaty", (select) => {
      if (select) {
        const { options, selectedIndex } = select;
        const { value, textContent } = (options || [])[selectedIndex] || {};
        const textValue = (textContent || "").trim();

        return {
          value,
          text: textValue === "Select" ? "SAUDI" : textValue,
        };
      }

      return defaultValue;
    });
  } catch (error) {
    // If dropdown not found or any error occurs
    return defaultValue;
  }
};

export default getSelectedNationalityFromDropdwon;
