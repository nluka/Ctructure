import path = require('path');
import TokenArray from '../../lexer/TokenArray';
import { tokenizeFile } from '../../lexer/tokenizeFile';

const filePath = path.join(__dirname, '../../sample_code/command_line_args.c');
const tokenizedfile = tokenizeFile(filePath);

const expectedFormat = `#define _CRT_SECURE_NO_WARNINGS

#include <string.h>
#include <stdio.h>
#include "command_line_args.h"
#include "command_vars.h"
#include "constants.h"
#include "util/are_strings_identical.h"
#include "ui/print.h"
#include "util/terminate.h"

#define TOTAL_OPTIONAL_COMMAND_LINE_ARGUMENT_COUNT 3

extern command_vars_t g_comVars;

typedef enum ArgType {
  Value,
  Flag
} ArgType_t;

typedef struct command_arg_setter_pair {
  const char *fullName;
  const char *shortName;
  union command_var_setter_func {
    void (*forValue)(const void *);
    void (*forFlag)();
  } setter;
  ArgType_t argType;
} command_arg_setter_pair_t;

void process_optional_arguments(int argc, char **argv);
void print_arg(const char *name, const char *value);
bool set_command_var(
  const char *argName,
  const char *argValue,
  const command_arg_setter_pair_t *optionalArgSetterPairs
);

// --no-ansi-colors, -c
void cvar_setter_use_ansi_colors() {
  g_comVars.useAnsiColors = false;
}
// --no-emit, -e
void cvar_setter_emit_image_files() {
  g_comVars.emitImageFiles = false;
}
// --save-event-log, -l
void cvar_setter_event_log_file_pathname(const void *value) {
  strncpy(
    g_comVars.eventLogFilePathname,
    (const char *)value,
    MAX_FILE_PATHNAME_LENGTH
  );
}

void process_command_line_args(const int argc, char **const argv) {
  if (argc < 2) {
    printf_colored(
      TC_RED,
      "%s\\n",
      "Missing simulation file pathname as first argument"
    );
    terminate(EC_MISSING_SIMULATION_FILE, NULL);
  }
  
  strncpy(
    g_comVars.simulationFilePathname,
    argv[1],
    MAX_FILE_PATHNAME_LENGTH
  );
  
  const bool areThereOptionalArguments = argc > 2;
  if (!areThereOptionalArguments) {
    return;
  }
  
  printf("Command Arguments:\\n");
  process_optional_arguments(argc, argv);
  print_horizontal_rule();
}

void process_optional_arguments(const int argc, char **const argv) {
  const command_arg_setter_pair_t optionalCommandArgSetterPairs[
    TOTAL_OPTIONAL_COMMAND_LINE_ARGUMENT_COUNT
  ] = {
    {
      .fullName = "--no-ansi-colors",
      .shortName = "-c",
      .setter = { cvar_setter_use_ansi_colors },
      .argType = Flag
    },
    {
      .fullName = "--no-emit",
      .shortName = "-e",
      .setter = { cvar_setter_emit_image_files },
      .argType = Flag
    },
    {
      .fullName = "--save-event-log",
      .shortName = "-l",
      .setter = { cvar_setter_event_log_file_pathname },
      .argType = Value
    }
  };
  
  size_t unsetOptionalArgCount = 0;
  
  for (int i = 2; i < argc; ++i) {
    const char *argName = strtok(argv[i], "=");
    const char *argValue = strtok(NULL, "\\0");
    
    print_arg(argName, argValue);
    
    const bool wasArgSet = set_command_var(
      argName,
      argValue,
      optionalCommandArgSetterPairs
    );
    if (!wasArgSet) {
      ++unsetOptionalArgCount;
    }
  }
  
  if (unsetOptionalArgCount > 0) {
    terminate(EC_INVALID_ARGUMENT_NAME, NULL);
  }
}

void print_arg(const char *const name, const char *const value) {
  printf("%s", name);
  if (value != NULL) {
    printf(" => %s", value);
  }
  printf("\\n");
}

bool set_command_var(
  const char *const argName,
  const char *const argValue,
  const command_arg_setter_pair_t *const optionalArgSetterPairs
) {
  bool isKnownArg = false,
    isFlag = false;
  
  // loop through each command_arg_setter_pair
  for (size_t i = 0; i < TOTAL_OPTIONAL_COMMAND_LINE_ARGUMENT_COUNT; ++i) {
    const command_arg_setter_pair_t *argSetterPair = &optionalArgSetterPairs[i];
    
    if ( // check if argSetterPair is not for the passed argument
      !are_strings_identical(argName, argSetterPair->fullName) &&
      !are_strings_identical(argName, argSetterPair->shortName)
    ) {
      continue;
    }
    
    isKnownArg = true;
    isFlag = argSetterPair->argType == Flag;
    
    if (!isFlag && argValue == NULL) {
      break;
    }
    
    if (argSetterPair->argType == Value) {
      argSetterPair->setter.forValue(argValue);
    } else {
      argSetterPair->setter.forFlag();
    }
    
    return true;
  }
  
  set_stdout_text_color(TC_YELLOW);
  
  // known arg, but wasn't set because value wasn't provided
  if (isKnownArg && !isFlag) {
    for (size_t i = 0; i < strlen(argName) - 1; ++i) {
      printf(" ");
    }
    printf("^ missing argument value");
  } else { // unknown arg
    printf("^");
    for (size_t i = 1; i < strlen(argName); ++i) {
      printf("~");
    }
    printf(" unknown argument");
  }
  
  printf_colored(TC_DEFAULT, "%s", "\\n");
  
  return false;
}
`;

const testInfoCommandC: [[string, TokenArray], string, string] = [
  tokenizedfile,
  expectedFormat,
  'command_line_args.c',
];

export default testInfoCommandC;
