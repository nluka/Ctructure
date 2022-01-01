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
    const filePath = path.join(__dirname, '../../sample_code/movie.c');
    const tokenizedfile = tokenizeFile(filePath);
    assert(tokenizedfile, '#include "movie.h"\n\
#include <stddef.h>\n\
#include <string.h>\n\
#include <stdlib.h>\n\
\n\
extern movie_collection_t movieCollection;\n\
\n\
movie_t *movie_collection_find(\n\
  movie_collection_t *const collection,\n\
  const MovieIdType_t idType,\n\
  const char *const id\n\
) {\n\
  for (int i = 0; i < collection->count; ++i) {\n\
    movie_t *const movie = &collection->records[i];\n\
    if (movie->id.type == idType && strcmp(movie->id.value, id) == 0) {\n\
      return movie;\n\
    }\n\
  }\n\
  return NULL;\n\
}\n\
\n\
const movie_t *movie_collection_find_immut(\n\
  const movie_collection_t *const collection,\n\
  const MovieIdType_t idType,\n\
  const char *const id\n\
) {\n\
  for (int i = 0; i < collection->count; ++i) {\n\
    const movie_t *const movie = &collection->records[i];\n\
    if (movie->id.type == idType && strcmp(movie->id.value, id) == 0) {\n\
      return movie;\n\
    }\n\
  }\n\
  return NULL;\n\
}\n\
\n\
bool movie_collection_add(\n\
  movie_collection_t *const collection,\n\
  const MovieIdType_t idType,\n\
  const char *const idValue,\n\
  const char *const name,\n\
  const int quantity,\n\
  const double price\n\
) {\n\
  if (collection->count >= MAX_MOVIE_COUNT) {\n\
    return false;\n\
  }\n\
  \n\
  movie_t newMovie = {\n\
    .id = { .type = idType, .value = { 0 } },\n\
    .name = { 0 },\n\
    .quantity = quantity,\n\
    .price = price\n\
  };\n\
  \n\
  strncpy(newMovie.id.value, idValue, MAX_MOVIE_ID_LENGTH);\n\
  strncpy(newMovie.name, name, MAX_MOVIE_NAME_LENGTH);\n\
  \n\
  collection->records[collection->count] = newMovie;\n\
  ++collection->count;\n\
}\n\
\n\
int movie_comparer(const void *left, const void *right) {\n\
  const movie_t *const leftMovie = (movie_t *)left;\n\
  const movie_t *const rightMovie = (movie_t *)right;\n\
  return strcmp(leftMovie->name, rightMovie->name);\n\
}\n\
void movie_collection_sort(movie_collection_t *const collection) {\n\
  qsort(collection, collection->count, sizef(movie_t), movie_comparer);\n\
}\n\
\n\
void movie_collection_delete(\n\
  movie_collection_t *const collection,\n\
  movie_t *const movie\n\
) {\n\
  if (collection->count <= 0) {\n\
    return;\n\
  }\n\
  \n\
  movie_t *const last = &collection->records[collection->count - 1];\n\
  if (movie != last) {\n\
    *movie = *last;\n\
  }\n\
  --collection->count;\n\
}\n\
');
  }

}
);