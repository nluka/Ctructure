#define _CRT_SECURE_NO_WARNINGS

#include <string.h>
#include <stdio.h>
#include <stdbool.h>

#define EC_MISSING_SIMULATION_FILE 0
#define TC_RED 0
#define EC_SUCCESS 0
#define EC_UNKNOWN_ARGUMENT 0
#define EC_ARGUMENT_MISSING_VALUE 0

typedef struct String {
  char *data;
  // the number of bytes allocated for `data`
  size_t bytesAllocated;
  // the number of chars (excluding nul-terminator) stored in `data`
  size_t length;
} String_t;

typedef struct CommandVars {
  bool outputImageFiles;
  String_t simulationFilePathname;
  String_t imageFileOutputPath;
  String_t eventLogFilePathname;
} CommandVars_t;

// command variables
CommandVars_t g_comVars;

void validate_next_arg(const char *argName, int argIndex, int argc);

void process_command_line_args(const int argc, char **const argv) {
  if (argc < 2) {
    printfc(TC_RED, "%s\n", "Missing simulation file pathname as first argument");
    end(EC_MISSING_SIMULATION_FILE, NULL);
  }

  if (are_strings_identical(argv[1], "--version")) {
    printf("Version 4.0.0\n");
    end(EC_SUCCESS, NULL);
  }

  string_append_chars(&g_comVars.simulationFilePathname, argv[1]);
  string_fix_file_separators(&g_comVars.simulationFilePathname);

  // process optional arguments
  for (int i = 2; i < argc; ++i) {
    const char *const argName = argv[i];

    if (
      are_strings_identical(argName, "-e") ||
      are_strings_identical(argName, "--no-emit")
    ) {
      g_comVars.outputImageFiles = false;
    } else if (
      are_strings_identical(argName, "-l") ||
      are_strings_identical(argName, "--save-event-log")
    ) {
      validate_next_arg(argName, i, argc);
      string_append_chars(&g_comVars.eventLogFilePathname, argv[i + 1]);
      string_fix_file_separators(&g_comVars.eventLogFilePathname);
      ++i; // skip next arg since it is a value rather than a name
    } else if (
      are_strings_identical(argName, "-o") ||
      are_strings_identical(argName, "--image-output-path")
    ) {
      validate_next_arg(argName, i, argc);
      string_append_chars(&g_comVars.imageFileOutputPath, argv[i + 1]);
      const char *fileSeparator =
        string_fix_file_separators(&g_comVars.imageFileOutputPath);
      if (
        !string_is_last_char(
          &g_comVars.imageFileOutputPath,
          fileSeparator[0]
        )
      ) {
        string_append_chars(&g_comVars.imageFileOutputPath, fileSeparator);
      }
      ++i; // skip next arg since it is a value rather than a name
    } else {
      printfc(TC_RED, "Unknown argument '%s'\n", argName);
      end(EC_UNKNOWN_ARGUMENT, NULL);
    }
  }
}

void validate_next_arg(const char *argName, int argIndex, int argc) {
  if (argIndex >= argc - 1) {
    printfc(TC_RED, "Missing value for argument '%s'\n", argName);
    end(EC_ARGUMENT_MISSING_VALUE, NULL);
  }
}
