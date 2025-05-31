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
    const keys = headers.map((th) => toCamelCase(th.textContent.trim()));

    const rows = Array.from(table.querySelectorAll("tbody tr"));

    return rows.map((row) => {
      const obj = {};
      const cells = Array.from(row.querySelectorAll("td")).slice(0, -1);
      cells.forEach((cell, idx) => {
        obj[keys[idx]] = (cell.textContent || "").trim();
      });

      const actionLink = row.querySelector("a.input_btn");

      if (actionLink) {
        const onclickAttr = actionLink.getAttribute("onclick") || "";
        const start = onclickAttr.indexOf("ColdFusion.navigate('");
        if (start !== -1) {
          const urlStart = start + "ColdFusion.navigate('".length;
          const urlEnd = onclickAttr.indexOf("'", urlStart);
          obj.actionLinkRef =
            urlEnd !== -1 ? onclickAttr.substring(urlStart, urlEnd) : null;
        }
      }

      return obj;
    });
  });
};

export default extractWaitingReferalTableData;

// [
//   {
// referralId: "124321",
// ihalatiReferralId: "2030269",
// requestedDate: "2022-01-02 23:09:00.0",
// adherentId: "33101631",
// adherentName: "Mohamed X Al shahrany",
// nationalId: "1036226577",
// referralType: "Long Term Care",
// requiredSpecialty: "Extended Care",
// sourceZone: "Asir",
// providerSourceName: "Asir Central Hospital",
// actionLinkRef: "../MOHCC/MOHReferral.cfm?referral_id=61F21A8DABC043B7234E4EFA744F84F7&npcod=H509821&categ=HP&accept=1&admit=1";
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
//     actionLinkRef: "../MOHCC/MOHReferral.cfm?referral_id=61F21A8DABC043B7234E4EFA744F84F7&npcod=H509821&categ=HP&accept=1&admit=1";
//   },
//   // ... more rows ...
// ]

// const extractWaitingReferalTableData = async (page) => {
//   return await page.evaluate(() => {
//     const toCamelCase = (str) =>
//       str
//         .toLowerCase()
//         .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
//         .replace(/\s+/g, "");

//     const table = document.querySelector("#tblOutNotificationsTable");

//     if (!table) {
//       return [];
//     }

//     const headers = Array.from(table.querySelectorAll("thead th")).slice(0, -1);

//     const keys = headers.map((th) =>
//       toCamelCase((th.textContent || "").trim())
//     );

//     const rows = Array.from(table.querySelectorAll("tbody tr"));

//     const data = rows.map((row) => {
//       const cells = Array.from(row.querySelectorAll("td")).slice(0, -1);
//       const obj = {};
//       cells.forEach((cell, idx) => {
//         obj[keys[idx]] = (cell.textContent || "").trim();
//       });
//       return obj;
//     });

//     return data;
//   });
// };
