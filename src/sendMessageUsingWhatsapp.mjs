/*
 *
 * Helper: `sendMessageUsingWhatsapp`.
 *
 */
// send-whatsapp.js (ESM module)
import qrcode from "qrcode-terminal";
import pkg from "whatsapp-web.js";

const { Client, LocalAuth } = pkg;

// Define the recipient number (no +, no spaces)
const number = "966569157706"; // Saudi Arabia number
const chatId = `${number}@c.us`;

const sendMessageUsingWhatsapp = async (message) => {
  // Create WhatsApp client
  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: false, // Set to true to hide browser window
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  // Show QR code in terminal
  client.on("qr", (qr) => {
    console.log("Scan the QR code below:");
    qrcode.generate(qr, { small: true });
  });

  // Ready
  client.on("ready", async () => {
    console.log("WhatsApp is ready!");

    try {
      await client.sendMessage(chatId, message);
      console.log("Message sent!");
    } catch (error) {
      console.log("Failed to send message!");
    }
  });

  // Initialize
  client.initialize();
};

export default sendMessageUsingWhatsapp;
