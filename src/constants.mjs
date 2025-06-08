/*
 *
 * Constants for the application.
 *
 */
export const cwd = process.cwd();

export const waitingPatientsFolderDirectory = `${cwd}/results/waiting-patients`;
export const generatedPdfsPath = `${cwd}/results/patients-generated-pdfs`;
export const receivedResolvedCaptchasPath = `${cwd}/results/resolved-captchas`;
export const receivedRejectedCaptchasPath = `${cwd}/results/rejected-captchas`;
export const COLLECTD_PATIENTS_FILE_NAME = "collectedPatients";
export const COLLECTD_PATIENTS_FULL_FILE_PATH = `${waitingPatientsFolderDirectory}/${COLLECTD_PATIENTS_FILE_NAME}.json`;

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

export const USER_ACTION_TYPES = {
  ACCEPT: "accept",
  REJECT: "reject",
  COLLECT: "collect",
};

export const ALLOWED_MINUTES_TO_REVIEW_PATIENTS = 15;
export const SUBTRACTED_TIME_TO_PROCESS_PATIENT_MS = 15;

export const EFFECTIVE_REVIEW_DURATION_MS =
  ALLOWED_MINUTES_TO_REVIEW_PATIENTS * 60 * 1000 -
  SUBTRACTED_TIME_TO_PROCESS_PATIENT_MS;

export const USER_MESSAGES = {
  alreadyScheduledAccept: "Patient is already scheduled for acceptance.",
  alreadyScheduledReject: "Patient is already scheduled for rejection.",
  scheduleAcceptSuccess: "Patient successfully scheduled for acceptance.",
  scheduleRejectSuccess: "Patient successfully scheduled for rejection.",
  notFound: "Patient does not exist.",
  expired: "Time expired, cannot process patient.",
  canProcess: "Patient can still be processed.",
  cancelSuccess: "Scheduled action canceled successfully.",
  noAction: "No-need, No scheduled action to cancel for this patient.",
};

export const CONFIRMATION_TYPES = {
  ACCEPT: ["accept", "1"],
  REJECT: ["reject", "00"],
  CANCEL: ["cancel", "0"],
};
