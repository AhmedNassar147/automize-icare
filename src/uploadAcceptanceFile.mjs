/*
 *
 * Helper: `uploadAcceptanceFile`.
 *
 */
const uploadAcceptanceFile = async (page, filePath) => {
  // Fill in the Title field
  await page.type("#Title", "Acceptance");

  // Upload the file
  const fileInput = await page.$("#file1");
  // const pdfPath = path.resolve(__dirname, "sample.pdf"); // Change this to your PDF file path
  await fileInput.uploadFile(filePath);

  // Select a file type (e.g., Acceptance — value="11")
  await page.select("#Type1", "11");

  // Submit the form
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }).catch(() => {}), // Wait for the form submission to complete
    page.click("#submit"),
  ]);

  console.log("Form submitted.");
};

export default uploadAcceptanceFile;
