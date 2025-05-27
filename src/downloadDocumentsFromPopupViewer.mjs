/*
 *
 * Helper: `downloadDocumentsFromPopupViewer`.
 *
 */
import { URL } from "node:url";
import openPopupDocumentsViewer from "./openPopupDocumentsViewer.mjs";
import downloadAsBase64 from "./downloadAsBase64.mjs";

const downloadDocumentsFromPopupViewer = async (browser, page) => {
  const [popupPage, baseUrl] = await openPopupDocumentsViewer(browser, page);

  // Extract relative hrefs of PDF links
  const relativeLinks = await popupPage.$$eval(
    'a[href*="OpenAttach.cfm"]',
    (anchors) =>
      anchors
        .filter((a) => a.textContent.includes("pdf"))
        .map((a) => a.getAttribute("href").replace(/&amp;/g, "&"))
  );

  const links = relativeLinks.map((rel) => new URL(rel, baseUrl).href);

  console.log("Found PDF links:", links);

  // Get cookies for authenticated requests
  const cookies = await popupPage.cookies();
  const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

  // Limit concurrency to avoid hammering server
  const concurrency = 3;
  const results = [];

  for (let i = 0; i < links.length; i += concurrency) {
    const chunk = links.slice(i, i + concurrency);
    const chunkResults = await Promise.all(chunk.map(downloadAsBase64));
    results.push(...chunkResults);
  }

  console.log("✅ All files downloaded as base64");
};

export default downloadDocumentsFromPopupViewer;
