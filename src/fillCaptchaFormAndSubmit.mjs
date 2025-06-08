/*
 *
 *
 * Helper: fillCaptchaFormAndSubmit.
 *
 */
import { writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import getCaptchaResponsePromiseFromPage from "./getCaptchaResponsePromiseFromPage.mjs";
import {
  receivedResolvedCaptchasPath,
  receivedRejectedCaptchasPath,
} from "./constants.mjs";

const getRandomId = (size = 8) => randomBytes(size).toString("hex");

const saveCaptchaImage = async ({
  captchaBase64,
  captchaExtension,
  captchaFileName,
  captchaText,
  isRejected,
}) => {
  try {
    const buffer = Buffer.from(captchaBase64, "base64");

    const _captchaText = captchaText ? captchaText : getRandomId();

    const filePath = path.join(
      isRejected ? receivedRejectedCaptchasPath : receivedResolvedCaptchasPath,
      `${captchaFileName}_${_captchaText}.${captchaExtension}`
    );
    await writeFile(filePath, buffer);
  } catch (err) {
    console.log(`Failed to save base64 image: ${err.message}`);
  }
};

const solveCaptchaWithAI = async (base64) => {
  // Call your OCR API or AI model here
  // Return the recognized text or empty string
  return "abc123"; // dummy
};

const fillCaptchaFormAndSubmit = async (options) => {
  const {
    captchaBase64,
    isAcceptance,
    page,
    captchaExtension,
    captchaFileName,
    retryCount = 0,
  } = options;

  const MAX_RETRIES = isAcceptance ? 3 : 6;

  if (captchaBase64) {
    const captchaText = await solveCaptchaWithAI();

    const apiEndpointName = isAcceptance
      ? "captcha_accept.cfm"
      : "captcha_reject.cfm";

    // Clear previous input (important for retries)
    await page.evaluate(() => {
      const input = document.querySelector("#captchaText");
      if (input) input.value = "";
    });

    // Type captcha text
    await page.type("#captchaText", captchaText);

    // Prepare to listen for new captcha response without awaiting
    const captchaResponsePromise = getCaptchaResponsePromiseFromPage(page);

    // Submit form and wait for response
    const [pageNewHtml] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes(`common/${apiEndpointName}`) &&
          res.request().method() === "POST" &&
          res.status() >= 200 &&
          res.status() < 300,
        { timeout: 4000 }
      ),
      page.click("form input[type=submit]#submit"),
    ]);

    const htmlText = await pageNewHtml.text();

    const isRejected = htmlText
      .toLowerCase()
      .includes("you did not enter the right text");

    // Save the captcha image and recognized text for debugging/record
    await saveCaptchaImage({
      captchaBase64,
      captchaExtension,
      captchaFileName,
      captchaText,
      isRejected,
    });

    if (isRejected) {
      if (retryCount >= MAX_RETRIES) {
        console.log(
          `❌ ${retryCount} retries reached: we couldn't solve the captcha.`
        );

        // Return false on failure after max retries
        return {
          isAccepted: false,
          message: `Failed to solve captcha, reached max retries ${MAX_RETRIES}.`,
        };
      }

      // Get new captcha image info from the promise
      const result = await captchaResponsePromise;

      const {
        captchaBase64: _captchaBase64,
        captchaExtension: _captchaExtension,
      } = result || {};

      // Retry recursively with new captcha image
      return await fillCaptchaFormAndSubmit({
        isAcceptance,
        page,
        captchaBase64: _captchaBase64 || "",
        retryCount: retryCount + 1,
        captchaExtension: _captchaExtension,
        captchaFileName,
      });
    }

    // If not rejected, return true indicating success
    return {
      isAccepted: true,
      message: `Captcha solved successfully, after retries=${retryCount}.`,
    };
  }

  return {
    isAccepted: false,
    message: "No captcha Found",
  };
};

export default fillCaptchaFormAndSubmit;
