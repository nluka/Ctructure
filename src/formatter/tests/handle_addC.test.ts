import path = require("path");
import TokenArray from "../../lexer/TokenArray";
import { tokenizeFile } from "../../lexer/tokenizeFile";
import formatFile, { toString } from "../formatter";

describe('formatter', () => {
  function assert(
    tokenizedFile: [string, TokenArray],
    expectedFormat: string,
  ) {
    test(`format file: str.c`, () => {
      const stringed = toString(formatFile(tokenizedFile));
      //console.log(stringed);
      expect(stringed).toBe(expectedFormat);
    });
  }

  {
    const filePath = path.join(__dirname, '../../sample_code/handle_add_movie.c');
    const tokenizedfile = tokenizeFile(filePath);
    assert(tokenizedfile, '#include "handlers.h"\n\
#include "ui/ui.h"\n\
\n\
void handle_add_movie(movie_collection_t *const collection) {\n\
  MovieIdType_t idType;\n\
  if (!ui_get_movie_id_type(&idType))\n\
    goto abort_addition;\n\
  \n\
  char idInput[MAX_MOVIE_ID_LENGTH + 1];\n\
  if (!ui_get_unique_movie_id(idType, collection, idInput))\n\
    goto abort_addition;\n\
  \n\
  char nameInput[MAX_MOVIE_NAME_LENGTH + 1];\n\
  if (!ui_get_movie_name(nameInput))\n\
    goto abort_addition;\n\
  \n\
  int quantityInput;\n\
  if (!ui_get_movie_quantity(&quantityInput))\n\
    goto abort_addition;\n\
  \n\
  double priceInput;\n\
  if (!ui_get_movie_price(&priceInput))\n\
    goto abort_addition;\n\
  \n\
  const bool wasMovieAdded = movie_collection_add(\n\
    collection,\n\
    idType,\n\
    idInput,\n\
    nameInput,\n\
    quantityInput,\n\
    priceInput\n\
  );\n\
  printfc(TC_GREEN, "Movie added successfully.\\n\
");\n\
  return;\n\
  \n\
  abort_addition:printfc(TC_YELLOW, "Movie addition aborted!\\n\
");\n\
  return;\n\
}\n\
');
  }

}
);