import path = require('path');
import assert from '../assert';
import extractAndCleanFileContents from '../extractAndCleanFileContents';

describe('formatBasic', () => {
  const _assert = (filePathname: string, expected?: string): void =>
    assert(`./format_basic/${filePathname}`, expected);

  {
    _assert('ant_simulator_lite/ant.txt');
    _assert('ant_simulator_lite/command_line.txt');
    _assert('ant_simulator_lite/print.txt');
    _assert('ant_simulator_lite/print.h');
    _assert('ant_simulator_lite/Timespan.txt');
  }

  {
    const helloWorldFormatted =
      extractAndCleanFileContents(path.resolve(__dirname, './hello_world/hello_world_formatted.txt'));
    _assert('hello_world/hello_world_minified.txt', helloWorldFormatted);
    _assert('hello_world/hello_world_expanded.txt', helloWorldFormatted);
  }

  {
    _assert('string/String.txt');
    _assert('string/String.h');
  }

  {
    const cleanedTokens =
      extractAndCleanFileContents(path.resolve(__dirname, './token_cleaning/cleaned_tokens.txt'));
    _assert('token_cleaning/uncleaned_tokens.txt', cleanedTokens);
  }

  _assert('__attribute__.txt');
  _assert('asterisk.txt');
  _assert('comment.txt');
  _assert('empty_header.h');
  _assert('for.txt');
  _assert('hellish.txt');
  _assert('if_else.txt');
  _assert('label.txt');
  _assert('linux_macro_comment.txt');
  _assert('misc.txt');
  _assert('multivar_decl.txt');
  _assert('no_format.txt');
  _assert('prepro.txt');
  _assert('struct.txt');
  _assert('switch.txt');
});
