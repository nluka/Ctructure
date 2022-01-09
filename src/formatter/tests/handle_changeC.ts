import path = require('path');
import TokenArray from '../../lexer/TokenArray';
import { tokenizeFile } from '../../lexer/tokenizeFile';

const filePath = path.join(
  __dirname,
  '../../sample_code/handle_change_movie.c',
);
const tokenizedfile = tokenizeFile(filePath);

const expectedFormat = `#include <stdlib.h>
#include <string.h>
#include "handlers.h"
#include "ui/ui.h"

void handle_change_movie(movie_collection_t * const collection) {
  MovieIdType_t idType;
  if (!ui_get_movie_id_type(&idType))
    goto abort_update;
  
  movie_t * const movie = ui_get_existing_movie_by_id(idType, collection);
  if (movie == NULL)
    goto abort_update;
  
  const movie_t before = * movie;
  
  char nameInput[MAX_MOVIE_NAME_LENGTH + 1];
  if (ui_get_movie_name(nameInput))
    strncpy(movie->name, nameInput, MAX_MOVIE_NAME_LENGTH + 1);
  
  int quantityInput;
  if (ui_get_movie_quantity(&quantityInput))
    movie->quantity = quantityInput;
  
  double priceInput;
  if (ui_get_movie_price(&priceInput))
    movie->price = priceInput;
  
  ui_display_movie_changes(&before, movie);
  return;
  
  abort_update:
  printfc(TC_YELLOW, "Movie update aborted!\\n");
  return;
}
`;

const testInfoHandleChangeC: [[string, TokenArray], string, string] = [
  tokenizedfile,
  expectedFormat,
  'handle_change_movie.c',
];

export default testInfoHandleChangeC;
