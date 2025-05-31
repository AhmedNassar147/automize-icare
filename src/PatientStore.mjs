/*
 *
 * Patients Store
 *
 */
import EventEmitter from "events";

class PatientStore extends EventEmitter {
  constructor() {
    super();
    this.patients = new Set(); // Store unique patient objects
    this.knownKeys = new Set(); // Used for fast deduplication
    this._isCollecting = false;
    this.shouldAutoCollect = false;
  }

  keyExtractor(patient) {
    return patient.referralId;
  }

  // Add one or more patients
  addPatients(patients) {
    const newPatients = Array.isArray(patients) ? patients : [patients];

    const actuallyAdded = [];

    for (const patient of newPatients) {
      const key = this.keyExtractor(patient);
      if (!this.knownKeys.has(key)) {
        this.patients.add(patient);
        this.knownKeys.add(key);
        actuallyAdded.push(patient);
      }
    }

    if (actuallyAdded.length > 0) {
      this.emit("patientAdded", actuallyAdded, this.getAllPatients());
    }
  }

  startCollectingPatients() {
    if (this._isCollecting) {
      this.shouldAutoCollect = true;
      return;
    }
    this._isCollecting = true;
    this.emit("startCollectingPatients");
  }

  finishCollecting() {
    this._isCollecting = false;

    if (this.shouldAutoCollect) {
      this.shouldAutoCollect = false;
      this.startCollectingPatients();
    }
  }

  // Return all patients as an array
  getAllPatients() {
    return Array.from(this.patients);
  }

  size() {
    return this.patients.size;
  }

  clear() {
    this.patients.clear();
    this.knownKeys.clear();
    this.emit("cleared");
  }
}

export default PatientStore;
