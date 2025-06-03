/*
 *
 * Helper: convertDateToISO.
 *
 */
const convertDateToISO = (dateStr) => {
  const pad = (n) => n.toString().padStart(2, "0");

  const padMilliseconds = (ms) => ms.toString().padEnd(3, "0").slice(0, 3);

  const [datePart, timePart] = dateStr.trim().split(" ");
  const [h, m, s = "0", ms = "0"] = timePart.split(".");

  const hh = pad(h);
  const mm = pad(m);
  const ss = pad(s);
  const mss = padMilliseconds(ms);

  return `${datePart}T${hh}:${mm}:${ss}.${mss}`;
};

export default convertDateToISO;
