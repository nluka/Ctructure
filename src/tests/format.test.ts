import { readFileSync } from 'fs';
import { debugLogFormatResult } from '../debugLog';
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
      const formatted = format(resolvedFilePathname, true);

      if (shouldConsoleLogFormatResult) {
        debugLogFormatResult(formatted);
      }

      expect(formatted).toBe(expected !== undefined ? expected : fileContents);
    });
  }

  function extractFileContentsIntoString(fileRelativePathname: string) {
    const resolvedFilePathname = path.resolve(__dirname, fileRelativePathname);
    const fileContents = removeCarriageReturns(readFileSync(resolvedFilePathname).toString());
    return fileContents;
  }

  {
    assert('./ant_simulator_lite/ant.c');
    assert('./ant_simulator_lite/command_line.c');
    assert('./ant_simulator_lite/print.c');
    assert('./ant_simulator_lite/print.h');
    assert('./ant_simulator_lite/Timespan.c');
  }

  {
    const helloWorldFormatted =
      extractFileContentsIntoString('./hello_world/hello_world_formatted.c');
    assert('./hello_world/hello_world_minified.c', helloWorldFormatted);
    assert('./hello_world/hello_world_expanded.c', helloWorldFormatted);
  }

  {
    assert('./string/String.c');
    assert('./string/String.h');
  }

  assert('./__attribute__.c');
  assert('./asterisks.c');
  assert('./comments.c');
  assert('./empty_func_call.c');
  assert('./empty_header.h');
  assert('./for.c');
  assert('./func_pointers.h');
  assert('./if_else.c');
  assert('./misc.c');
  assert('./multivar_decls.c');
  assert('./prepro.c');
  assert('./struct.c');
  assert('./switch.c');
});
