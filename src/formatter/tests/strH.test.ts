import path = require("path");
import TokenArray from "../../lexer/TokenArray";
import { tokenizeFile } from "../../lexer/tokenizeFile";
import formatFile, { toString } from "../formatter";

describe('formatter', () => {
  function assert(
    tokenizedFile: [string, TokenArray],
    expectedFormat: string,
  ) {
    test(`format file: str.h`, () => {
      const stringed = toString(formatFile(tokenizedFile));
      //console.log(stringed);
      expect(stringed).toBe(expectedFormat);
    });
  }

  {
    const filePath = path.join(__dirname, '../../sample_code/str.h');
    const tokenizedfile = tokenizeFile(filePath);
    assert(tokenizedfile, "#ifndef STR_H\n\
#define STR_H\n\
\n\
#include <stdbool.h>\n\
#include <stdlib.h>\n\
\n\
typedef struct string{\n\
  char *data;\n\
  \n\
  // the number of chars (excluding nul-terminator) stored in `data`\n\
  size_t count;\n\
  \n\
  /*\n\
    the number of chars (excluding nul-terminator)\n\
    that can be stored in `data` without resizing\n\
   */\n\
  size_t availableCount;\n\
} string_t;\n\
\n\
string_t string_create(size_t initialLength);\n\
\n\
bool string_expand(string_t *string, size_t expansionAmount);\n\
\n\
bool string_append_chars(\n\
  string_t *string,\n\
  const char *appendChars,\n\
  size_t appendCharsSize\n\
);\n\
\n\
bool string_append_number(\n\
  string_t *string,\n\
  const char *numberFormat,\n\
  const void *number\n\
);\n\
\n\
void string_destroy(string_t *string);\n\
\n\
#endif // STR_H\n\
");
  }

}
);