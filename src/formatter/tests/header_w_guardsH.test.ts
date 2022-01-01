import path = require("path");
import TokenArray from "../../lexer/TokenArray";
import { tokenizeFile } from "../../lexer/tokenizeFile";
import formatFile, { toString } from "../formatter";

describe('formatter', () => {
  function assert(
    tokenizedFile: [string, TokenArray],
    expectedFormat: string,
  ) {
    test(`format file: str.c`, () => {
      const stringed = toString(formatFile(tokenizedFile));
      //console.log(stringed);
      expect(stringed).toBe(expectedFormat);
    });
  }

  {
    const filePath = path.join(__dirname, '../../sample_code/header_with_guards.h');
    const tokenizedfile = tokenizeFile(filePath);
    assert(tokenizedfile, "#ifndef HEADER_WITH_GUARDS_H\n\
#define HEADER_WITH_GUARDS_H\n\
\n\
#include <stdbool.h>\n\
\n\
bool func1(void);\n\
_Bool func2();\n\
\n\
#endif // HEADER_WITH_GUARDS_H\n\
");
  }

}
);