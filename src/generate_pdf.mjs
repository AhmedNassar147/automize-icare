/**
 *
 * Helper: generate_pdf
 *
 */
import fs from "fs";
import PDFLib, { PDFDocument, rgb, PageSizes } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

// Function to sanitize Arabic text
const sanitizeArabicText = (text) => {
  // Remove zero-width non-joiner (U+200C) and zero-width joiner (U+200D)
  // return text.replace(/[\u200C\u200D]/g, "");
  return text.replace(/[\u200B-\u200D\uFEFF]/g, "");
};

const generateReferralPDF = async () => {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // Add a page to the document
  const page = pdfDoc.addPage(PageSizes.A4); // A4 size (595x842 pts)

  // Set font for the document
  const helveticaFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(
    PDFLib.StandardFonts.HelveticaBold
  );

  // Embed a custom font that supports Arabic (e.g., DejaVu Sans)
  const arabicFontPath = `${process.cwd()}/fonts/Almarai-Regular.ttf`; // Path to your font file

  // 2. Register fontkit for custom fonts
  pdfDoc.registerFontkit(fontkit);

  const arabicFont = await pdfDoc.embedFont(fs.readFileSync(arabicFontPath));

  return { pdfDoc, page, helveticaFont, helveticaBoldFont, arabicFont };
};

const addHeader = async (page, pdfDoc, arabicFont) => {
  // Add logos (assuming you have image files)

  const basePath = `${process.cwd()}/images`;

  const logoMinistry = await pdfDoc.embedPng(
    fs.readFileSync(`${basePath}/ministry.png`)
  );
  const logoProgram = await pdfDoc.embedJpg(
    fs.readFileSync(`${basePath}/ehala.jpg`)
  );

  // Draw logos
  page.drawImage(logoMinistry, { x: 20, y: 780, width: 100 });
  page.drawImage(logoProgram, { x: 500, y: 780, width: 100 });

  page.drawText(sanitizeArabicText("وزارة الصحة"), {
    x: 20,
    y: 740,
    size: 10,
    font: arabicFont,
  });

  page.drawText(sanitizeArabicText("برنامج الاحالة"), {
    x: 20,
    y: 720,
    size: 10,
    font: arabicFont,
  });

  // Add horizontal line
  page.drawLine({
    start: { x: 20, y: 700 },
    end: { x: 575, y: 700 },
    thickness: 1,
  });
};

const addPatientData = async (page, arabicFont) => {
  // Table header
  page.drawText(sanitizeArabicText("بيانات المريض"), {
    x: 20,
    y: 680,
    size: 12,
    font: arabicFont,
    color: rgb(0, 0, 0),
  });

  // Patient data
  page.drawText(sanitizeArabicText("اسم المريض:"), {
    x: 20,
    y: 650,
    size: 10,
    font: arabicFont,
  });
  page.drawText(sanitizeArabicText("MOHAMMED X MUSALLAM"), {
    x: 150,
    y: 650,
    size: 10,
    font: arabicFont,
  });

  page.drawText(sanitizeArabicText("رقم الإثبات:"), {
    x: 20,
    y: 630,
    size: 10,
    font: arabicFont,
  });
  page.drawText("1218210936", {
    x: 150,
    y: 630,
    size: 10,
    font: arabicFont,
  });

  page.drawText(sanitizeArabicText("الجنسية:"), {
    x: 300,
    y: 650,
    size: 10,
    font: arabicFont,
  });
  page.drawText("SAUDI", { x: 400, y: 650, size: 10, font: arabicFont });

  page.drawText(sanitizeArabicText("رقم التواصل:"), {
    x: 300,
    y: 630,
    size: 10,
    font: arabicFont,
  });
  page.drawText(sanitizeArabicText("-"), {
    x: 400,
    y: 630,
    size: 10,
    font: arabicFont,
  });
};

