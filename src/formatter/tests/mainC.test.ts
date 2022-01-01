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
    const filePath = path.join(__dirname, '../../sample_code/main.c');
    const tokenizedfile = tokenizeFile(filePath);
    assert(tokenizedfile, '#include <stdio.h>\n\
#include <ctype.h>\n\
#include <stdbool.h>\n\
#include <string.h>\n\
#include "ui/ui.h"\n\
#include "handlers.h"\n\
#include "core/data.h"\n\
\n\
bool g_isGrayscaleModeEnabled = false;\n\
\n\
int main(int argc, char **argv) {\n\
  if (argc > 1 && strcmp(argv[1], "--grayscale") == 0)\n\
    g_isGrayscaleModeEnabled = true;\n\
  \n\
  movie_collection_t movieCollection = { 0 };\n\
  printhr();\n\
  if (load_movie_collection_from_data_file(&movieCollection)) {\n\
    printfc(TC_GREEN, "Movies loaded from data file successfully.\\n\
");\n\
  } else {\n\
    printfc(TC_YELLOW, "Failed to load movies from data file.\\n\
");\n\
  }\n\
  \n\
  while (1) {\n\
    ui_main_menu();\n\
    \n\
    char choice;\n\
    scanf("%c", &choice);\n\
    fflush(stdin);\n\
    \n\
    switch (tolower(choice)) {\n\
      case \'a\':\n\
        if (movieCollection.count >= 100) {\n\
          printfc(TC_RED, "ERROR: max capacity reached\\n\
");\n\
        } else {\n\
          handle_add_movie(&movieCollection);\n\
        }\n\
        break;\n\
      case \'c\':\n\
        handle_change_movie(&movieCollection);\n\
        break;\n\
      case \'d\':\n\
        handle_delete_movie(&movieCollection);\n\
        break;\n\
      case \'l\':\n\
        handle_list_movies(&movieCollection);\n\
        break;\n\
      case \'q\':\n\
        return save_movie_collection_to_data_file(&movieCollection) ? 0 : 1;\n\
      default:\n\
        printfc(TC_RED, "ERROR: invalid choice\\n\
");\n\
        break;\n\
    }\n\
  }\n\
  \n\
  return -1;\n\
}\n\
');
  }

}
);