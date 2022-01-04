import path = require('path');
import TokenArray from '../../lexer/TokenArray';
import { tokenizeFile } from '../../lexer/tokenizeFile';

const filePath = path.join(__dirname, '../../sample_code/ant.c');
const tokenizedfile = tokenizeFile(filePath);
const expectedFormat = `#include "ant.h"
#include "log_event.h"
#include "../util/terminate.h"

void ant_validate(
  const ant_t *const ant,
  const grid_t *const grid,
  const char *const simName
) {
  if (
    !grid_is_col_in_bounds(grid, ant->col) ||
    !grid_is_row_in_bounds(grid, ant->row)
  ) {
    log_event(
      ET_ERROR,
      "Parsing of simulation '%s' failed: ant starting coords outside of grid bounds",
      simName
    );
    terminate(EC_FAILED_TO_PARSE_SIMULATION_FILE, NULL);
  }
}

AntStepResult_t ant_take_step(ant_t *const ant) {
  const size_t cellIndex = grid_get_cell_index(ant->grid, ant->col, ant->row);
  const color_t currentCellColor = ant->grid->cells[cellIndex];
  const rule_t *const governingRule = &ant->ruleset->rules[currentCellColor];
  
  ant_turn(ant, governingRule->turnDirection);
  
  ant_set_cell_color(ant, governingRule->replacementColor, cellIndex);
  
  AntStepResult_t moveResult = ant_move_to_next_cell(ant);
  if (moveResult == ASR_OK) {
    ++ant->stepsTaken;
  }
  
  return moveResult;
}

void ant_turn(ant_t *const ant, const TurnDirection_t direction) {
  ant->orientation = (AntOrientation_t)((int)ant->orientation + (int)direction);
  
  // Normalize
  if (ant->orientation == AO_OVERFLOW_COUNTER_CLOCKWISE) {
    ant->orientation = AO_WEST;
  } else if (ant->orientation == AO_OVERFLOW_CLOCKWISE) {
    ant->orientation = AO_NORTH;
  }
}

void ant_set_cell_color(
  const ant_t *const ant,
  const color_t color,
  const size_t cellIndex
) {
  // acts like a hash table, constant time
  ant->grid->cells[cellIndex] = color;
}

AntStepResult_t ant_move_to_next_cell(ant_t *const ant) {
  const int nextCol = ant_get_next_col(ant),
    nextRow = ant_get_next_row(ant);
  
  if (
    !grid_is_col_in_bounds(ant->grid, nextCol) ||
    !grid_is_row_in_bounds(ant->grid, nextRow)
  ) {
    return ASR_HIT_BOUNDARY;
  }
  
  ant->col = (ushort_t)nextCol;
  ant->row = (ushort_t)nextRow;
  
  return ASR_OK;
}

int ant_get_next_col(const ant_t *const ant) {
  if (ant->orientation == AO_EAST) {
    return (int)(ant->col) + 1;
  }
  if (ant->orientation == AO_WEST) {
    return (int)(ant->col) - 1;
  }
  return (int)(ant->col);
}

int ant_get_next_row(const ant_t *const ant) {
  if (ant->orientation == AO_NORTH) {
    return (int)(ant->row) - 1;
  }
  if (ant->orientation == AO_SOUTH) {
    return (int)(ant->row) + 1;
  }
  return (int)(ant->row);
}`;

const testInfoAntC: [[string, TokenArray], string, string] = [
  tokenizedfile,
  expectedFormat,
  'act.c',
];

export default testInfoAntC;
