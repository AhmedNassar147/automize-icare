/*
 *
 * Helper: `readCaptchaText`.
 *
 */
import path from "path";
import { readFile } from "fs/promises";
import dotenv from "dotenv";

dotenv.config(); // Loads API key from .env file

const apiKey = process.env.OPENAI_API_KEY;

const readCaptchaText = async (imageBase64, ext) => {
  const prompt = `Extract the exact text in this image.
It contains only alphanumeric characters (A–Z, a–z, 0–9) — no math, no symbols.
Ignore things like superscripts or formatting (e.g., R^2 should be treated as R2).
Do not assume, guess, or reorder characters.
Preserve the character order exactly as they appear.
Maintain the exact case — return uppercase and lowercase letters exactly as shown.
If any character is unclear or distorted, use visual context (e.g., nearby letters above, beside, or below) to identify it.
Return only the text, with no explanation, no formatting, and no additional output.`;

  try {
    const payload = {
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: { url: `data:image/${ext};base64,${imageBase64}` },
            },
          ],
        },
      ],
      max_tokens: 1000,
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    // const message = data.choices[0].message.content.trim();
    console.log("data.choices[0].message", data.choices[0].message);
  } catch (error) {
    console.log("ERROR", error);
  }
};

(async () => {
  const imagePath = path.resolve(process.cwd(), "test-captcha/image7.png");

  const ext = path.extname(imagePath).slice(1); // e.g., 'png', 'jpg'
  const buffer = await readFile(imagePath);
  const imageBase64 = buffer.toString("base64");

  console.log("imagePath", imagePath);
  console.log("ext", ext);

  console.time("Extracting Text");
  // Run the function with your image path
  await readCaptchaText(imageBase64, ext);
  console.timeEnd("Extracting Text");
})();
