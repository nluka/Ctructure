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
    const filePath = path.join(__dirname, '../../sample_code/movie.h');
    const tokenizedfile = tokenizeFile(filePath);
    assert(tokenizedfile, '#ifndef CORE_MOVIE_H\n\
#define CORE_MOVIE_H\n\
\n\
#include <stdbool.h>\n\
\n\
#define MAX_MOVIE_ID_LENGTH 12\n\
#define MAX_MOVIE_NAME_LENGTH 30\n\
#define MAX_MOVIE_COUNT 100\n\
\n\
typedef enum MovieIdType{\n\
  MIT_UPC,\n\
  MIT_SKU\n\
} MovieIdType_t;\n\
\n\
typedef struct movie_id{\n\
  MovieIdType_t type;\n\
  char value[MAX_MOVIE_ID_LENGTH + 1];\n\
} movie_id_t;\n\
\n\
typedef struct movie{\n\
  movie_id_t id;\n\
  char name[MAX_MOVIE_NAME_LENGTH + 1];\n\
  int quantity;\n\
  double price;\n\
} movie_t;\n\
\n\
typedef struct movie_collection{\n\
  movie_t records[MAX_MOVIE_COUNT];\n\
  int count;\n\
} movie_collection_t;\n\
\n\
extern movie_collection_t movieCollection;\n\
\n\
movie_t *movie_collection_find(\n\
  movie_collection_t *collection,\n\
  MovieIdType_t idType,\n\
  const char *id\n\
);\n\
const movie_t *movie_collection_find_immut(\n\
  const movie_collection_t *collection,\n\
  MovieIdType_t idType,\n\
  const char *id\n\
);\n\
bool movie_collection_add(\n\
  movie_collection_t *collection,\n\
  MovieIdType_t idType,\n\
  const char *idValue,\n\
  const char *name,\n\
  int quantity,\n\
  double price\n\
);\n\
void movie_collection_sort(movie_collection_t *collection);\n\
void movie_collection_delete(movie_collection_t *collection, movie_t *movie);\n\
\n\
#endif // CORE_MOVIE_H\n\
');
  }

}
);