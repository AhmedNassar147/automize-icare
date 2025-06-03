/*
 *
 * Patients Store
 *
 */
import EventEmitter from "events";
import writePatientData from "./writePatientData.mjs";
import waitMinutesThenRun from "./waitMinutesThenRun.mjs";
import convertDateToISO from "./convertDateToISO.mjs";
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
    this._isCollecting = false;
    this.shouldAutoCollect = false;

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
      this.emit("patientsAdded", added, allPatients);
      await writePatientData(allPatients, COLLECTD_PATIENTS_FILE_NAME);
    }
  }

  startCollectingPatients() {
    if (this._isCollecting) {
      this.shouldAutoCollect = true;
      return;
    }
    this._isCollecting = true;
    this.emit("collectPatients");
  }

  finishCollecting() {
    this._isCollecting = false;
    if (this.shouldAutoCollect) {
      this.shouldAutoCollect = false;
      this.startCollectingPatients();
    }
  }

  findPatientByReferralId(referralId) {
    const patient = this.patientsById.get(referralId);
    return { patient, message: patient ? undefined : USER_MESSAGES.notFound };
  }

  canStillProcessPatient(referralId) {
    const { patient, message } = this.findPatientByReferralId(referralId);
    if (message) {
      return { success: false, message };
    }

    const { requestedDate } = patient;
    const now = Date.now();
    const patientRequestTime = new Date(
      convertDateToISO(requestedDate)
    ).getTime();
    const elapsedTime = now - patientRequestTime;

    const canProcess = elapsedTime < EFFECTIVE_REVIEW_DURATION_MS;
    return {
      success: canProcess,
      message: canProcess ? USER_MESSAGES.canProcess : USER_MESSAGES.expired,
    };
  }

  schedulePatientAction(actionSet, eventName, patient) {
    const { referralId, requestedDate } = patient;

    const timer = waitMinutesThenRun(requestedDate, () => {
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
