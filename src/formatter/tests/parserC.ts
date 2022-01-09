import path = require('path');
import TokenArray from '../../lexer/TokenArray';
import { tokenizeFile } from '../../lexer/tokenizeFile';

const filePath = path.join(__dirname, '../../sample_code/parser.c');
const tokenizedfile = tokenizeFile(filePath);

const expectedFormat = `#define _CRT_SECURE_NO_WARNINGS

#include <string.h>
#include <ctype.h>
#include <stdlib.h>
#include "parser.h"
#include "../command_vars.h"
#include "../constants.h"
#include "simulation.h"
#include "grid.h"
#include "log_event.h"
#include "../util/util.h"

extern const command_vars_t g_comVars;

size_t parse_simulation_file(simulation_t * const sims) {
  FILE * file = fopen(g_comVars.simulationFilePathname, "r");
  assert_file_handle(file, g_comVars.simulationFilePathname, true);
  
  const size_t parsedCount = parse_simulation_array(file, sims);
  
  fclose(file);
  
  log_event(
    ET_SUCCESS,
    "Parsed simulation file '%s'",
    g_comVars.simulationFilePathname
  );
  
  return parsedCount;
}

size_t parse_simulation_array(FILE * const file, simulation_t * const sims) {
  size_t parsedCount = 0;
  
  do {
    simulation_t * sim = &sims[parsedCount];
    parse_simulation_struct(file, sim);
    ++parsedCount;
  } while (
    parsedCount <= MAX_SIMULATION_COUNT &&
    is_there_another_simulation(file)
  );
  
  return parsedCount;
}

void parse_simulation_struct(FILE * const file, simulation_t * const sim) {
  move_cursor_to_next_char_occurence(file, "(");
  parse_simulation_name(file, sim);
  parse_simulation_output_format(file, sim);
  parse_simulation_max_iterations(file, sim);
  
  // grid
  move_cursor_to_next_char_occurence(file, "(");
  parse_grid_struct(file, sim);
  
  // rules
  move_cursor_to_next_char_occurence(file, "[");
  sim->ruleset.count = 0;
  char c;
  do {
    if (sim->ruleset.count == 0) {
      move_cursor_to_next_char_occurence(file, "(");
    }
    parse_rule_struct(file, sim);
    ++sim->ruleset.count;
    c = move_cursor_to_next_struct_or_array_end(file);
  } while (c != ']');
  ruleset_validate(&sim->ruleset, sim->name);
  
  // ant
  move_cursor_to_next_char_occurence(file, "(");
  parse_ant_struct(file, sim);
  ant_validate(&sim->ant, &sim->grid, sim->name);
}

void move_cursor_to_next_char_occurence(
  FILE * const file,
  const char * const searchChar
) {
  int c;
  do {
    c = fgetc(file);
    if (c == EOF) {
      log_event(ET_ERROR, "Failed to parse: expected '%s'", searchChar);
      terminate(EC_FAILED_TO_PARSE_SIMULATION_FILE, NULL);
    }
  } while (c != searchChar[0]);
}

char move_cursor_to_next_struct_or_array_end(FILE * const file) {
  int c;
  do {
    c = fgetc(file);
    if (c == EOF) {
      log_event(ET_ERROR, "Failed to parse: expected '(' or ']'");
      terminate(EC_FAILED_TO_PARSE_SIMULATION_FILE, NULL);
    }
  } while (c != '(' && c != ']');
  return (char)c;
}

void parse_struct_field(
  FILE * const file,
  const char * const format,
  void * const destination,
  const char * const fieldName,
  const char * const simName
) {
  if (fscanf(file, format, destination) != 1) {
    if (simName != NULL) {
      log_event(
        ET_ERROR,
        "Failed to parse simulation '%s': unable to read %s",
        simName,
        fieldName
      );
    } else {
      log_event(
        ET_ERROR,
        "Failed to parse simulation: unable to read %s",
        fieldName
      );
    }
    
    terminate(EC_FAILED_TO_PARSE_SIMULATION_FILE, NULL);
  }
}

void parse_simulation_name(FILE * const file, simulation_t * const sim) {
  parse_struct_field(file, "%255[^,], ", sim->name, "simulation name", NULL);
}

void parse_simulation_output_format(FILE * const file, simulation_t * const sim) {
  char outputFormat[5] = { NUL };
  
  parse_struct_field(
    file,
    "%4[^,], ",
    outputFormat,
    "simulation output-format",
    sim->name
  );
  
  if (are_strings_identical(outputFormat, "PGMa")) {
    sim->outFileType = SIFT_PGM_ASCII;
  } else if (are_strings_identical(outputFormat, "PGMb")) {
    sim->outFileType = SIFT_PGM_BINARY;
  } else {
    log_event(
      ET_ERROR,
      "Parsing of simulation '%s' failed: invalid simulation output-format",
      sim->name
    );
    terminate(EC_FAILED_TO_PARSE_SIMULATION_FILE, NULL);
  }
}

void parse_simulation_max_iterations(FILE * const file, simulation_t * const sim) {
  parse_struct_field(
    file,
    "%" PRId64 ")",
    &sim->maxIterations,
    "simulation max-iterations",
    sim->name
  );
}

void parse_grid_struct(FILE * const file, simulation_t * const sim) {
  grid_t * grid = &sim->grid;
  
  parse_struct_field(file, "%hu, ", &grid->width, "grid width", sim->name);
  parse_struct_field(file, "%hu, ", &grid->height, "grid height", sim->name);
  parse_struct_field(
    file,
    "%d)",
    &grid->initialColor,
    "grid initial-color",
    sim->name
  );
}

void parse_rule_struct(FILE * const file, simulation_t * const sim) {
  rule_t rule = { 0 };
  
  parse_rule_color(file, sim, &rule);
  parse_rule_turn_direction(file, sim, &rule);
  parse_rule_replacement_color(file, sim, &rule);
  
  const uint8_t ruleCount = sim->ruleset.count;
  sim->ruleset.rules[ruleCount] = rule;
  sim->ruleset.rules[ruleCount].isUsed = true;
}

void parse_rule_color(
  FILE * const file,
  const simulation_t * const sim,
  rule_t * const rule
) {
  char fieldName[] = "rule x color";
  fieldName[5] = '0' + (sim->ruleset.count + 1);
  
  parse_struct_field(
    file,
    "%" PRId8 ", ",
    &rule->color,
    fieldName,
    sim->name
  );
}

void parse_rule_turn_direction(
  FILE * const file,
  const simulation_t * const sim,
  rule_t * const rule
) {
  char fieldName[] = "rule x turn-direction";
  const char ruleNumber = '0' + (sim->ruleset.count + 1);
  fieldName[5] = ruleNumber;
  
  char turnDirectionStr[6] = { NUL };
  parse_struct_field(file, "%5[^,], ", turnDirectionStr, fieldName, sim->name);
  
  if (are_strings_identical(turnDirectionStr, "left")) {
    rule->turnDirection = TD_LEFT;
  } else if (are_strings_identical(turnDirectionStr, "none")) {
    rule->turnDirection = TD_NONE;
  } else if (are_strings_identical(turnDirectionStr, "right")) {
    rule->turnDirection = TD_RIGHT;
  } else {
    log_event(
      ET_ERROR,
      "Failed to parse simulation '%s': invalid 'turn-direction' for rule #" PRId8,
      sim->name,
      ruleNumber
    );
    terminate(EC_FAILED_TO_PARSE_SIMULATION_FILE, NULL);
  }
}

void parse_rule_replacement_color(
  FILE * const file,
  const simulation_t * const sim,
  rule_t * const rule
) {
  char fieldName[] = "rule x replacement-color";
  fieldName[5] = '0' + (sim->ruleset.count + 1);
  
  parse_struct_field(
    file,
    "%" PRId8 ")",
    &rule->replacementColor,
    fieldName,
    sim->name
  );
}

void parse_ant_struct(FILE * const file, simulation_t * const sim) {
  parse_ant_initial_col(file, sim);
  parse_ant_initial_row(file, sim);
  parse_ant_initial_orientation(file, sim);
}

void parse_ant_initial_col(FILE * const file, simulation_t * const sim) {
  parse_struct_field(
    file,
    "%hu, ",
    &sim->ant.col,
    "ant initial-column",
    sim->name
  );
}

void parse_ant_initial_row(FILE * const file, simulation_t * const sim) {
  parse_struct_field(
    file,
    "%hu, ",
    &sim->ant.row,
    "ant initial-row",
    sim->name
  );
}

void parse_ant_initial_orientation(FILE * const file, simulation_t * const sim) {
  ant_t * const ant = &sim->ant;
  char orientationStr[6] = { NUL };
  
  parse_struct_field(
    file,
    "%5[^,], ",
    orientationStr,
    "ant initial-orientation",
    sim->name
  );
  
  if (are_strings_identical(orientationStr, "north")) {
    ant->orientation = AO_NORTH;
  } else if (are_strings_identical(orientationStr, "east")) {
    ant->orientation = AO_EAST;
  } else if (are_strings_identical(orientationStr, "south")) {
    ant->orientation = AO_SOUTH;
  } else if (are_strings_identical(orientationStr, "west")) {
    ant->orientation = AO_WEST;
  } else {
    log_event(
      ET_ERROR,
      "Parsing of simluation '%s' failed: invalid ant initial-orientation",
      sim->name
    );
    terminate(EC_FAILED_TO_PARSE_SIMULATION_FILE, NULL);
  }
}

bool is_there_another_simulation(FILE * const file) {
  int c;
  while (1) {
    c = fgetc(file);
    if (c == '#') {
      return true;
    }
    if (c == EOF) {
      return false;
    }
  }
}
`;

const testInfoParserC: [[string, TokenArray], string, string] = [
  tokenizedfile,
  expectedFormat,
  'parser.c',
];

export default testInfoParserC;
