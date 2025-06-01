/*
 *
 * Helper: `sendMessageUsingWhatsapp`.
 *
 */
import qrcode from "qrcode-terminal";
import pkg from "whatsapp-web.js";
import getMimeType from "./getMimeType.mjs";

const { Client, LocalAuth, MessageMedia } = pkg;

// Define the recipient number (no +, no spaces)
const number = "966569157706"; // Saudi Arabia number
// const number = "201093184489"; // Saudi Arabia number
const chatId = `${number}@c.us`;

const sendMessageUsingWhatsapp = async (messages) => {
  // Create WhatsApp client
  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: false, // Set to true to hide browser window
      // args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  // Show QR code in terminal
  client.on("qr", (qr) => {
    console.log("Scan the QR code below:");
    qrcode.generate(qr, { small: true });
  });

  const sendMessageWithFiles = async ({ message, files }) => {
    try {
      await client.sendMessage(chatId, message);
      console.log("Message sent!");

      if (Array.isArray(files)) {
        console.log("Sending files ...");

        for (const { extension, fileBase64, fileName } of files) {
          if (extension && fileBase64) {
            const mimeType = getMimeType(extension);
            const _fileName = `${fileName || "document"}.${extension || "bin"}`;

            const media = new MessageMedia(mimeType, fileBase64, _fileName);
            await client.sendMessage(chatId, media);
          }
        }
      }
    } catch (error) {
      console.log("Failed to send message!", error);
    }
  };

  // Ready
  client.on("ready", async () => {
    console.log("WhatsApp is ready!");

    const clonedMessages = [...messages];

    while (clonedMessages.length) {
      const [message] = clonedMessages.splice(0, 1);
      await sendMessageWithFiles(message);
    }
  });

  try {
    await client.initialize();
  } catch (error) {
    console.log("Failed to initialize WhatsApp client!");
  }
};

export default sendMessageUsingWhatsapp;
