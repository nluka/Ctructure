import path = require('path');
import { tokenizeFile } from '../../lexer/tokenizeFile';
import assert from './assert';

const filePath = path.join(__dirname, '../../sample_code/movie.c');
const tokenizedfile = tokenizeFile(filePath);

const expectedFormat = 

`#include "movie.h"
#include <stddef.h>
#include <string.h>
#include <stdlib.h>

extern movie_collection_t movieCollection;

movie_t *movie_collection_find(
  movie_collection_t *const collection,
  const MovieIdType_t idType,
  const char *const id
) {
  for (int i = 0; i < collection->count; ++i) {
    movie_t *const movie = &collection->records[i];
    if (movie->id.type == idType && strcmp(movie->id.value, id) == 0) {
      return movie;
    }
  }
  return NULL;
}

const movie_t *movie_collection_find_immut(
  const movie_collection_t *const collection,
  const MovieIdType_t idType,
  const char *const id
) {
  for (int i = 0; i < collection->count; ++i) {
    const movie_t *const movie = &collection->records[i];
    if (movie->id.type == idType && strcmp(movie->id.value, id) == 0) {
      return movie;
    }
  }
  return NULL;
}

bool movie_collection_add(
  movie_collection_t *const collection,
  const MovieIdType_t idType,
  const char *const idValue,
  const char *const name,
  const int quantity,
  const double price
) {
  if (collection->count >= MAX_MOVIE_COUNT) {
    return false;
  }
  
  movie_t newMovie = {
    .id = { .type = idType, .value = { 0 } },
    .name = { 0 },
    .quantity = quantity,
    .price = price
  };
  
  strncpy(newMovie.id.value, idValue, MAX_MOVIE_ID_LENGTH);
  strncpy(newMovie.name, name, MAX_MOVIE_NAME_LENGTH);
  
  collection->records[collection->count] = newMovie;
  ++collection->count;
}

int movie_comparer(const void *left, const void *right) {
  const movie_t *const leftMovie = (movie_t *)left;
  const movie_t *const rightMovie = (movie_t *)right;
  return strcmp(leftMovie->name, rightMovie->name);
}
void movie_collection_sort(movie_collection_t *const collection) {
  qsort(collection, collection->count, sizef(movie_t), movie_comparer);
}

void movie_collection_delete(
  movie_collection_t *const collection,
  movie_t *const movie
) {
  if (collection->count <= 0) {
    return;
  }
  
  movie_t *const last = &collection->records[collection->count - 1];
  if (movie != last) {
    *movie = *last;
  }
  --collection->count;
}
`;

assert(tokenizedfile, expectedFormat, 'movie.c');