/**
 * ينتظر عدد دقائق من تاريخ إدخال (بصيغة مرنة)، وينفذ asyncAction قبل النهاية بـ 4 ملي ثانية
 * يدعم الإلغاء عبر timer.cancel()
 * @param {string} rawDate - التاريخ بصيغة مثل "2026-06-01 23.47.03.3"
 * @param {() => Promise<any>} asyncAction - دالة async تنفذ قرب الوقت المستهدف
 * @param {number} minutes - عدد الدقائق التي يجب انتظارها
 * @returns {{ cancel: () => void }} - كائن يسمح بإلغاء المؤقت
 */
import convertDateToISO from "./convertDateToISO.mjs";
import { EFFECTIVE_REVIEW_DURATION_MS } from "./constants.mjs";

const waitMinutesThenRun = (rawDate, asyncAction) => {
  const iso = convertDateToISO(rawDate);
  const start = new Date(iso);
  const target = new Date(start.getTime() + EFFECTIVE_REVIEW_DURATION_MS);

  let timeoutId;
  let cancelled = false;

  const delay = target.getTime() - Date.now();

  const cancel = () => {
    cancelled = true;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  if (delay <= 0) {
    const immediateRun = async () => {
      if (cancelled) return;

      try {
        await asyncAction();
      } catch (err) {
        console.error("🛑 خطأ أثناء تنفيذ asyncAction:", err);
      }
    };
    immediateRun();
    return {
      cancel,
    };
  }

  timeoutId = setTimeout(async () => {
    if (cancelled) return;
    try {
      await asyncAction();
    } catch (err) {
      console.error("🛑 خطأ أثناء تنفيذ asyncAction:", err);
    }
  }, delay);

  return {
    cancel,
  };
};

export default waitMinutesThenRun;
