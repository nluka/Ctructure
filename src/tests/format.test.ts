import { readFileSync } from 'fs';
import tokenizeFile from '../lexer/tokenizeFile';
import printer from '../printer/printer';
import removeCarriageReturns from '../utility/removeCarriageReturns';
import path = require('path');

describe('format', () => {
  function assert(
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
  assert('./asterisk.c');
  assert('./comment.c');
  assert('./empty_header.h');
  assert('./for.c');
  assert('./if_else.c');
  assert('./label.c');
  assert('./misc.c');
  assert('./multivar_decl.c');
  assert('./no_format.c');
  assert('./prepro.c');
  assert('./struct.c');
  assert('./switch.c');
});
