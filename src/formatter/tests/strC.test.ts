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

  const filePath = path.join(__dirname, '../../sample_code/str.c');
  const tokenizedfile = tokenizeFile(filePath);
  assert(tokenizedfile, 
"#include <string.h>\n\
#include <stdio.h>\n\
#include \"str.h\"\n\
\n\
/*\n\
  constructs a string and returns it, allocating enough memory to hold\n\
  `initialCount` chars (`initialCount` does not include nul-terminator)\n\
*/\n\
string_t string_create(const size_t initialCount) {\n\
  string_t string;\n\
  \n\
  if (initialCount == 0) {\n\
    string.data = NULL;\n\
    string.availableCount = 0;\n\
  } else {\n\
    string.data = calloc(initialCount + 1, sizef(char));\n\
    string.availableCount = string.data == NULL ? 0 : initialCount;\n\
  }\n\
  string.count = 0;\n\
  \n\
  return string;\n\
}\n\
\n\
/*\n\
  resizes `data` by `expansionAmount`, returns boolean indicating whether\n\
  expansion was successful\n\
*/\n\
bool string_expand(string_t *const string, const size_t expansionAmount) {\n\
  const size_t newAvailableCount = string->availableCount + expansionAmount;\n\
  \n\
  string->data = realloc(string->data, newAvailableCount + 1);\n\
  if (string->data == NULL) {\n\
    return false;\n\
  }\n\
  \n\
  // zero-init new chars\n\
  memset(string->data + string->availableCount, 0, expansionAmount);\n\
  string->availableCount = newAvailableCount;\n\
  return true;\n\
}\n\
\n\
/*\n\
  attempts to append `charCount` characters from `chars` to `string`,\n\
  returns boolean indicating whether append was successful\n\
*/\n\
bool string_append_chars(\n\
  string_t *const string,\n\
  const char *const chars,\n\
  const size_t charCount\n\
) {\n\
  const long long int overflowCount = (string->count + charCount) - string->availableCount;\n\
  if (overflowCount > 0 && !string_expand(string, overflowCount)) {\n\
    return false;\n\
  }\n\
  \n\
  const bool wasAppendSuccessful = snprintf(\n\
    string->data + string->count,\n\
    charCount + 1,\n\
    \"%s\",\n\
    chars\n\
  ) > 0;\n\
  \n\
  if (wasAppendSuccessful) {\n\
    string->count += charCount;\n\
  }\n\
  return wasAppendSuccessful;\n\
}\n\
\n\
/*\n\
  destroys `string`, freeing `string->data`\n\
*/\n\
void string_destroy(string_t *const string) {\n\
  free(string->data);\n\
  string->data = NULL;\n\
  string->count = 0;\n\
  string->availableCount = 0;\n\
}\n\
");

}
);

