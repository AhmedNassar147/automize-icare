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
  htmlCaptchasPath,
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

    // const _captchaText = captchaText ? captchaText : getRandomId();
    const _captchaText = captchaText
      ? `${captchaText}_${getRandomId()}`
      : getRandomId();

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

  const MAX_RETRIES = isAcceptance ? 4 : 8;

  if (captchaBase64) {
    // const captchaText = await solveCaptchaWithAI();
    const captchaText = "";

    const apiEndpointName = isAcceptance
      ? "captcha_accept.cfm"
      : "captcha_reject.cfm";

    // Clear previous input (important for retries)
    await page.evaluate(() => {
      const input = document.querySelector("#captchaText");
      if (input) input.value = "";
    });

    // Type captcha text
    // await page.type("#captchaText", captchaText);

    // Prepare to listen for new captcha response without awaiting
    const captchaResponsePromise = getCaptchaResponsePromiseFromPage(page);

    await new Promise((resolve) => setTimeout(resolve, 30000)); // Wait for 30 seconds

    await page.click("form input[type=submit]#submit");

    // Wait for both responses in parallel, safely
    const [rejectResult, acceptResult] = await Promise.allSettled([
      page.waitForResponse(
        (res) =>
          res.url().includes(`common/captcha_reject.cfm`) &&
          res.request().method() === "POST" &&
          res.status() >= 200 &&
          res.status() < 300,
        { timeout: 40000 }
      ),
      page.waitForResponse(
        (res) =>
          res.url().includes(`common/captcha_accept.cfm`) &&
          res.request().method() === "POST" &&
          res.status() >= 200 &&
          res.status() < 300,
        { timeout: 40000 }
      ),
    ]);

    let rejectHtmlText = "";

    const saveFilesArray = [];

    // Handle fulfilled reject response
    if (rejectResult.status === "fulfilled") {
      rejectHtmlText = await rejectResult.value.text();

      const rejectFilePath = path.join(
        htmlCaptchasPath,
        `reject_${getRandomId()}.html`
      );

      saveFilesArray.push([rejectFilePath, rejectHtmlText]);
    }

    // Handle fulfilled accept response
    if (acceptResult.status === "fulfilled") {
      const acceptHtmlText = await acceptResult.value.text();

      const acceptFilePath = path.join(
        htmlCaptchasPath,
        `accept_${getRandomId()}.html`
      );

      saveFilesArray.push([acceptFilePath, acceptHtmlText]);
    }

    // Write files concurrently
    if (saveFilesArray.length) {
      await Promise.all(
        saveFilesArray.map(([path, data]) => writeFile(path, data))
      );
    }

    const isRejected = rejectHtmlText
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
