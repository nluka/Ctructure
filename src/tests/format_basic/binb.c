// 1. simple control flow: no goto or recursion
// 2. limit all loops
// 3. don't use the heap
// 4. limit function size (<= 60 lines)
// 5. practice data hiding
// 6. check return values
// 7. limit the preprocessor
// 8. restrict pointer use (one deref per line, no function pointers)
// 9. compile with all warnings and pedantic

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <stdbool.h>

// long long parse_count(char const *count_str, char *err_out) {
//    // validate that <count> is:
//    // - not not empty ("")
//    // - not zero
//    // - purely digits (0-9)
//    {
//       if (strlen(count_str) == 0) {
//          err_out = "empty (\"\")";
//          return 0;
//       }

//       bool has_non_zero_digit = false;
//       bool has_non_digit = false;

//       for (size_t i = 0; i < strlen(count_str); ++i) {
//          char ch = count_str[i];

//          if (ch < '0' || ch > '9') {
//             has_non_digit = true;
//             break;
//          }

//          if (ch != '0') {
//             has_non_zero_digit = true;
//             break;
//          }
//       }

//       if (has_non_digit) {
//          err_out = "has non-digit characters";
//          return 0;
//       }
//       if (!has_non_zero_digit) {
//          err_out = "cannot be 0";
//          return 0;
//       }
//    }

//    long long count = atoll(count_str);

//    if (count < 0) {
//       err_out = "cannot be negative";
//       return 0;
//    }

//    return count;
// }

int main(int argc, char const *argv[]) {
  if (argc == 2 && strcmp(argv[1], "help") == 0) {
    (void)printf(
      "data type | examples\n"
      "byte      | 00000000, 1110'0011\n"
    );
  }

  if (argc != 4) {
    (void)printf(
      "Usage: binb <file> <data_type> <data>\n"
      "       binb help\n"
    );
    return 1;
  }

  char const *file_path_str = argv[1];
  // char const *count_str = argv[2];
  char const *data_type_str = argv[2];
  char const *data_str = argv[3];

  FILE *file = fopen(file_path_str, "ab");
  if (file == NULL) {
    (void)fprintf(stderr, "failed to open <file> '%s'\n", file_path_str);
    return 1;
  }

  char *err = NULL;

  // long long count = parse_count(count_str, err);

  if (err != NULL) {
    (void)fprintf(stderr, "invalid <count>: %s\n", err);
    return 1;
  }

  if (strcmp(data_type_str, "byte") == 0) {
    size_t data_str_len = strlen(data_str);

    {
      size_t num_bits = 0;
      for (size_t i = 0; i < data_str_len; ++i) {
        if (data_str[i] == '0' || data_str[i] == '1') {
          ++num_bits;
        }
      }

      if (num_bits != 8) {
        (void)fprintf(stderr, "invalid <data>: must be 8 bits\n");
        return 1;
      }
    }

    unsigned char byte = 0;

    for (size_t i = 0; i < data_str_len; ++i) {
      if (data_str[i] != '0' && data_str[i] != '1') {
        continue; // skip separators
      }

      byte <<= 1;
      if (data_str[i] == '1') {
        byte |= 1;
      }
    }

    size_t written = fwrite(&byte, sizeof (byte), 1, file);
    if (written != 1) {
      (void)fprintf(stderr, "failed to write byte\n");
      return 1;
    }
  } else {
    (void)fprintf(stderr, "unknown <data_type>\n");
    return 1;
  }

  return 0;
}
