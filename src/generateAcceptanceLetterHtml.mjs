/*
 *
 * Helper: `generateAcceptanceLetterHtml`.
 *
 */
const generateAcceptanceLetterHtml = ({
  referralId,
  requestedDate,
  adherentName,
  nationalId,
  referralType,
  requiredSpecialty,
  providerSourceName,
  nationality,
  // sourceZone,
  // ihalatiReferralId,
  // adherentId,
}) => {
  const [date] = (requestedDate || "").split(" ");
  const [year, month, day] = date.split("-");
  const requestDate = `${day}/${month}/${year}`;

  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
    <title>نموذج الإحالة</title>
    <style>
      body {
        background-color: #ffffff;
        direction: rtl;
        padding: 15px;
      }

      .container {
        background-color: #ffffff;
        padding: 15px;
        border: 1px solid #ccc;
        max-width: 900px;
        margin: 0 auto;
      }

      .header {
        margin-bottom: 15px;
      }

      .header-logos {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .header-logos img {
        height: 50px;
      }

      .header-center-text {
        text-align: center;
        flex-grow: 1;
        font-size: 16px;
        line-height: 1.5;
      }

      .title {
        border-top: 2px solid #666;
        margin: 10px 0;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }

      td {
        border: 1px solid #999;
        padding: 8px 10px;
        font-size: 16px;
      }

      td strong {
        font-size: 18px;
      }

      .section-title {
        background-color: #eaeacb;
        font-weight: bold;
        text-align: center;
      }

      .footer {
        text-align: center;
        margin-top: 10px;
      }

      .notes-section {
        margin-top: 15px;
        border-top: 3px solid #c8b789;
        padding-top: 10px;
      }

      .notes-header {
        background-color: #b7dde9;
        padding: 10px;
        text-align: center;
        font-weight: bold;
        border: 1px solid #ccc;
      }

      .notes-body {
        background-color: #e7f3f8;
        padding: 15px 20px;
        font-size: 15px;
        line-height: 1.8;
        border: 1px solid #ccc;
        border-top: none;
      }

      .notes-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 10px;
        border: 1px solid #ccc;
        background-color: #f3f0d7;
      }

      .notes-footer div {
        padding: 10px;
        font-weight: bold;
        font-size: 15px;
        border-left: 1px solid #ccc;
      }

      .notes-footer div:last-child {
        border-left: none;
      }
        @media print {
          html,
          body {
          zoom: 100%;
          margin: 0;
          padding: 0;
        }

        @page {
          size: A4;
          margin: 10mm; /* مثال لهامش مناسب */
        }
        table,
        tr,
        td {
          page-break-inside: avoid;
        }
      }
    </style>
</head>
<body>
    <div class="container">
      <div class="header">
        <div class="header-logos">
          <img
            src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAKBueIx4ZKCMgoy0qqC+8P//8Nzc8P//////////////////////////////////////////////////////////2wBDAaq0tPDS8P//////////////////////////////////////////////////////////////////////////////wAARCABAAGUDASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAAECA//EAB0QAQEBAAIDAQEAAAAAAAAAAAABEQIhEjFBUWH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/EABURAQEAAAAAAAAAAAAAAAAAAAAB/9oADAMBAAIRAxEAPwDsAAAAbP0YsSjcsozxnbSgAAAAAAAAl5YrCUanKfei3+Jxmpt439gNSz2eW+ozJs1qXQWUBQAAAABKClkqLoGYnjDafQJxk9FkpvZ2ChqaChAAAAtwATV0wwDU1cMBF0MA1NXDAAAAAf/Z"
            alt="Referral Program"
          />
          <div class="header-center-text">
            المملكة العربية السعودية<br />وزارة الصحة<br />برنامج الإحالة
          </div>
          <img
            src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAKBueIx4ZKCMgoy0qqC+8P//8Nzc8P//////////////////////////////////////////////////////////2wBDAaq0tPDS8P//////////////////////////////////////////////////////////////////////////////wAARCAA/AGkDASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAAECA//EACAQAQEAAgIDAQADAAAAAAAAAAABESECMRJRYUEigbH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/EABURAQEAAAAAAAAAAAAAAAAAAAAB/9oADAMBAAIRAxEAPwDsAAAAnnx9lmYx4/y/oSt+fH2suenKcdS/XTjMBFAFAAAAAALcJm/FszMM+E18BfL3EtvckaYurqgTljVmGvKfm2e+0xeO+O4I3m+iX2k5z90uZehVAAAAAAzvAklmDHyAqYiYuFxr8AuN66XqJi7+lmQNX8M96TH+lnf0GhmzbQAAAAJimL7UBMU2oBtMaUBMUxVATFUAAAf/2Q=="
            alt="Ministry of Health"
          />
        </div>
      </div>

      <div class="title"></div>

      <table>
        <tr class="section-title">
          <td colspan="4">بيانات المريض</td>
        </tr>
        <tr>
          <td><strong>اسم المريض:</strong> ${adherentName}</td>
          <td><strong>رقم الإثبات:</strong> ${nationalId}</td>
          <td><strong>الجنسية:</strong> ${nationality || "SAUDI"}</td>
          <td><strong>رقم التواصل:</strong> -</td>
        </tr>

        <tr class="section-title">
          <td colspan="4">بيانات القبول</td>
        </tr>
        <tr>
          <td><strong>رقم الملف الطبي:</strong></td>
          <td><strong>القسم:</strong> ${referralType || ""}</td>
          <td><strong>الطبيب المعالج:</strong> ${requiredSpecialty || ""}</td>
          <td><strong>رقم الغرفة:</strong></td>
        </tr>
        <tr>
          <td><strong>رقم السرير:</strong></td>
          <td><strong>مدة الحجز:</strong></td>
          <td><strong>يوم الموعد:</strong></td>
          <td><strong>وقت الموعد:</strong></td>
        </tr>
        <tr>
          <td colspan="2"><strong>التاريخ الميلادي:</strong> ${requestDate}</td>
          <td colspan="2"><strong>التاريخ الهجري:</strong></td>
        </tr>
      </table>

      <p>
        سعادة مدير مستشفى /
        <strong>${providerSourceName}</strong> المحترم
      </p>
      <p>السلام عليكم ورحمة الله وبركاته،</p>
      <p>
        إشارة لإحالة رقم <strong>${referralId}</strong> بتاريخ
        <strong>${requestDate}</strong> بشأن المريض الموضحة بياناته أعلاه،
      </p>
      <p>
        نفيد سعادتكم بأنه تم قبول المريض حسب ما هو موضح بمعلومات الحجز أعلاه.
        <br />
        يرجى اتخاذ كافة الإجراءات اللازمة لأمانة المريض مع مراعاة النقاط
        المذكورة أعلاه.
      </p>

      <div class="footer">
        <p>وتقبلوا تحياتنا</p>
        <p><strong>TADAWI MEDICAL HOSPITAL</strong></p>
      </div>

      <div class="notes-section">
        <div class="notes-header">ملاحظات مهمة</div>
        <div class="notes-body">
          <ul style="margin: 0; padding-right: 20px">
            <li>
              يلتزم المستشفى المحال استقبال الحالة المحولة عند تحقق الهدف
              الأساسي من العلاج.
            </li>
            <li>الرجاء إحضار أصل هوية المريض عند الحضور للمستشفى.</li>
            <li>
              الرجاء إحضار أصل التقرير الطبي وصور الفحوصات والأشعة عند الحضور
              للمستشفى.
            </li>
            <li>
              عند اختلاف التاريخ الهجري مع التاريخ الميلادي يرجى اعتماد التاريخ
              الميلادي للمرجع.
            </li>
            <li>
              يرجى الالتزام بتاريخ الموعد المحدد ومدة حجز السرير حتى يتم خدمة
              المرضى بالشكل المطلوب.
            </li>
          </ul>
        </div>
        <div class="notes-footer">
          <div>${requestDate}<br />التاريخ</div>
          <div>AMER</div>
          <div>0569157706<br />تلفون قسم التنسيق</div>
        </div>
      </div>
    </div>
  </body>
</html>`;
};

export default generateAcceptanceLetterHtml;
