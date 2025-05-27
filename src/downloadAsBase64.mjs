/*
 *
 * Helper: `downloadAsBase64`.
 *
 */
import https from "node:https";
import { URL } from "node:url";

const downloadAsBase64 = (fileUrl, cookieHeader) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    const url = new URL(fileUrl);

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      protocol: url.protocol,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      headers: {},
    };

    if (cookieHeader) {
      options.headers.Cookie = cookieHeader;
    }

    https
      .get(options, (res) => {
        if (res.statusCode !== 200) {
          return reject(
            new Error(
              `Failed to download: ${fileUrl} (status ${res.statusCode})`
            )
          );
        }

        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const buffer = Buffer.concat(chunks);
          const base64 = buffer.toString("base64");

          resolve({
            fileUrl,
            fileBase64: base64,
          });
        });
      })
      .on("error", reject);
  });

export default downloadAsBase64;
