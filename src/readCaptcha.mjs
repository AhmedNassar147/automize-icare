import { OpenAI } from "openai";
import path from "path";
import { readFile } from "fs/promises";

// 1. Init OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 2. Read base64 file
const run = async () => {
  const filePath = path.resolve(
    process.cwd(),
    "./test-captcha/image-test1.jpeg"
  );

  const imageBuffer = await readFile(filePath);
  const base64Image = imageBuffer.toString("base64");

  // 4. Ask GPT about it
  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4o", // 👈 new model
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "What's the text in this CAPTCHA image?" },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
        ],
      },
    ],
  });

  console.log("🧠 GPT says:", chatCompletion);
};

run().catch(console.error);
