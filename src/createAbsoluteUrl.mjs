/*
 *
 * Helper: `createAbsoluteUrl`.
 *
 */
import { URL } from "node:url";

const createAbsoluteUrl = (page, relativePath) =>
  new URL(relativePath, page.url()).toString();

export default createAbsoluteUrl;
