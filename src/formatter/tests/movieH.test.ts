import path = require('path');
import { tokenizeFile } from '../../lexer/tokenizeFile';
import assert from './assert';

const filePath = path.join(__dirname, '../../sample_code/movie.h');
const tokenizedfile = tokenizeFile(filePath);

const expectedFormat = 

`#ifndef CORE_MOVIE_H
#define CORE_MOVIE_H

#include <stdbool.h>

#define MAX_MOVIE_ID_LENGTH 12
#define MAX_MOVIE_NAME_LENGTH 30
#define MAX_MOVIE_COUNT 100

typedef enum MovieIdType {
  MIT_UPC,
  MIT_SKU
} MovieIdType_t;

typedef struct movie_id {
  MovieIdType_t type;
  char value[MAX_MOVIE_ID_LENGTH + 1];
} movie_id_t;

typedef struct movie {
  movie_id_t id;
  char name[MAX_MOVIE_NAME_LENGTH + 1];
  int quantity;
  double price;
} movie_t;

typedef struct movie_collection {
  movie_t records[MAX_MOVIE_COUNT];
  int count;
} movie_collection_t;

extern movie_collection_t movieCollection;

movie_t *movie_collection_find(
  movie_collection_t *collection,
  MovieIdType_t idType,
  const char *id
);
const movie_t *movie_collection_find_immut(
  const movie_collection_t *collection,
  MovieIdType_t idType,
  const char *id
);
bool movie_collection_add(
  movie_collection_t *collection,
  MovieIdType_t idType,
  const char *idValue,
  const char *name,
  int quantity,
  double price
);
void movie_collection_sort(movie_collection_t *collection);
void movie_collection_delete(movie_collection_t *collection, movie_t *movie);

#endif // CORE_MOVIE_H
`;

assert(tokenizedfile, expectedFormat, 'movie.h');