const addBodyText = async (page, arabicFont) => {
  // Main text
  page.drawText(
    sanitizeArabicText(
      "سعادة مدير مستشفى Maternity and Children Hospital Abha المحترم"
    ),
    {
      x: 20,
      y: 500,
      size: 10,
      font: arabicFont,
      color: rgb(0, 0, 0),
    }
  );

  page.drawText(sanitizeArabicText("السلام عليكم ورحمة الله وبركاته,"), {
    x: 20,
    y: 480,
    size: 10,
    font: arabicFont,
  });

  page.drawText(
    sanitizeArabicText(
      "إشارة لإحالة رقم 292132 بتاريخ 30/04/2025 بشأن المريض الموضح بياناته أعلاه."
    ),
    {
      x: 20,
      y: 460,
      size: 10,
      font: arabicFont,
    }
  );

  page.drawText(
    sanitizeArabicText(
      "نفيد سعادتكم بأنه تم قبول المريض حسب ما هو موضح بمعلومات الحجز أعلاه."
    ),
    {
      x: 20,
      y: 440,
      size: 10,
      font: arabicFont,
    }
  );

  page.drawText(
    sanitizeArabicText(
      "يرجى اتخاذ كافة الإجراءات اللازمة لأمانة المريض مع مراعاة النقاط المذكورة أعلاه."
    ),
    {
      x: 20,
      y: 420,
      size: 10,
      font: arabicFont,
    }
  );

  page.drawText(sanitizeArabicText("وتقبلوا تحياتنا"), {
    x: 20,
    y: 400,
    size: 10,
    font: arabicFont,
  });

  // Hospital name
  page.drawText(sanitizeArabicText("TADAWI MEDICAL HOSPITAL"), {
    x: 200,
    y: 380,
    size: 12,
    font: arabicFont,
    color: rgb(0, 0, 0),
  });
};

const addNotesSection = async (page, arabicFont) => {
  // Notes header
  page.drawText(sanitizeArabicText("ملاحظات مهمة"), {
    x: 20,
    y: 340,
    size: 12,
    font: arabicFont,
    color: rgb(0, 0, 0),
  });

  // Bullet points
  const bulletPoints = [
    "يلتزم المستشفى استقبال الحالة المحولة عند تحقيق الهدف الأساسي من العلاج.",
    "الرجاء إحضار أصل هوية المريض عند الحضور للمستشفى.",
    "عند اختلاف التاريخ الهجري مع التاريخ الميلادي يرجى اعتماد التاريخ الميلادي للمرجع.",
    "يرجى الالتزام بتأريخ الموعد المحدد ومدة حجز السرير حتى يتم خدمة المرض بالشكل المطلوب.",
  ];

  bulletPoints.forEach((point, index) => {
    page.drawText(sanitizeArabicText("• " + point), {
      x: 20,
      y: 320 - index * 20,
      size: 10,
      font: arabicFont,
    });
  });
};

const addFooter = async (page, arabicFont) => {
  // Footer content
  page.drawText(sanitizeArabicText("0569157706"), {
    x: 20,
    y: 20,
    size: 10,
    font: arabicFont,
  });
  page.drawText(sanitizeArabicText("تلفون قسم التنسيق"), {
    x: 20,
    y: 10,
    size: 10,
    font: arabicFont,
  });

  page.drawText(sanitizeArabicText("AMER"), {
    x: 250,
    y: 20,
    size: 10,
    font: arabicFont,
  });

  page.drawText(sanitizeArabicText("30/04/2025"), {
    x: 500,
    y: 20,
    size: 10,
    font: arabicFont,
  });
  page.drawText(sanitizeArabicText("التاريخ"), {
    x: 500,
    y: 10,
    size: 10,
    font: arabicFont,
  });
};

const __generateReferralPDF = async () => {
  const { pdfDoc, page, arabicFont } = await generateReferralPDF();
  await addHeader(page, pdfDoc, arabicFont);
  await addPatientData(page, arabicFont);
  await addBodyText(page, arabicFont);
  await addNotesSection(page, arabicFont);
  await addFooter(page, arabicFont);

  // Serialize the PDF to a buffer
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};

export default __generateReferralPDF;
