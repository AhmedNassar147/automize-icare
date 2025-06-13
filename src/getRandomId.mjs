/*
 *
 * helepr: `getRandomId`
 *
 */
import { randomBytes } from "crypto";

const getRandomId = (size = 8) => randomBytes(size).toString("hex");

export default getRandomId;
