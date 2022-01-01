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
    const filePath = path.join(__dirname, '../../sample_code/movie_operations.c');
    const tokenizedfile = tokenizeFile(filePath);
    assert(tokenizedfile,'#include <stdio.h>\n\
#include <ctype.h>\n\
#include <stdlib.h>\n\
#include <string.h>\n\
#include "movie_operations.h"\n\
#include "print.h"\n\
\n\
#define MAX_MOVIE_QUANTITY_DIGITS 10\n\
#define MAX_MOVIE_PRICE_DIGITS 6\n\
\n\
// returns true if a value was inputted, false otherwise\n\
bool ui_get_movie_id_type(MovieIdType_t *const out) {\n\
  char input;\n\
  \n\
  while (1) {\n\
    printhr();\n\
    printf("Choose movie ID type (\'u\' = UPC, \'s\' = SKU, leave blank to abort)\\n\
");\n\
    printfc(TC_MAGENTA, "> ");\n\
    \n\
    scanf("%c", &input);\n\
    fflush(stdin);\n\
    \n\
    const bool wasValueInputted = input != \'\\n\
\';\n\
    if (!wasValueInputted) {\n\
      return false;\n\
    }\n\
    \n\
    if (input == \'u\') {\n\
      *out = MIT_UPC;\n\
    } else if (input == \'s\') {\n\
      *out = MIT_SKU;\n\
    } else {\n\
      printfc(TC_RED, "ERROR: invalid movie ID type choice\\n\
");\n\
      continue;\n\
    }\n\
    return true;\n\
  }\n\
}\n\
\n\
// returns true if a value was inputted, false otherwise\n\
bool ui_get_unique_movie_id(\n\
  const MovieIdType_t idType,\n\
  const movie_collection_t *const collection,\n\
  char *const out\n\
) {\n\
  while (1) {\n\
    printhr();\n\
    printf(\n\
      "Enter movie %s (max. 12 digits, leave blank to abort)\\n\
",\n\
      idType == MIT_UPC ? "UPC" : "SKU"\n\
    );\n\
    printfc(TC_MAGENTA, "> ");\n\
    \n\
    fgets(out, MAX_MOVIE_ID_LENGTH + 1, stdin);\n\
    fflush(stdin);\n\
    \n\
    const bool wasValueInputted = out[0] != \'\\n\
\';\n\
    if (!wasValueInputted) {\n\
      return false;\n\
    }\n\
    \n\
    out[strcspn(out, "\\n\
")] = \'\\0\'; // remove captured newline from fgets\n\
    \n\
    if (movie_collection_find_immut(collection, idType, out)) {\n\
      printfc(TC_RED, "ERROR: ID already in use\\n\
");\n\
    } else {\n\
      return true;\n\
    }\n\
  }\n\
}\n\
\n\
// returns NULL if no value was inputted\n\
movie_t *ui_get_existing_movie_by_id(\n\
  const MovieIdType_t idType,\n\
  movie_collection_t *const collection\n\
) {\n\
  char input[MAX_MOVIE_ID_LENGTH + 1] = { 0 };\n\
  \n\
  while (1) {\n\
    printhr();\n\
    printf(\n\
      "Enter movie %s (max. 12 digits, leave blank to abort)\\n\
",\n\
      idType == MIT_UPC ? "UPC" : "SKU"\n\
    );\n\
    printfc(TC_MAGENTA, "> ");\n\
    \n\
    fgets(input, MAX_MOVIE_ID_LENGTH + 1, stdin);\n\
    fflush(stdin);\n\
    \n\
    const bool wasValueInputted = input[0] != \'\\n\
\';\n\
    if (!wasValueInputted) {\n\
      return NULL;\n\
    }\n\
    \n\
    input[strcspn(input, "\\n\
")] = \'\\0\'; // remove captured newline from fgets\n\
    \n\
    movie_t *const movie = movie_collection_find(collection, idType, input);\n\
    if (movie == NULL) {\n\
      printfc(TC_RED, "ERROR: movie not found\\n\
");\n\
    } else {\n\
      return movie;\n\
    }\n\
  }\n\
}\n\
\n\
// returns true if a value was inputted, false otherwise\n\
bool ui_get_movie_name(char *const out) {\n\
  printhr();\n\
  printf("Enter movie name (max. 30 chars, leave blank to abort)\\n\
");\n\
  printfc(TC_MAGENTA, "> ");\n\
  \n\
  fgets(out, MAX_MOVIE_NAME_LENGTH + 1, stdin);\n\
  fflush(stdin);\n\
  \n\
  const bool wasValueInputted = out[0] != \'\\n\
\';\n\
  out[strcspn(out, "\\n\
")] = \'\\0\'; // remove captured newline from fgets\n\
  return wasValueInputted;\n\
}\n\
\n\
// returns true if a value was inputted, false otherwise\n\
bool ui_get_movie_quantity(int *const out) {\n\
  char input[MAX_MOVIE_QUANTITY_DIGITS + 1];\n\
  int quantityInput;\n\
  \n\
  while (1) {\n\
    printhr();\n\
    printf("Enter movie quantity (max. 10 digits, leave blank to abort)\\n\
");\n\
    printfc(TC_MAGENTA, "> ");\n\
    \n\
    fgets(input, MAX_MOVIE_QUANTITY_DIGITS + 1, stdin);\n\
    fflush(stdin);\n\
    \n\
    const bool wasValueInputted = input[0] != \'\\n\
\';\n\
    if (!wasValueInputted) {\n\
      return false;\n\
    }\n\
    \n\
    input[strcspn(input, "\\n\
")] = \'\\0\'; // remove captured newline from fgets\n\
    \n\
    quantityInput = atoi(input);\n\
    if (quantityInput <= 0) {\n\
      printfc(TC_RED, "ERROR: quantity must be > 0\\n\
");\n\
      continue;\n\
    } else {\n\
      *out = quantityInput;\n\
      return true;\n\
    }\n\
  }\n\
}\n\
\n\
// returns true if a value was inputted, false otherwise\n\
bool ui_get_movie_price(double *const out) {\n\
  char input[MAX_MOVIE_PRICE_DIGITS + 1];\n\
  double priceInput;\n\
  \n\
  while (1) {\n\
    printhr();\n\
    printf("Enter movie price (max. 6 chars, leave blank to abort)\\n\
");\n\
    printfc(TC_MAGENTA, "> ");\n\
    \n\
    fgets(input, MAX_MOVIE_PRICE_DIGITS + 1, stdin);\n\
    fflush(stdin);\n\
    \n\
    const bool wasValueInputted = input[0] != \'\\n\
\';\n\
    if (!wasValueInputted) {\n\
      return false;\n\
    }\n\
    \n\
    input[strcspn(input, "\\n\
")] = \'\\0\'; // remove captured newline from fgets\n\
    \n\
    priceInput = atof(input);\n\
    if (priceInput <= 0) {\n\
      printfc(TC_RED, "ERROR: price must be > 0\\n\
");\n\
      continue;\n\
    } else {\n\
      *out = priceInput;\n\
      return true;\n\
    }\n\
  }\n\
}\n\
\n\
void ui_display_movie_collection(const movie_collection_t *const collection) {\n\
  ui_display_movie_table_heading();\n\
  for (int i = 0; i < collection->count; ++i) {\n\
    const movie_t *const movie = &collection->records[i];\n\
    ui_display_movie(movie);\n\
  }\n\
}\n\
\n\
void ui_display_movie_table_heading() {\n\
  printfc(\n\
    TC_DARK_GRAY,\n\
    "Movie Name                      Identifier        Quantity    Price\\n\
"\n\
  );\n\
  // printf("------------------------------  ----------------  ----------  ----------\\n\
");\n\
}\n\
\n\
void ui_display_movie(const movie_t *const movie) {\n\
  printf(\n\
    "%-30s  %s|%-12s  %-10d  $%-.2lf\\n\
",\n\
    movie->name,\n\
    movie->id.type == MIT_UPC ? "UPC" : "SKU",\n\
    movie->id.value,\n\
    movie->quantity,\n\
    movie->price\n\
  );\n\
}\n\
\n\
void ui_display_movie_changes(\n\
  const movie_t *const before,\n\
  const movie_t *const after\n\
) {\n\
  const bool wasNameChanged = strcmp(before->name, after->name) != 0,\n\
    wasQuantityChanged = before->quantity != after->quantity,\n\
    wasPriceChanged = before->price != after->price;\n\
  \n\
  printhr();\n\
  printf("Movie changes:");\n\
  if (!wasNameChanged && !wasQuantityChanged && !wasPriceChanged) {\n\
    printf(" none\\n\
");\n\
    return;\n\
  }\n\
  printf("\\n\
");\n\
  \n\
  ui_display_movie_table_heading();\n\
  ui_display_movie(after);\n\
  \n\
  if (wasNameChanged) {\n\
    printfc(TC_YELLOW, "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");\n\
  } else {\n\
    printf("                              ");\n\
  }\n\
  printf("                    ");\n\
  if (wasQuantityChanged) {\n\
    printfc(TC_YELLOW, "^^^^^^^^^^");\n\
  } else {\n\
    printf("          ");\n\
  }\n\
  printf("  ");\n\
  if (wasPriceChanged) {\n\
    printfc(TC_YELLOW, "^^^^^^^^^^");\n\
  }\n\
  printf("\\n\
");\n\
  \n\
  ui_display_movie(before);\n\
}\n\
');
  }

}
);