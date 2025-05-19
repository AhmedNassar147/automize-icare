/*
 *
 * Helper: `extractWaitingReferalTableData`.
 *
 */
const extractWaitingReferalTableData = async (page) => {
  return await page.evaluate(() => {
    const toCamelCase = (str) =>
      str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
        .replace(/\s+/g, "");

    const table = document.querySelector("#tblOutNotificationsTable");

    if (!table) {
      return [];
    }

    const headers = Array.from(table.querySelectorAll("thead th")).slice(0, -1);

    const keys = headers.map((th) =>
      toCamelCase((th.textContent || "").trim())
    );

    const rows = Array.from(table.querySelectorAll("tbody tr"));

    const data = rows.map((row) => {
      const cells = Array.from(row.querySelectorAll("td")).slice(0, -1);
      const obj = {};
      cells.forEach((cell, idx) => {
        obj[keys[idx]] = (cell.textContent || "").trim();
      });
      return obj;
    });

    return data;
  });
};

export default extractWaitingReferalTableData;

// [
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
//     providerSourceName: "Asir Central Hospital"
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
//     providerSourceName: "King Abdullah Hospital"
//   },
//   // ... more rows ...
// ]
