import { readFileSync } from 'fs';
import debugLogFormatResult from '../debugLogFormatResult';
import format from '../format';
import removeCarriageReturns from '../utility/removeCarriageReturns';
import path = require('path');

describe('format', () => {
  function assert(
    filePathname: string,
    shouldConsoleLogFormatResult = false,
  ) {
    test(filePathname, () => {
      const resolvedFilePathname = path.resolve(__dirname, filePathname);
      const fileContents = removeCarriageReturns(readFileSync(resolvedFilePathname).toString());
      const formatResult = format(resolvedFilePathname);
      if (shouldConsoleLogFormatResult) {
        debugLogFormatResult(formatResult);
      }
      expect(formatResult).toBe(fileContents);
    });
  }

  assert('./asterisks/asterisks.c');
  assert('./empty_header/empty_header.h');
  assert('./ant_simulator_lite/command_line/command_line.c');
  assert('./ant_simulator_lite/timespan/timespan.c');
});
