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
    const filePath = path.join(__dirname, '../../sample_code/handle_change_movie.c');
    const tokenizedfile = tokenizeFile(filePath);
    assert(tokenizedfile, '#include <stdlib.h>\n\
#include <string.h>\n\
#include \"handlers.h\"\n\
#include \"ui/ui.h\"\n\
\n\
void handle_change_movie(movie_collection_t *const collection) {\n\
  MovieIdType_t idType;\n\
  if (!ui_get_movie_id_type(&idType))\n\
    goto abort_update;\n\
  \n\
  movie_t *const movie = ui_get_existing_movie_by_id(idType, collection);\n\
  if (movie == NULL)\n\
    goto abort_update;\n\
  \n\
  const movie_t before = *movie;\n\
  \n\
  char nameInput[MAX_MOVIE_NAME_LENGTH + 1];\n\
  if (ui_get_movie_name(nameInput))\n\
    strncpy(movie->name, nameInput, MAX_MOVIE_NAME_LENGTH + 1);\n\
  \n\
  int quantityInput;\n\
  if (ui_get_movie_quantity(&quantityInput))\n\
    movie->quantity = quantityInput;\n\
  \n\
  double priceInput;\n\
  if (ui_get_movie_price(&priceInput))\n\
    movie->price = priceInput;\n\
  \n\
  ui_display_movie_changes(&before, movie);\n\
  return;\n\
  \n\
  abort_update:printfc(TC_YELLOW, \"Movie update aborted!\\n\
\");\n\
  return;\n\
}\n\
');
  }

}
);