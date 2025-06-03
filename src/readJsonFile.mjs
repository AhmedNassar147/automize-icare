/*
 *
 * Helper: `readJsonFile`.
 *
 */
import { readFile } from "fs/promises";
import checkPathExists from "./checkPathExists.mjs";

const readJsonFile = async (jsonFilePath, parse) =>
  new Promise(async (resolve) => {
    const isFileExists = await checkPathExists(jsonFilePath);

    if (!isFileExists) {
      return resolve(undefined);
    }

    const jsonFileData = await readFile(jsonFilePath, {
      encoding: "utf8",
    });

    resolve(parse && jsonFileData ? JSON.parse(jsonFileData) : jsonFileData);
  });

export default readJsonFile;
