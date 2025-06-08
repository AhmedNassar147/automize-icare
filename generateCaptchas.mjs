import fs from "fs/promises";
import path from "path";
import { createCanvas, registerFont, loadImage } from "canvas";

const OUTPUT_DIR = path.join(process.cwd(), "../test-new/captchas");
const FONT_DIR = path.join(process.cwd(), "fonts");
const FORMATS = ["png", "jpg", "jpeg"]; // Supported formats

const IMAGE_WIDTH = 224;
const IMAGE_HEIGHT = 224;
const NUM_IMAGES = 6024;
const MIN_LENGTH = 6;
const MAX_LENGTH = 6;
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const WATERMARK_TEXTS = [
  "CAPTCHA",
  "SECURE",
  "VERIFY",
  "AUTH",
  "LOCKED",
  "SAFE",
];

// Load and register fonts using full font filename (without extension) as family name
const fontFilesRaw = await fs.readdir(FONT_DIR);
const fontFamilies = [];

fontFilesRaw.forEach((file) => {
  if (!file.endsWith(".ttf")) return;
  const fontName = path.basename(file, ".ttf"); // e.g. "Lato-Italic" or "OpenSans-Bold"
  registerFont(path.join(FONT_DIR, file), { family: fontName });
  fontFamilies.push(fontName);
});

// Remove duplicates if any
const uniqueFontFamilies = [...new Set(fontFamilies)];

// Flatten for random selection
const fontOptions = uniqueFontFamilies.map((family) => ({ family }));

// Generate random HSL colors for dark, semi-dark, light variants
const randomHSLColor = (type) => {
  const hue = Math.floor(Math.random() * 360);
  if (type === "dark") return `hsl(${hue}, 60%, ${Math.random() * 20 + 10}%)`; // 10-30%
  if (type === "semi-dark")
    return `hsl(${hue}, 60%, ${Math.random() * 20 + 30}%)`; // 30-50%
  if (type === "light") return `hsl(${hue}, 60%, ${Math.random() * 30 + 60}%)`; // 60-90%
  return `hsl(${hue}, 60%, 50%)`;
};

const getRandomText = () => {
  const len =
    Math.floor(Math.random() * (MAX_LENGTH - MIN_LENGTH + 1)) + MIN_LENGTH;
  return Array.from(
    { length: len },
    () => CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join("");
};

const drawNoiseDots = (ctx) => {
  for (let i = 0; i < 1000; i++) {
    ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${
      Math.random() * 255
    },0.1)`;
    ctx.fillRect(
      Math.random() * IMAGE_WIDTH,
      Math.random() * IMAGE_HEIGHT,
      1,
      1
    );
  }
};

const drawNoiseLines = (ctx) => {
  for (let i = 0; i < 10; i++) {
    ctx.strokeStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${
      Math.random() * 255
    },0.3)`;
    ctx.beginPath();
    if (Math.random() > 0.5) {
      ctx.moveTo(0, Math.random() * IMAGE_HEIGHT);
      ctx.lineTo(IMAGE_WIDTH, Math.random() * IMAGE_HEIGHT);
    } else {
      ctx.moveTo(Math.random() * IMAGE_WIDTH, 0);
      ctx.lineTo(Math.random() * IMAGE_WIDTH, IMAGE_HEIGHT);
    }
    ctx.stroke();
  }
};

const drawWatermark = (ctx) => {
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = "#fff";
  ctx.font = "16px Sans";

  const wmText =
    WATERMARK_TEXTS[Math.floor(Math.random() * WATERMARK_TEXTS.length)];

  for (let y = 0; y < IMAGE_HEIGHT; y += 20) {
    for (let x = 0; x < IMAGE_WIDTH; x += 50) {
      ctx.save();

      const angle = (Math.random() - 0.5) * 0.3;
      ctx.translate(x + 25, y + 10);
      ctx.rotate(angle);
      ctx.fillText(wmText, -ctx.measureText(wmText).width / 2, 0);
      ctx.restore();
    }
  }
  ctx.restore();
};

