import { readFileSync } from "fs";
import tokenizeFile from "../lexer/tokenizeFile";
import printer from "../printer/printer";
import removeCarriageReturns from "../utility/removeCarriageReturns";
import path = require("path");

/**
 * @param fileRelativePathname The file pathname relative to the file containing this function.
 */
export default function assert(
  fileRelativePathname: string,
  expected?: string,
) {
  test(fileRelativePathname, () => {
    const resolvedFilePathname = path.resolve(__dirname, fileRelativePathname);
    const fileContents = removeCarriageReturns(readFileSync(resolvedFilePathname).toString());
    const formatted = (function format() {
      const [fileContents, tokSet] = tokenizeFile(resolvedFilePathname);
      const formatted = printer(fileContents, tokSet, true);
      return formatted;
    })();

    expect(formatted).toBe(expected || fileContents);
  });
}
