import path = require('path');
import TokenArray from '../../lexer/TokenArray';
import { tokenizeFile } from '../../lexer/tokenizeFile';

const filePath = path.join(__dirname, '../../sample_code/handle_add_movie.c');
const tokenizedfile = tokenizeFile(filePath);

const expectedFormat = `#include "handlers.h"
#include "ui/ui.h"

void handle_add_movie(movie_collection_t * const collection) {
  MovieIdType_t idType;
  if (!ui_get_movie_id_type(&idType))
    goto abort_addition;
  
  char idInput[MAX_MOVIE_ID_LENGTH + 1];
  if (!ui_get_unique_movie_id(idType, collection, idInput))
    goto abort_addition;
  
  char nameInput[MAX_MOVIE_NAME_LENGTH + 1];
  if (!ui_get_movie_name(nameInput))
    goto abort_addition;
  
  int quantityInput;
  if (!ui_get_movie_quantity(&quantityInput))
    goto abort_addition;
  
  double priceInput;
  if (!ui_get_movie_price(&priceInput))
    goto abort_addition;
  
  const bool wasMovieAdded = movie_collection_add(
    collection,
    idType,
    idInput,
    nameInput,
    quantityInput,
    priceInput
  );
  printfc(TC_GREEN, "Movie added successfully.\\n");
  return;
  
  abort_addition:
  printfc(TC_YELLOW, "Movie addition aborted!\\n");
  return;
}
`;

const testInfoHandleAddC: [[string, TokenArray], string, string] = [
  tokenizedfile,
  expectedFormat,
  'handle_add_movie.c',
];

export default testInfoHandleAddC;
