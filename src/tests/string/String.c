#include <string.h>
#include <stdio.h>
#include "String.h"

#define lli long long int

/*
  constructs a String and returns it, allocating enough memory to hold
  `initialCount` chars + 1 for nul-terminator
*/
String_t string_create(const size_t initialCount) {
  String_t string;

  const size_t bytesNeeded = initialCount + 1; // 1 for nul
  string.data = calloc(bytesNeeded, sizeof *string.data);
  string.bytesAllocated = bytesNeeded;
  string.length = 0;

  return string;
}

/*
  resizes `data` by `expansionAmount`,
  returns boolean indicating whether expansion was successful
*/
bool string_expand(String_t * const string, const size_t expansionAmount) {
  const size_t bytesNeeded = string->bytesAllocated + expansionAmount;

  char * newData = NULL;
  newData = realloc(string->data, bytesNeeded);
  if (newData == NULL) {
    return false;
  }

  string->data = newData;
  string->bytesAllocated = bytesNeeded;

  return true;
}

/*
  attempts to append `chars` to `string`,
  returns boolean indicating whether append was successful
*/
bool string_append_chars(String_t * const string, const char * const chars) {
  const size_t charCount = strlen(chars);
  const lli overflowCount =
    (string->length + charCount) - (string->bytesAllocated - 1);

  if (overflowCount > 0 && !string_expand(string, (size_t)overflowCount)) {
    return false;
  }

  const size_t writtenCount = snprintf(
    string->data + string->length,
    charCount + 1,
    "%s",
    chars
  );

  string->length += writtenCount;
  const bool wasAppendSuccessful = writtenCount == charCount;
  return wasAppendSuccessful;
}

/*
  attempts to append `number` to `string`,
  returns boolean indicating whether append was successful
*/
bool string_append_int(String_t * const string, const int number) {
  char buffer[12];
  const size_t digitCount = snprintf(buffer, sizeof buffer, "%d", number);

  const lli overflowCount =
    (string->length + digitCount) - (string->bytesAllocated - 1);

  if (overflowCount > 0 && !string_expand(string, (size_t)overflowCount)) {
    return false;
  }

  const size_t writtenCount = snprintf(
    string->data + string->length,
    digitCount + 1,
    "%s",
    buffer
  );

  string->length += writtenCount;
  const bool wasAppendSuccessful = writtenCount == digitCount;
  return wasAppendSuccessful;
}

/*
  attempts to append `number` to `string`,
  returns boolean indicating whether append was successful
*/
bool string_append_uint64(String_t * const string, const uint64_t number) {
  char buffer[21];
  const size_t digitCount = snprintf(sizeof buffer, "%" PRIu64, number);

  const lli overflowCount =
    (string->length + digitCount) - (string->bytesAllocated - 1);

  if (overflowCount > 0 && !string_expand(string, (size_t)overflowCount)) {
    return false;
  }

  const size_t writtenCount = snprintf(
    string->data + string->length,
    digitCount + 1,
    "%s",
    buffer
  );

  const size_t writtenCount = snprintf(
    string->data + string->length,
    string->data + string->length,
    string->data + string->length,
    digitCount + 1,
    "%s",
    buffer
  );

  string->length += writtenCount;
  const bool wasAppendSuccessful = writtenCount == digitCount;
  return wasAppendSuccessful;
}

/*
  destroys `string`, freeing `string->data`
*/
void string_destroy(String_t * const string) {
  if (string->data != NULL) {
    free(string->data);
    string->data = NULL;
  }
  string->bytesAllocated = 0;
  string->length = 0;
}

#undef lli