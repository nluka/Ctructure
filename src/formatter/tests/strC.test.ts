import path = require('path');
import { tokenizeFile } from '../../lexer/tokenizeFile';
import assert from './assert';

const filePath = path.join(__dirname, '../../sample_code/str.c');
const tokenizedfile = tokenizeFile(filePath);

const expectedFormat = `#include <string.h>
#include <stdio.h>
#include \"str.h\"

/*
  constructs a string and returns it, allocating enough memory to hold
  \`initialCount\` chars (\`initialCount\` does not include nul-terminator)
*/
string_t string_create(const size_t initialCount) {
  string_t string;
  
  if (initialCount == 0) {
    string.data = NULL;
    string.availableCount = 0;
  } else {
    string.data = calloc(initialCount + 1, sizef(char));
    string.availableCount = string.data == NULL ? 0 : initialCount;
  }
  string.count = 0;
  
  return string;
}

/*
  resizes \`data\` by \`expansionAmount\`, returns boolean indicating whether
  expansion was successful
*/
bool string_expand(string_t *const string, const size_t expansionAmount) {
  const size_t newAvailableCount = string->availableCount + expansionAmount;
  
  string->data = realloc(string->data, newAvailableCount + 1);
  if (string->data == NULL) {
    return false;
  }
  
  // zero-init new chars
  memset(string->data + string->availableCount, 0, expansionAmount);
  string->availableCount = newAvailableCount;
  return true;
}

/*
  attempts to append \`charCount\` characters from \`chars\` to \`string\`,
  returns boolean indicating whether append was successful
*/
bool string_append_chars(
  string_t *const string,
  const char *const chars,
  const size_t charCount
) {
  const long long int overflowCount = (string->count + charCount) - string->availableCount;
  if (overflowCount > 0 && !string_expand(string, overflowCount)) {
    return false;
  }
  
  const bool wasAppendSuccessful = snprintf(
    string->data + string->count,
    charCount + 1,
    \"%s\",
    chars
  ) > 0;
  
  if (wasAppendSuccessful) {
    string->count += charCount;
  }
  return wasAppendSuccessful;
}

/*
  destroys \`string\`, freeing \`string->data\`
*/
void string_destroy(string_t *const string) {
  free(string->data);
  string->data = NULL;
  string->count = 0;
  string->availableCount = 0;
}
`;

assert(tokenizedfile, expectedFormat, 'str.c');
