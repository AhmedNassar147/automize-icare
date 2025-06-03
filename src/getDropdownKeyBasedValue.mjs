/*
 *
 * Helper: `getDropdownKeyBasedValue`.
 *
 */
const getDropdownKeyBasedValue = async (page, selectorName, desiredText) => {
  const value = await page.$eval(
    selectorName,
    (select, desiredText) => {
      const options = Array.from(select.options);

      if (!options || !options.length) {
        return "";
      }

      const found = options.find(
        (option) => option.text.trim() === desiredText
      );

      return found ? found.value : "";
    },
    desiredText
  );

  if (!value) {
    console.log(
      `❌ Option with text "${desiredText}" not found in ${selectorName}`
    );
  }

  return value;
};

export default getDropdownKeyBasedValue;
