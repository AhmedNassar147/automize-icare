/*
 *
 * Index
 *
 */
import puppeteer from "puppeteer";
import waitForWaitingCountWithInterval from "./waitForWaitingCountWithInterval.mjs";
import extractWaitingReferalTableData from "./extractWaitingReferalTableData.mjs";

(async () => {
  const browser = await puppeteer.launch({ headless: false }); // Set true for no UI
  const page = await browser.newPage();

  // 1. Go to login page
  await page.goto("https://purchasingprogramsaudi.com/index.cfm", {
    waitUntil: "domcontentloaded",
  });

  // Step 1: Wait for user to log in manually
  console.log("🕒 Waiting for user to log in...");

  // Step 2: Wait until a selector only present after login appears
  const homePageSelector = await page.waitForSelector(
    "#icare_global_header_menu",
    {
      timeout: 8 * 60 * 1000, // wait max 8 minutes
    }
  );

  if (!homePageSelector) {
    console.log("✅ User did not log in!");
  }

  console.log("✅ Logged in successfully!");

  // New step: Check if the span has value > 0
  // New step: Re-Check every 1 seconds if value < 1
  await waitForWaitingCountWithInterval(page, 1000);

  const foundDataInWatingTable = await extractWaitingReferalTableData(page);

  // 5. Screenshot for verification
  // await page.screenshot({
  //   path: "../screenshot/after-login.png",
  //   fullPage: true,
  //   optimizeForSpeed: true,
  //   omitBackground: true,
  // });
})();
