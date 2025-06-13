/*
 *
 *
 * Helper: fillCaptchaFormAndSubmit.
 *
 */
import { writeFile } from "fs/promises";
import path from "path";
import getRandomId from "./getRandomId.mjs";
import {
  receivedResolvedCaptchasPath,
  receivedRejectedCaptchasPath,
  htmlFilesPath,
} from "./constants.mjs";
import getCaptchaImageUrl from "./getCaptchaImageUrl.mjs";
import downloadBase64FromPage from "./downloadBase64FromPage.mjs";

const checkIfInputHasValue = async (page) => {
  let hasValue = false;

  try {
    await page.waitForFunction(
      () => {
        const input = document.querySelector("#captchaText");
        return input && input.value && input.value.length > 0;
      },
      { timeout: 10000 }
    );

    hasValue = true; // ✅ Value was set successfully within time
  } catch (err) {
    if (err.name === "TimeoutError") {
      hasValue = false; // ❌ Value was not set within time
    }
  }

  return hasValue;
};

const saveCaptchaImage = async ({
  extension,
  fileName,
  fileBase64,
  captchaText,
  isRejected,
}) => {
  try {
    const buffer = Buffer.from(fileBase64, "base64");

    // const _captchaText = captchaText ? captchaText : getRandomId();
    const _captchaText = captchaText
      ? `${captchaText}_${getRandomId()}`
      : getRandomId();

    const filePath = path.join(
      isRejected ? receivedRejectedCaptchasPath : receivedResolvedCaptchasPath,
      `${fileName}_${_captchaText}.${extension}`
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
  const { isAcceptance, page, captchaFileName, retryCount = 0 } = options;

  const MAX_RETRIES = isAcceptance ? 4 : 8;

  const captchaImageFullurl = await getCaptchaImageUrl(page);

  console.log("captchaImageFullurl", captchaImageFullurl);

  const { extension, fileName, fileBase64 } = await downloadBase64FromPage(
    page,
    {
      fileName: captchaFileName,
      fileUrl: captchaImageFullurl,
    }
  );

  if (fileBase64) {
    // const captchaText = await solveCaptchaWithAI();
    const captchaText = "";

    const apiEndpointName = isAcceptance
      ? "captcha_accept.cfm"
      : "captcha_reject.cfm";

    // Clear previous input (important for retries)
    // await page.evaluate(() => {
    //   const input = document.querySelector("#captchaText");
    //   if (input) input.value = "";
    // });

    // Type captcha text
    // await page.type("#captchaText", captchaText);

    // Setup listeners BEFORE clicking
    const acceptResponsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("captcha_accept.cfm") &&
        res.request().method() === "POST" &&
        res.status() >= 200 &&
        res.status() < 300,
      { timeout: 80000 }
    );

    const rejectResponsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("captcha_reject.cfm") &&
        res.request().method() === "POST" &&
        res.status() >= 200 &&
        res.status() < 300,
      { timeout: 80000 }
    );

    await checkIfInputHasValue(page);

    // Then submit form
    await page.click("form input[type=submit]#submit");

    // Wait for both responses
    const [acceptResult, rejectResult] = await Promise.allSettled([
      acceptResponsePromise,
      rejectResponsePromise,
    ]);

    let rejectHtmlText = "";

    // Handle fulfilled reject response
    if (rejectResult.status === "fulfilled") {
      rejectHtmlText = await rejectResult.value.text();

      const rejectFilePath = path.join(
        htmlFilesPath,
        `reject_captcha_${getRandomId()}.html`
      );

      await writeFile(rejectFilePath, rejectHtmlText);
    }

    // Handle fulfilled accept response
    if (acceptResult.status === "fulfilled") {
      const acceptHtmlText = await acceptResult.value.text();

      const acceptFilePath = path.join(
        htmlFilesPath,
        `accept_captcha_${getRandomId()}.html`
      );

      await writeFile(acceptFilePath, acceptHtmlText);
    }

    const isRejected =
      rejectHtmlText.toLowerCase().includes("did not enter the right text") ||
      rejectHtmlText.toLowerCase().includes("incorrect captcha");

    // Save the captcha image and recognized text for debugging/record
    await saveCaptchaImage({
      extension,
      fileName,
      fileBase64,
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

      // Retry recursively with new captcha image
      return await fillCaptchaFormAndSubmit({
        isAcceptance,
        page,
        retryCount: retryCount + 1,
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
