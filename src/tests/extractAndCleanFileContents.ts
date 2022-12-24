import { readFileSync } from "fs";
import removeCarriageReturns from "../utility/removeCarriageReturns";

/**
 * Extracts the contents of a file into a string, removing any carriage returns.
 */
export default function extractAndCleanFileContents(filePathname: string) {
  const fileContents = removeCarriageReturns(readFileSync(filePathname).toString());
  return fileContents;
}
