import path = require('path');
import TokenArray from '../../lexer/TokenArray';
import { tokenizeFile } from '../../lexer/tokenizeFile';

const filePath = path.join(__dirname, '../../sample_code/ant.h');
const tokenizedfile = tokenizeFile(filePath);

const expectedFormat = `#ifndef ANT_SIMULATOR_LITE_CORE_ANT_H
#define ANT_SIMULATOR_LITE_CORE_ANT_H

#include <inttypes.h>
#include "../util/ushort_t.h"
#include "grid.h"
#include "ruleset.h"

typedef enum AntOrientation {
  AO_OVERFLOW_COUNTER_CLOCKWISE = -1,
  AO_NORTH,
  AO_EAST,
  AO_SOUTH,
  AO_WEST,
  AO_OVERFLOW_CLOCKWISE
} AntOrientation_t;

typedef struct ant {
  ushort_t col;
  ushort_t row;
  AntOrientation_t orientation;
  grid_t *grid;
  ruleset_t *ruleset;
  size_t stepsTaken;
} ant_t;

typedef enum AntStepResult {
  ASR_OK,
  ASR_HIT_BOUNDARY,
} AntStepResult_t;

void ant_validate(const ant_t *ant, const grid_t *grid, const char *simName);
AntStepResult_t ant_take_step(ant_t *ant);
void ant_turn(ant_t *ant, TurnDirection_t direction);
void ant_set_cell_color(const ant_t *ant, color_t color, size_t cellIndex);
AntStepResult_t ant_move_to_next_cell(ant_t *ant);
int ant_get_next_col(const ant_t *ant);
int ant_get_next_row(const ant_t *ant);

#endif // ANT_SIMULATOR_LITE_CORE_ANT_H

`;

const testInfoAntH: [[string, TokenArray], string, string] = [
  tokenizedfile,
  expectedFormat,
  'ant.h',
];

export default testInfoAntH;