const generateBackground = (ctx) => {
  const bgTypeRand = Math.random();
  let startColor, endColor;

  if (bgTypeRand < 0.33) {
    startColor = randomHSLColor("dark");
    endColor = randomHSLColor("semi-dark");
  } else if (bgTypeRand < 0.66) {
    startColor = randomHSLColor("semi-dark");
    endColor = randomHSLColor("light");
  } else {
    startColor = randomHSLColor("light");
    endColor = randomHSLColor("light");
  }

  const grad = ctx.createLinearGradient(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
  grad.addColorStop(0, startColor);
  grad.addColorStop(1, endColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
};

const createSVGNoise = () => {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}">
    <filter id="noise" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)" fill="white" opacity="0.1"/>
  </svg>
  `;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
};

const drawText = (ctx, text) => {
  const charSpacing = IMAGE_WIDTH / (text.length + 2);
  let offsetX = 0;

  for (let i = 0; i < text.length; i++) {
    const { family } =
      fontOptions[Math.floor(Math.random() * fontOptions.length)];
    const fontSize = 25 + Math.floor(Math.random() * 20); // 25-45 px font size

    let angle = (Math.random() - 0.5) * 0.8;
    if (Math.random() < 0.25) angle = (Math.random() - 0.5) * 3.0;

    const skewX = 0.2 - Math.random() * 0.4;
    const scaleY = 0.8 + Math.random() * 0.5;

    const waveAmplitude = 10;
    const waveFrequency = 0.5;
    let baseY =
      IMAGE_HEIGHT / 2 +
      Math.sin(i * waveFrequency) * waveAmplitude +
      (Math.random() - 0.5) * 10;

    const randomPosShiftX = (Math.random() - 0.5) * 10;
    const randomPosShiftY = (Math.random() - 0.5) * 10;

    let fillColor;
    const colorTypeRand = Math.random();
    if (colorTypeRand < 0.33) fillColor = randomHSLColor("dark");
    else if (colorTypeRand < 0.66) fillColor = randomHSLColor("semi-dark");
    else fillColor = randomHSLColor("light");

    ctx.save();
    ctx.font = `${fontSize}px "${family}"`;
    ctx.translate(
      charSpacing * (i + 1) + offsetX + randomPosShiftX,
      baseY + randomPosShiftY
    );
    ctx.rotate(angle);
    ctx.transform(1, 0, skewX, scaleY, 0, 0);
    ctx.fillStyle = fillColor;

    const ch = text[i];

    if (Math.random() < 0.2 && i < text.length - 1 && /\d/.test(text[i + 1])) {
      ctx.fillText(ch, -10, 10);
      ctx.fillText(text[i + 1], -2, -10);
      i++;
    } else {
      ctx.fillText(ch, -10, 10);
    }

    ctx.restore();

    offsetX += 2 + Math.random() * 8;
  }
};

const generateImage = async (text) => {
  const canvas = createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT);
  const ctx = canvas.getContext("2d");

  generateBackground(ctx);
  drawWatermark(ctx);
  drawNoiseLines(ctx);
  drawNoiseDots(ctx);

  const svgNoiseUrl = createSVGNoise();
  const noiseImg = await loadImage(svgNoiseUrl);
  ctx.drawImage(noiseImg, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);

  drawText(ctx, text);

  return canvas;
};

const run = async () => {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  for (let i = 0; i < NUM_IMAGES; i++) {
    if (i % 1000 === 0) console.log(`Generated ${i} images...`);

    const text = getRandomText();
    const canvas = await generateImage(text);
    const format = FORMATS[Math.floor(Math.random() * FORMATS.length)];

    const ext = FORMATS[Math.floor(Math.random() * FORMATS.length)];

    const mimeType = ext === "png" ? "image/png" : "image/jpeg";
    const buffer = canvas.toBuffer(mimeType);

    const fileName = `${text}.${format}`;
    await fs.writeFile(path.join(OUTPUT_DIR, fileName), buffer);
  }

  console.log(`Done generating ${NUM_IMAGES} CAPTCHA images.`);
};

run().catch(console.error);
