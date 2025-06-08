/*
 *
 * Helper: `logPageRequests`.
 *
 */
import { writeFile } from "fs/promises";
import getDateBasedTimezone from "./getDateBasedTimezone.mjs";

const allRequests = {
  // Structure: pageName: { requests: [], cookies: [] }
};

// Store request data and cookies per page
const requestMap = new Map();

export const logPageRequests = (pageName, page) => {
  // Initialize if not exist
  if (!allRequests[pageName]) {
    allRequests[pageName] = { requests: [], cookies: [] };
  }

  page.on("request", (request) => {
    const data = {
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      postData: request.postData() || null,
      response: null,
    };
    requestMap.set(request._requestId, data);
    allRequests[pageName].requests.push(data);
  });

  page.on("response", async (response) => {
    try {
      const request = response.request();
      const requestId = request._requestId;
      if (!requestMap.has(requestId)) return;

      const reqData = requestMap.get(requestId);

      const status = response.status();
      const headers = response.headers();

      let body = null;
      const contentType = headers["content-type"] || "";
      if (
        contentType.includes("application/json") ||
        contentType.includes("text") ||
        contentType.includes("javascript") ||
        contentType.includes("xml") ||
        contentType.includes("html")
      ) {
        body = await response.text();
      } else {
        body = "[non-text content omitted]";
      }

      reqData.response = { status, headers, body };
    } catch (err) {
      console.error("Error getting response body:", err);
    }
  });
};

// Call this whenever you want to update cookies for a specific page
const updatePageCookies = async (pageName, page) => {
  const cookies = await page.cookies();
  if (!allRequests[pageName]) {
    allRequests[pageName] = { requests: [], cookies: [] };
  }
  allRequests[pageName].cookies = cookies;
};

// Call this when you want to save all data (after interactions or page load)
export const saveRequestsToFile = async (pageName, page) => {
  const { dateTime } = getDateBasedTimezone();
  const currentDateTime = dateTime.replace(/:/g, ".");
  const filePath = `${process.cwd()}/results/requests-${currentDateTime}.json`;

  await updatePageCookies(pageName, page);

  await writeFile(filePath, JSON.stringify(allRequests, null, 2));
  console.log("Requests and cookies saved to", filePath);
};
