/*
 *
 * Patients Store
 *
 */
import EventEmitter from "events";
import writePatientData from "./writePatientData.mjs";
import waitMinutesThenRun from "./waitMinutesThenRun.mjs";
import {
  COLLECTD_PATIENTS_FILE_NAME,
  EFFECTIVE_REVIEW_DURATION_MS,
  USER_MESSAGES,
} from "./constants.mjs";

class PatientStore extends EventEmitter {
  constructor(initialPatients = []) {
    super();
    this.patients = new Set(initialPatients);
    this.patientsById = new Map();
    this.goingPatientsToBeAccepted = new Set();
    this.goingPatientsToBeRejected = new Set();
    this.patientTimers = new Map();

    for (const patient of initialPatients) {
      if (patient) {
        const key = this.keyExtractor(patient);

        if (key) {
          this.patientsById.set(key, patient);
        } else {
          console.warn("Patient missing referralId key:", patient);
        }
      }
    }
  }

  keyExtractor(patient = {}) {
    return patient.referralId;
  }

  async addPatients(patients) {
    const newPatients = Array.isArray(patients) ? patients : [patients];
    const added = [];

    for (const patient of newPatients) {
      const key = this.keyExtractor(patient);
      if (!this.patientsById.has(key)) {
        this.patients.add(patient);
        this.patientsById.set(key, patient);
        added.push(patient);
      }
    }

    if (added.length > 0) {
      const allPatients = this.getAllPatients();
      this.emit("patientsAdded", added);
      await writePatientData(allPatients, COLLECTD_PATIENTS_FILE_NAME);
    }
  }

  findPatientByReferralId(referralId) {
    const patient = this.patientsById.get(referralId);
    return { patient, message: patient ? undefined : USER_MESSAGES.notFound };
  }

  async removePatientByReferralId(referralId) {
    const patient = this.patientsById.get(referralId);
    if (!patient) {
      console.log(
        `🛑 Patient with referralId=${referralId} Not Found to be removed`
      );

      return { success: false, message: USER_MESSAGES.notFound };
    }

    // Remove from patientsById map
    this.patientsById.delete(referralId);

    // Remove patient object from patients set
    this.patients.delete(patient);

    // Remove from acceptance/rejection sets
    this.goingPatientsToBeAccepted.delete(referralId);
    this.goingPatientsToBeRejected.delete(referralId);

    // Cancel and remove any timers
    const timer = this.patientTimers.get(referralId);
    if (timer) {
      timer.cancel();
      this.patientTimers.delete(referralId);
    }

    const allPatients = this.getAllPatients();

    await writePatientData(allPatients, COLLECTD_PATIENTS_FILE_NAME);

    console.log("✅ Patient with referralId=${referralId} just removed:");

    return {
      success: true,
      message: "Patient removed",
    };
  }

  canStillProcessPatient(referralId) {
    const { patient, message } = this.findPatientByReferralId(referralId);
    if (message) {
      return { success: false, message };
    }

    const { startedAt } = patient; // ISO string like "2025-06-08T15:18:00.000Z"
    const now = Date.now(); // current time in ms since epoch (UTC)
    const patientRequestTime = new Date(startedAt).getTime(); // ms since epoch (UTC)

    const elapsedTime = now - patientRequestTime; // ms elapsed since startedAt

    const canProcess = elapsedTime < EFFECTIVE_REVIEW_DURATION_MS;

    return {
      success: canProcess,
      message: canProcess ? USER_MESSAGES.canProcess : USER_MESSAGES.expired,
    };
  }

  schedulePatientAction(actionSet, eventName, patient) {
    const { referralId, startedAt } = patient;

    const timer = waitMinutesThenRun(startedAt, () => {
      actionSet.delete(referralId);
      this.patientTimers.delete(referralId);
      this.emit(eventName, patient);
    });

    actionSet.add(referralId);
    this.patientTimers.set(referralId, timer);
  }

  scheduleAcceptedPatient(referralId) {
    if (this.goingPatientsToBeAccepted.has(referralId)) {
      return { success: false, message: USER_MESSAGES.alreadyScheduledAccept };
    }

    const { patient, message } = this.findPatientByReferralId(referralId);
    if (message) {
      return { success: false, message };
    }

    this.schedulePatientAction(
      this.goingPatientsToBeAccepted,
      "patientAccepted",
      patient
    );
    return { success: true, message: USER_MESSAGES.scheduleAcceptSuccess };
  }

  scheduleRejectedPatient(referralId) {
    if (this.goingPatientsToBeRejected.has(referralId)) {
      return { success: false, message: USER_MESSAGES.alreadyScheduledReject };
    }

    const { patient, message } = this.findPatientByReferralId(referralId);
    if (message) {
      return { success: false, message };
    }

    this.schedulePatientAction(
      this.goingPatientsToBeRejected,
      "patientRejected",
      patient
    );
    return { success: true, message: USER_MESSAGES.scheduleRejectSuccess };
  }

  cancelPatient(referralId) {
    const isAccepted = this.goingPatientsToBeAccepted.has(referralId);
    const isRejected = this.goingPatientsToBeRejected.has(referralId);

    if (!isAccepted && !isRejected) {
      return { success: false, message: USER_MESSAGES.noAction };
    }

    [this.goingPatientsToBeAccepted, this.goingPatientsToBeRejected].forEach(
      (set) => set.delete(referralId)
    );

    const timer = this.patientTimers.get(referralId);

    if (timer) {
      timer.cancel();
      this.patientTimers.delete(referralId);
    }

    this.emit("patientCanceled", { referralId, reason: "manual" });
    return { success: true, message: USER_MESSAGES.cancelSuccess };
  }

  getAllPatients() {
    return Array.from(this.patientsById.values());
  }

  getAllGoingToBeAcceptedPatients() {
    return Array.from(this.goingPatientsToBeAccepted);
  }

  getAllGoingToBeRejectedPatients() {
    return Array.from(this.goingPatientsToBeRejected);
  }

  size() {
    return this.patients.size;
  }

  clear() {
    this.patients.clear();
    this.patientsById.clear();
    this.goingPatientsToBeAccepted.clear();
    this.goingPatientsToBeRejected.clear();

    this.patientTimers.forEach((timer) => timer.cancel());
    this.patientTimers.clear();

    this.emit("cleared");
  }
}

export default PatientStore;
