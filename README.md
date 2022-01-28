# Ctructure README

Ctructure is an opinionated, [prettier](https://github.com/prettier/prettier)-inspired code formatter for the C programming language. Currently work in progress.

- [Limitations/Caveats](#limitations-caveats)
- [Issues](#issues)
- [Contributing](#contributing)
- [Inner Workings](#inner-workings)
  - [Lexing](#lexing)
  - [Printing](#printing)
  - [File-writing](#file-writing)

## Usage

Will be added once extension is released.

## Limitations/Caveats

- Max supported input file size is 512 MB
- Bit field ':' requires at least 1 leading whitespace in order to be formatted correctly (e.g. `int a : 3`)

## Issues

If you encounter unexpected behavior or failures, please create an [issue](https://github.com/nluka/Ctructure/issues). Include a copy of the exact file you were trying to format + the error / description of unexpected behavior.

## Contributing

All contributions are welcome.

## Inner Workings

The process of formatting a source file is broken up into 3 major steps.

1. [Lexing](#lexing)
2. [Printing](#printing)
3. [File-writing](#file-writing)

### Lexing

Lexing is the process of parsing the input file and extracting all of its tokens into a data structure, which is then handed off to the `printer`. The process of extracting tokens is detailed below.

For each token:
1. Find the position of the token's first character (`Tokenizer.moveCursorToBeginningOfNextToken`)
2. Based on the token's first character and the type of token that preceeded it, determine the category of the token (`tokenDetermineCategory`)
3. Based on the position of the token's first character and its category, determine the position of the last character (`tokenFindLastIndex`)
4. Based on the positions of the token's first and last character and its category, determine the specific type (`TokenType`) of the token (`tokenDetermineType`)
  - Some token types cannot be determined on the first pass, so they are marked as ambiguous and disambiguated at a later pass

Once the pass described above is finished, a second pass is done to disambiguate any ambiguous tokens (`tokenDisambiguate`).

### Printing

Printing is the process of using data that the `lexer` has handed off to create a formatted string, which is then used in the `file-writting` process.

The printer formats each token based on the following:
1. Type. The printer uses a map (`tokenTypeToValueMap`) for keywords, preprocessors, operators, and special types to get the tokens 'value'. When the file must be read to gather its value, the token's start index and the token's last index (`tokenFindLastIndex`) is used to slice it's value from the file's contents.
2. Context. Context is set as the printer goes through each token's type. Context can be set to a `PrinterCategory` or to a `TokenType`. Each type may have a large or small impact on context, and it's formatting may be influenced heavily or not at all by context. When there are parentheses, braces, or brackets, context is stored in a `Stack` so that it can be retrieved later.
3. Overflow. Overflow is determined in `checkForLineOverflow`. This is mostly checked for with parentheses, brackets, and arrays. If a line exceeds the set character limit, the line will be broken up at appropriate points.

### File-writing

Once a formatted string has been created by the `printer`, it is used to override the input file and thus the formatted process is complete.
