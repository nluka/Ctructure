#include "Ant.hpp"
#include "event_log.hpp"
#include "../ui/ui.hpp"
#include "../util/util.hpp"

void ant_validate(
  Ant const *const ant,
  Grid const *const grid,
  char const *const simName
) {
  if (
    !grid_is_col_in_bounds(grid, ant->col) ||
    !grid_is_row_in_bounds(grid, ant->row)
  ) {
    char const *const format =
      "Parsing of simulation '%s' failed: ant starting coords outside of grid bounds";
    log_event(ET_ERROR, format, simName);
    printfc(TC_RED, format, simName);
    printf("\n");
    end(ET_FAILED_TO_PARSE_SIMULATION_FILE);
  }
}

AntStepResult ant_take_step(
  Ant *const ant,
  Grid *const grid,
  Ruleset const *const ruleset
) {
  size_t const currCellIndex = grid_get_cell_index(grid, ant->col, ant->row);
  color_t const currCellColor = grid->cells[currCellIndex];
  Rule const *const currCellRule = &ruleset->rules[currCellColor];

  { // turn
    ant->orientation = ant->orientation + currCellRule->turnDirection;
    if (ant->orientation == AO_OVERFLOW_COUNTER_CLOCKWISE) {
      ant->orientation = AO_WEST;
    } else if (ant->orientation == AO_OVERFLOW_CLOCKWISE) {
      ant->orientation = AO_NORTH;
    }
  }

  // update current cell color
  grid->cells[currCellIndex] = currCellRule->replacementColor;

  { // try to move to next cell
    int nextCol, nextRow;

    if (ant->orientation == AO_EAST) {
      nextCol = (int)(ant->col) + 1;
    } else if (ant->orientation == AO_WEST) {
      nextCol = (int)(ant->col) - 1;
    } else {
      nextCol = (int)(ant->col);
    }

    if (ant->orientation == AO_NORTH) {
      nextRow = (int)(ant->row) - 1;
    } else if (ant->orientation == AO_SOUTH) {
      nextRow = (int)(ant->row) + 1;
    } else {
      nextRow = (int)(ant->row);
    }

    if (
      !grid_is_col_in_bounds(grid, nextCol) ||
      !grid_is_row_in_bounds(grid, nextRow)
    ) {
      return ASR_HIT_BOUNDARY;
    }

    ant->col = (uint16_t)(nextCol);
    ant->row = (uint16_t)(nextRow);
  }

  return ASR_OK;
}