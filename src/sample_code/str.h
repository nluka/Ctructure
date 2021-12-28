#ifndef STR_H
#define STR_H

#include <stdbool.h>
#include <stdlib.h>

typedef struct string {
  char *data;

  // the number of chars (excluding nul-terminator) stored in `data`
  size_t count;

  /*
    the number of chars (excluding nul-terminator)
    that can be stored in `data` without resizing
   */
  size_t availableCount;
} string_t;

string_t string_create(size_t initialLength);

bool string_expand(string_t *string, size_t expansionAmount);

bool string_append_chars(
  string_t *string,
  const char *appendChars,
  size_t appendCharsSize
);

bool string_append_number(
  string_t *string,
  const char *numberFormat,
  const void *number
);

void string_destroy(string_t *string);

#endif // STR_H
