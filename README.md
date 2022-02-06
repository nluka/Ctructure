# Ctructure README

Ctructure is an opinionated, [prettier](https://github.com/prettier/prettier)-inspired code formatter for the C programming language. Currently work in progress.

- [Usage](#usage)
  - [Commands](#commands)
    - [formatCurrentFile](#format-current-file)
  - [Directives](#directives)
    - [no-format](#no-format)
  - [Limitations/Caveats](#limitations-caveats)
- [Issues](#issues)
- [Contributing](#contributing)
- [Inner Workings](#inner-workings)
  - [Lexing](#lexing)
  - [Printing](#printing)
  - [File-writing](#file-writing)

## Usage

### Commands

#### formatCurrentFile

Formats the currently active document. To use, [open the command palette](https://www.alphr.com/open-command-vs-code/) and run `Ctructure.formatCurrentFile`.

### Directives

Directives modify formatting behavior. They are declared within a comment, begin with `@ct-` and are case insensitive.

#### no-format

The `@ct-no-format` directive marks a line or section of code to be ignored.
Single-line comment directives (e.g. `// @ct-no-format`) ignore the next line,
2 multi-line comment directives (e.g. `/* @ct-no-format */`) create a section of code to be ignored.

```
// @ct-no-format, ignore next line only
int global=100;

int func_with_ignored_code() {
  int a = 1, b = 2;

  /* @ct-no-format, ignore multiple lines */
  a = (a + b) |
      (a - b) &
      (a * b) ^
      (a / b);
  /* @ct-no-format, end ignored section */

  return a;
}
```

### Limitations/Caveats

- Max supported input file size is 512 MB

## Issues

If you encounter unexpected behavior/failures or just have a suggestion, please create an [issue](https://github.com/nluka/Ctructure/issues). If the issue is a bug, include a copy of the exact file you were trying to format + the error or description of unexpected behavior.

## Contributing

All contributions are welcome.

## Inner Workings

The process of formatting a source file is broken up into 3 major steps.

1. [Lexing](#lexing)
2. [Printing](#printing)
3. [File-writing](#file-writing)

### Lexing

Lexing is the process of parsing the input file and extracting all of its tokens into a data structure, which is then handed off to the printer. In the first stage the input file is scanned sequentially once and tokens are extracted, in the second stage any ambiguous tokens are disambiguated.

The steps for extracting a token:
1. Find the position of the token's first character (`Tokenizer.moveCursorToBeginningOfNextToken`)
2. Based on the token's first character, determine the category of the token (`tokenDetermineCategory`)
3. Based on the position of the token's first character and its category, determine the position of the last character (`tokenFindLastIndex`)
4. Based on the positions of the token's first and last character and its category, determine the specific type (`TokenType`) of the token (`tokenDetermineType`)
  - Some token types cannot be determined on this first pass, so they are marked as ambiguous

Tokens are disambiguated (`tokenDisambiguate`) by looking at the tokens behind and or ahead. Lookaround complexity varies depending on the token.

### Printing

Printing is the process of using the tokens generated by the lexer to create a formatted string.

The printer formats each token based on:
1. **Type** - the printer uses a map (`tokenTypeToValueMap`) for keywords, preprocessors, operators, and special types to get a token's value. When the file must be read to gather its value, the positions of the token's first and last character (`tokenFindLastIndex`) is used to slice its value from the input file.
2. **Context** - set as the printer goes through each token. Context can be set to a `PrinterCategory` or `TokenType`. Each type may have a large or small impact on context, and its formatting may or may not be influenced by context. When there are parentheses, braces, or brackets, context is stored in a `Stack` so that it can be retrieved later.
3. **Overflow** - determined in `checkForLineOverflow`. This is mostly checked for with parentheses, brackets, and arrays. If a line exceeds the set character limit, the line will be broken up at appropriate points.

### File-writing

Once the formatter has created a formatted string, it is used to write over the input file, completing the formatting process.
