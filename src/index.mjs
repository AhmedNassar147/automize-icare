/*
 *
 * Index
 *
 */
import { writeFile, mkdir } from "fs/promises";
import puppeteer from "puppeteer";
import waitForWaitingCountWithInterval from "./waitForWaitingCountWithInterval.mjs";
import getDateBasedTimezone from "./getDateBasedTimezone.mjs";
import extractWaitingReferalTableData from "./extractWaitingReferalTableData.mjs";
import openPatientsDetailsPageAndDownloadDocuments from "./openPatientsDetailsPageAndDownloadDocuments.mjs";

// 1- which value from table record inserted in the pdf
// 2- take iamge of the capture of the pdf
// 3- take html of the modal to close

(async () => {
  const currentWorkingDirectory = process.cwd();

  const browser = await puppeteer.launch({ headless: false }); // Set true for no UI
  const page = await browser.newPage();

  // 1. Go to login page
  await page.goto("https://purchasingprogramsaudi.com/index.cfm", {
    waitUntil: "networkidle2",
  });

  // Step 1: Wait for user to log in manually
  console.log("🕒 Waiting for user to log in...");

  // Step 2: Wait until a selector only present after login appears
  const homePageSelector = await page.waitForSelector(
    "#icare_global_header_menu",
    {
      timeout: 9 * 60 * 1000, // wait max 9 minutes
    }
  );

  if (!homePageSelector) {
    console.log("✅ User did not log in!");
    return;
  }

  console.log("✅ Logged in successfully!");

  // New step: Check if the span has value > 0
  // New step: Re-Check every 1 seconds if value < 1
  const count = await waitForWaitingCountWithInterval(page, 400);

  await page.waitForSelector("#tblOutNotificationsTable tbody", {
    timeout: 5 * 60 * 1000, // wait max 5 minutes,
  });

  const foundDataInWatingTable = await extractWaitingReferalTableData(page);

  const { dateString, time } = getDateBasedTimezone();

  const currentResultFolderDirectory = `${currentWorkingDirectory}/results/${dateString}`;
  const currentpatientsFolderDirectory = `${currentResultFolderDirectory}/waiting-patients`;

  await mkdir(currentpatientsFolderDirectory, {
    recursive: true,
  });

  const currentDateTime = time.replace(/:/g, ".");

  const patientsDataFile = `${currentpatientsFolderDirectory}/${currentDateTime}.json`;

  await writeFile(
    patientsDataFile,
    JSON.stringify(
      {
        count,
        foundDataInWatingTable,
      },
      null,
      2
    )
  );

  // Get all "View" link elements
  const viewLinks = await page.$$(
    "#tblOutNotificationsTable tbody tr td a.input_btn"
  );

  const patientsLength = foundDataInWatingTable.length;
  const viewLinksLength = viewLinks.length;

  console.log(
    `✅ WaitngCount=${count}, PatientsCount=${patientsLength} and ViewButtonsCount=${viewLinksLength}`
  );

  const [firstViewLink] = viewLinks;

  console.log("firstViewLink", firstViewLink);

  return;

  const { succeeded, failed } =
    await openPatientsDetailsPageAndDownloadDocuments({
      browser,
      page,
      viewLinks: [firstViewLink],
    });

  // when clicking the accept input button
  //  page.click('#accept')

  // Modify all view links to open in a new tab
  // const viewUrls = await page.evaluate(() => {
  //   const links = Array.from(document.querySelectorAll('#tblOutNotificationsTable tbody a.input_btn'));
  //   links.forEach(link => link.setAttribute('target', '_blank'));
  //   return links.map(link => {
  //     const onclick = link.getAttribute('onclick');
  //     const match = onclick && onclick.match(/navigate\(['"]([^'"]+)/);
  //     return match ? 'https://purchasingprogramsaudi.com' + match[1] : null;
  //   }).filter(Boolean);
  // });

  // console.log(`🔗 Found ${viewUrls.length} URLs to open.`);

  // for (const [index, url] of viewUrls.entries()) {
  //   const newTab = await browser.newPage();
  //   console.log(`🧭 Opening tab ${index + 1}: ${url}`);
  //   await newTab.goto(url, { waitUntil: 'domcontentloaded' });

  //   // Optional: Extract something from the new tab
  //   const pageTitle = await newTab.title();
  //   console.log(`📄 Tab ${index + 1} title: ${pageTitle}`);

  //   // Optionally close the tab after processing
  //   await newTab.close();
  // }

  // 5. Screenshot for verification
  // await page.screenshot({
  //   path: "../screenshot/after-login.png",
  //   fullPage: true,
  //   optimizeForSpeed: true,
  //   omitBackground: true,
  // });
})();
