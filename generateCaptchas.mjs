import fs from "fs/promises";
import path from "path";
import { createCanvas, registerFont } from "canvas";

const OUTPUT_DIR = path.join(process.cwd(), "new");
const FONT_DIR = path.join(process.cwd(), "fonts");
const FORMATS = ["png", "jpg", "jpeg"];
const IMAGE_WIDTH = 256;
const IMAGE_HEIGHT = 64;
const NUM_IMAGES = 6101;
const MIN_LENGTH = 6;
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const baseFontSize = 23;
const maxRotation = 0.5;
const maxSkew = 0.5;

const fontFilesRaw = await fs.readdir(FONT_DIR);
const fontFamilies = [];
fontFilesRaw.forEach((file) => {
  if (!file.endsWith(".ttf")) return;
  const fontName = path.basename(file, ".ttf");
  registerFont(path.join(FONT_DIR, file), { family: fontName });
  fontFamilies.push(fontName);
});
const uniqueFontFamilies = [...new Set(fontFamilies)];
const fontOptions = uniqueFontFamilies.map((family) => ({ family }));

const generatedTexts = new Set();

const getRandomText = () => {
  let text = "";
  let digitsCount = 0;
  let attempts = 0;

  while (attempts++ < 1000) {
    text = "";
    digitsCount = 0;

    while (text.length < MIN_LENGTH) {
      const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
      if (/\d/.test(ch)) {
        digitsCount++;
      }
      text += ch;
    }

    if (digitsCount < 2) {
      const digitPositions = Array.from({ length: MIN_LENGTH }, (_, i) => i);
      while (digitsCount < 2) {
        const idx = digitPositions.splice(
          Math.floor(Math.random() * digitPositions.length),
          1
        )[0];
        const digit = String(Math.floor(Math.random() * 10));
        text = text.substring(0, idx) + digit + text.substring(idx + 1);
        digitsCount++;
      }
    }

    if (!generatedTexts.has(text)) {
      generatedTexts.add(text);
      return text;
    }
  }

  throw new Error("❌ Could not generate a unique CAPTCHA after 1000 attempts");
};

const isDarkColor = (r, g, b) => r * 0.299 + g * 0.587 + b * 0.114 < 128;

const randomRGBColor = (brightness = "any") => {
  let r = Math.floor(Math.random() * 256);
  let g = Math.floor(Math.random() * 256);
  let b = Math.floor(Math.random() * 256);
  if (brightness === "dark") {
    r = Math.floor(Math.random() * 100);
    g = Math.floor(Math.random() * 100);
    b = Math.floor(Math.random() * 100);
  } else if (brightness === "light") {
    r = 200 + Math.floor(Math.random() * 56);
    g = 200 + Math.floor(Math.random() * 56);
    b = 200 + Math.floor(Math.random() * 56);
  }
  return `rgb(${r},${g},${b})`;
};

const generateBackground = (ctx) => {
  const grad = ctx.createLinearGradient(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
  const bgColor1 = randomRGBColor();
  const bgColor2 = randomRGBColor();
  grad.addColorStop(0, bgColor1);
  grad.addColorStop(1, bgColor2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
  return [bgColor1, bgColor2];
};

const drawNoiseDots = (ctx, count = 3000) => {
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
      Math.random() * 255
    }, 0.2)`;
    ctx.beginPath();
    ctx.arc(
      Math.random() * IMAGE_WIDTH,
      Math.random() * IMAGE_HEIGHT,
      0.5,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }
};

const drawNoiseLines = (ctx, count = 20) => {
  for (let i = 0; i < count; i++) {
    ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
      Math.random() * 255
    }, 0.4)`;
    ctx.lineWidth = Math.random() * 1.5;
    ctx.beginPath();
    ctx.moveTo(Math.random() * IMAGE_WIDTH, Math.random() * IMAGE_HEIGHT);
    ctx.lineTo(Math.random() * IMAGE_WIDTH, Math.random() * IMAGE_HEIGHT);
    ctx.stroke();
  }
};

const drawCurvedNoiseLines = (ctx, count = 6) => {
  for (let i = 0; i < count; i++) {
    ctx.beginPath();
    ctx.strokeStyle = `hsla(${Math.floor(Math.random() * 360)}, 80%, 60%, 0.5)`;
    ctx.lineWidth = 1.5 + Math.random() * 2;
    const amplitude = 5 + Math.random() * 10;
    const frequency = 0.05 + Math.random() * 0.1;
    const offsetY = Math.random() * IMAGE_HEIGHT;

    ctx.moveTo(0, offsetY);
    for (let x = 0; x <= IMAGE_WIDTH; x += 2) {
      const y = offsetY + Math.sin(x * frequency) * amplitude;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
};

const drawText = (ctx, text, textColor = "#000") => {
  const charSpacing = IMAGE_WIDTH / (text.length + 2);
  let offsetX = 0;
  for (let i = 0; i < text.length; i++) {
    const { family } =
      fontOptions[Math.floor(Math.random() * fontOptions.length)];
    const fontSize = baseFontSize + Math.floor(Math.random() * 12);
    ctx.save();
    ctx.font = `${fontSize}px "${family}"`;

    const waveY = Math.sin((i / text.length) * Math.PI * 2) * 8;
    const rotate = (Math.random() - 0.5) * maxRotation * 2;
    const skewX = (Math.random() - 0.5) * maxSkew * 2;
    const scaleY = 0.9 + Math.random() * 0.3;

    const x = charSpacing * (i + 1) + offsetX + (Math.random() - 0.5) * 3;
    const y = IMAGE_HEIGHT / 2 + waveY + (Math.random() - 0.5) * 10;

    ctx.translate(x, y);
    ctx.transform(1, 0, skewX, scaleY, 0, 0);
    ctx.rotate(rotate);
    ctx.fillStyle = textColor;
    ctx.fillText(text[i], -10, 10);
    ctx.restore();

    offsetX += 2 + Math.random() * 5; // Overlap characters slightly
  }
};

const generateImage = async (text) => {
  const canvas = createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT);
  const ctx = canvas.getContext("2d");

  // Generate background gradient
  const [bg1] = generateBackground(ctx);

  // Initial noise before text
  drawNoiseDots(ctx, 1200);
  // drawNoiseLines(ctx, 15); // background straight lines
  // drawCurvedNoiseLines(ctx, 2); // background curves

  // Decide text color based on background brightness
  const getRGB = (css) => css.match(/\d+/g).map(Number);
  const [r, g, b] = getRGB(bg1);
  const textColor = isDarkColor(r, g, b) ? "#fff" : "#000";

  // Draw the actual text once
  drawText(ctx, text, textColor);

  // Foreground noise after text (to occlude/obstruct slightly)
  drawCurvedNoiseLines(ctx, 2); // foreground curves
  drawNoiseLines(ctx, 10); // foreground straight lines
  drawNoiseDots(ctx, 1000); // foreground dots

  return canvas;
};

const run = async () => {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  for (let i = 0; i < NUM_IMAGES; i++) {
    const text = getRandomText();
    const canvas = await generateImage(text);
    const format = FORMATS[Math.floor(Math.random() * FORMATS.length)];
    const _format = format === "jpg" || format === "jpeg" ? "jpeg" : format;
    const buffer = canvas.toBuffer(`image/${_format}`);
    const fileName = `${text}.${format}`;
    await fs.writeFile(path.join(OUTPUT_DIR, fileName), buffer);
  }
  console.log(`✅ Done generating ${NUM_IMAGES} CAPTCHA images.`);
};

run().catch(console.error);
