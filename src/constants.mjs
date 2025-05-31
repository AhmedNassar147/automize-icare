/*
 *
 * Constants for the application.
 *
 */
export const cwd = process.cwd();

export const waitingPatientsFolderDirectory = `${cwd}/results/waiting-patients`;
export const patientsGeneratedPdfsFolderDirectory = `${cwd}/results/patients-generated-pdfs`;
export const configFilePath = `${cwd}/config.json`;

export const PATIENT_SECTIONS_STATUS = {
  WAITING: {
    countFieldSelector: "spfnc_waiting_confirmation_referral",
    pupultaeFnText: "fnc_waiting_confirmation_referral",
    foundCountText: "waiting confirmation referrals",
    noCountText: "No waiting confirmation referrals found",
  },
  CONFIRMED: {
    countFieldSelector: "spfnc_confirmed_referral_requests",
    pupultaeFnText: "fnc_confirmed_referral_requests",
    foundCountText: "confirmed referrals requests",
    noCountText: "No confirmed referrals requests found",
  },
};
