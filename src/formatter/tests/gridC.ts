import path = require('path');
import TokenArray from '../../lexer/TokenArray';
import { tokenizeFile } from '../../lexer/tokenizeFile';

const filePath = path.join(__dirname, '../../sample_code/grid.c');
const tokenizedfile = tokenizeFile(filePath);

const formatted = `#include <stdlib.h>
#include "grid.h"
#include "../util/terminate.h"
#include "log_event.h"
#include "block.h"

bool grid_init_cells(grid_t * const grid) {
  const size_t cellCount = grid->width * grid->height;
  
  grid->cells = malloc(sizeof(color_t) * cellCount);
  if (grid->cells == NULL) {
    return false;
  }
  
  for (size_t i = 0; i < cellCount; ++i) {
    grid->cells[i] = grid->initialColor;
  }
  grid->cellCount = cellCount;
  
  return true;
}

size_t grid_get_cell_index(
  const grid_t * const grid,
  const ushort_t col,
  const ushort_t row
) {
  return (row * grid->width) + col;
}

bool grid_is_col_in_bounds(const grid_t * const grid, const int col) {
  return col >= 0 && col < (grid->width - 1);
}

bool grid_is_row_in_bounds(const grid_t * const grid, const int row) {
  return row >= 0 && row < (grid->height - 1);
}

void grid_destroy(grid_t * const grid) {
  free(grid->cells);
  grid->cells = NULL;
  grid->width = 0;
  grid->height = 0;
  grid->cellCount = 0;
}
`;

const testInfoGridC: [[string, TokenArray], string, string] = [
  tokenizedfile,
  formatted,
  'grid.c',
];

export default testInfoGridC;
