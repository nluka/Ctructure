import { readFileSync } from 'fs';
import format from '../format';
import removeCarriageReturns from '../utility/removeCarriageReturns';
import path = require('path');

export default function assert(
  filePathname: string,
  shouldConsoleLogFormatResult = false,
) {
  test(filePathname, () => {
    const resolvedFilePathname = path.resolve(__dirname, filePathname);
    const fileContents = removeCarriageReturns(readFileSync(resolvedFilePathname).toString());
    const formatResult = format(resolvedFilePathname);
    if (shouldConsoleLogFormatResult) {
      console.log(formatResult);
    }
    expect(formatResult).toBe(fileContents);
  });
}
