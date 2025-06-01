/*
 *
 * Helper: `sendMessageUsingWhatsapp`.
 *
 */
import qrcode from "qrcode-terminal";
import pkg from "whatsapp-web.js";

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
        console.log("Sending files!");
        for (const { mimeType, fileBase64, fileName } of files) {
          const media = new MessageMedia(mimeType, fileBase64, fileName);
          await client.sendMessage(chatId, media);
        }
      }
    } catch (error) {
      console.log("Failed to send message!", error);
    }
  };

  // Ready
  client.on("ready", async () => {
    console.log("WhatsApp is ready!");

    while (messages.length) {
      const [item] = messages.splice(0, 1);
      await sendMessageWithFiles(item);
    }
  });

  try {
    await client.initialize();
  } catch (error) {
    console.log("Failed to initialize WhatsApp client!");
  }
};

export default sendMessageUsingWhatsapp;
