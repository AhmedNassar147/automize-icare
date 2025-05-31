/*
 *
 * Helper: `readCaptcha`.
 *
 */
import Tesseract from "tesseract.js";
import path from "path";
import sharp from "sharp";

const readCaptcha = async (imageNameWithExtension) => {
  const imagePath = path.resolve(
    process.cwd(),
    "test-captcha",
    imageNameWithExtension
  );

  const [imageName, extension] = imageNameWithExtension.split(".");

  const preprocessedPath = path.resolve(
    process.cwd(),
    "test-captcha",
    `${imageName}-preprocessed.${extension}`
  );

  // Step 1: Preprocess image
  await sharp(imagePath)
    .resize({ width: 300 }) // Upscale to improve OCR
    .grayscale()
    .modulate({ brightness: 1.2, saturation: 0 }) // More contrast
    .threshold(140)
    .toFile(preprocessedPath);

  try {
    const result = await Tesseract.recognize(preprocessedPath, "eng", {
      logger: (m) => console.log(m), // Optional: logs progress
      tessedit_char_whitelist:
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    });

    console.log("result", result);
  } catch (error) {
    console.log("error", error);
  }
};

export default readCaptcha;

await readCaptcha("image-test5.jpeg");
