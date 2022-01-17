import { readFileSync } from 'fs';
import debugLogFormatResult from '../debugLogFormatResult';
import format from '../format';
import removeCarriageReturns from '../utility/removeCarriageReturns';
import path = require('path');

describe('format', () => {
  function assert(
    fileRelativePathname: string,
    expected?: string,
    shouldConsoleLogFormatResult = false,
  ) {
    test(fileRelativePathname, () => {
      const resolvedFilePathname = path.resolve(__dirname, fileRelativePathname);
      const fileContents = removeCarriageReturns(readFileSync(resolvedFilePathname).toString());
      const formatResult = format(resolvedFilePathname);

      if (shouldConsoleLogFormatResult) {
        debugLogFormatResult(formatResult);
      }

      expect(formatResult).toBe(expected || fileContents);
    });
  }

  assert('./ant_simulator_lite/command_line.c');
  assert('./ant_simulator_lite/Timespan.c');
  assert('./string/String.c');
  assert('./string/String.h');
  assert('./asterisks.c');
  assert('./empty_header.h');
});
