/*
 *
 * Helper: `writePatientData`.
 *
 */
import { writeFile } from "fs/promises";
import getDateBasedTimezone from "./getDateBasedTimezone.mjs";
import { waitingPatientsFolderDirectory } from "./constants.mjs";

const writePatientData = async (data, extraFileName) => {
  const { dateString, time } = getDateBasedTimezone();

  const currentDateTime = time.replace(/:/g, ".");

  let fileName = `${dateString}-${currentDateTime}`;

  if (extraFileName) {
    fileName = `${extraFileName}-${fileName}`;
  }

  const patientsDataFile = `${waitingPatientsFolderDirectory}/${fileName}.json`;

  await writeFile(patientsDataFile, JSON.stringify(data, null, 2));
};

export default writePatientData;
