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
        debugLogFormatResult(formatResult.formatted);
      }

      expect(formatResult).toBe(expected !== undefined ? expected : fileContents);
    });
  }

  function extractFileContentsIntoString(fileRelativePathname: string) {
    const resolvedFilePathname = path.resolve(__dirname, fileRelativePathname);
    const fileContents = removeCarriageReturns(readFileSync(resolvedFilePathname).toString());
    return fileContents;
  }

  assert('./ant_simulator_lite/command_line.c');
  assert('./ant_simulator_lite/print.c');
  assert('./ant_simulator_lite/print.h');
  assert('./ant_simulator_lite/Timespan.c');

  {
    const helloWorldFormatted =
      extractFileContentsIntoString('./hello_world/hello_world_formatted.c');
    assert('./hello_world/hello_world_minified.c', helloWorldFormatted);
    assert('./hello_world/hello_world_expanded.c', helloWorldFormatted);
  }

  assert('./string/String.c');
  assert('./string/String.h');

  assert('./asterisks.c');
  assert('./empty_header.h');
});
