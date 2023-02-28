import path = require('path');
import assert from '../assert';
import extractAndCleanFileContents from '../extractAndCleanFileContents';

describe('formatBasic', () => {
  const _assert = (filePathname: string, expected?: string): void =>
    assert(`./format_basic/${filePathname}`, expected);

  {
    _assert('ant_simulator_lite/ant.c');
    _assert('ant_simulator_lite/command_line.c');
    _assert('ant_simulator_lite/print.c');
    _assert('ant_simulator_lite/print.h');
    _assert('ant_simulator_lite/Timespan.c');
  }

  {
    const helloWorldFormatted =
      extractAndCleanFileContents(path.resolve(__dirname, './hello_world/hello_world_formatted.c'));
    _assert('hello_world/hello_world_minified.c', helloWorldFormatted);
    _assert('hello_world/hello_world_expanded.c', helloWorldFormatted);
  }

  {
    _assert('string/String.c');
    _assert('string/String.h');
  }

  {
    const cleanedTokens =
      extractAndCleanFileContents(path.resolve(__dirname, './token_cleaning/cleaned_tokens.c'));
    _assert('token_cleaning/uncleaned_tokens.c', cleanedTokens);
  }

  _assert('__attribute__.c');
  _assert('asterisk.c');
  _assert('comment.c');
  _assert('c.c');
  _assert('empty_header.h');
  _assert('for.c');
  _assert('if_else.c');
  _assert('label.c');
  _assert('misc.c');
  _assert('multivar_decl.c');
  _assert('no_format.c');
  _assert('prepro.c');
  _assert('struct.c');
  _assert('switch.c');
});
