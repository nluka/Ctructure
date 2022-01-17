#ifndef STRING_H
#define STRING_H

#include <stdbool.h>
#include <stdlib.h>
#include <inttypes.h>

typedef struct String {
  char * data;
  // the number of bytes allocated for `data`
  size_t bytesAllocated;
  // the number of chars (excluding nul-terminator) stored in `data`
  size_t length;
} String_t;

String_t string_create(size_t initialLength);
bool string_expand(String_t * string, size_t expansionAmount);
bool string_append_chars(String_t * string, const char * chars);
bool string_append_int(String_t * string, int number);
bool string_append_uint64(String_t * string, uint64_t number);
void string_destroy(String_t * string);

#endif // STRING_H