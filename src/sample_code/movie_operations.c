#include <stdio.h>
#include <ctype.h>
#include <stdlib.h>
#include <string.h>
#include "movie_operations.h"
#include "print.h"

#define MAX_MOVIE_QUANTITY_DIGITS 10
#define MAX_MOVIE_PRICE_DIGITS 6

// returns true if a value was inputted, false otherwise
bool ui_get_movie_id_type(MovieIdType_t *const out) {
  char input;

  while (1) {
    printhr();
    printf("Choose movie ID type ('u' = UPC, 's' = SKU, leave blank to abort)\n");
    printfc(TC_MAGENTA, "> ");

    scanf("%c", &input);
    fflush(stdin);

    const bool wasValueInputted = input != '\n';
    if (!wasValueInputted) {
      return false;
    }

    if (input == 'u') {
      *out = MIT_UPC;
    } else if (input == 's') {
      *out = MIT_SKU;
    } else {
      printfc(TC_RED, "ERROR: invalid movie ID type choice\n");
      continue;
    }
    return true;
  }
}

// returns true if a value was inputted, false otherwise
bool ui_get_unique_movie_id(
  const MovieIdType_t idType,
  const movie_collection_t *const collection,
  char *const out
) {
  while (1) {
    printhr();
    printf(
      "Enter movie %s (max. 12 digits, leave blank to abort)\n",
      idType == MIT_UPC ? "UPC" : "SKU"
    );
    printfc(TC_MAGENTA, "> ");

    fgets(out, MAX_MOVIE_ID_LENGTH + 1, stdin);
    fflush(stdin);

    const bool wasValueInputted = out[0] != '\n';
    if (!wasValueInputted) {
      return false;
    }

    out[strcspn(out, "\n")] = '\0'; // remove captured newline from fgets

    if (movie_collection_find_immut(collection, idType, out)) {
      printfc(TC_RED, "ERROR: ID already in use\n");
    } else {
      return true;
    }
  }
}

// returns NULL if no value was inputted
movie_t* ui_get_existing_movie_by_id(
  const MovieIdType_t idType,
  movie_collection_t *const collection
) {
  char input[MAX_MOVIE_ID_LENGTH + 1] = { 0 };

  while (1) {
    printhr();
    printf(
      "Enter movie %s (max. 12 digits, leave blank to abort)\n",
      idType == MIT_UPC ? "UPC" : "SKU"
    );
    printfc(TC_MAGENTA, "> ");

    fgets(input, MAX_MOVIE_ID_LENGTH + 1, stdin);
    fflush(stdin);

    const bool wasValueInputted = input[0] != '\n';
    if (!wasValueInputted) {
      return NULL;
    }

    input[strcspn(input, "\n")] = '\0'; // remove captured newline from fgets

    movie_t *const movie = movie_collection_find(collection, idType, input);
    if (movie == NULL) {
      printfc(TC_RED, "ERROR: movie not found\n");
    } else {
      return movie;
    }
  }
}

// returns true if a value was inputted, false otherwise
bool ui_get_movie_name(char *const out) {
  printhr();
  printf("Enter movie name (max. 30 chars, leave blank to abort)\n");
  printfc(TC_MAGENTA, "> ");

  fgets(out, MAX_MOVIE_NAME_LENGTH + 1, stdin);
  fflush(stdin);

  const bool wasValueInputted = out[0] != '\n';
  out[strcspn(out, "\n")] = '\0'; // remove captured newline from fgets
  return wasValueInputted;
}

// returns true if a value was inputted, false otherwise
bool ui_get_movie_quantity(int *const out) {
  char input[MAX_MOVIE_QUANTITY_DIGITS + 1];
  int quantityInput;

  while (1) {
    printhr();
    printf("Enter movie quantity (max. 10 digits, leave blank to abort)\n");
    printfc(TC_MAGENTA, "> ");

    fgets(input, MAX_MOVIE_QUANTITY_DIGITS + 1, stdin);
    fflush(stdin);

    const bool wasValueInputted = input[0] != '\n';
    if (!wasValueInputted) {
      return false;
    }

    input[strcspn(input, "\n")] = '\0'; // remove captured newline from fgets

    quantityInput = atoi(input);
    if (quantityInput <= 0) {
      printfc(TC_RED, "ERROR: quantity must be > 0\n");
      continue;
    } else {
      *out = quantityInput;
      return true;
    }
  }
}

// returns true if a value was inputted, false otherwise
bool ui_get_movie_price(double *const out) {
  char input[MAX_MOVIE_PRICE_DIGITS + 1];
  double priceInput;

  while (1) {
    printhr();
    printf("Enter movie price (max. 6 chars, leave blank to abort)\n");
    printfc(TC_MAGENTA, "> ");

    fgets(input, MAX_MOVIE_PRICE_DIGITS + 1, stdin);
    fflush(stdin);

    const bool wasValueInputted = input[0] != '\n';
    if (!wasValueInputted) {
      return false;
    }

    input[strcspn(input, "\n")] = '\0'; // remove captured newline from fgets

    priceInput = atof(input);
    if (priceInput <= 0) {
      printfc(TC_RED, "ERROR: price must be > 0\n");
      continue;
    } else {
      *out = priceInput;
      return true;
    }
  }
}

void ui_display_movie_collection(const movie_collection_t *const collection) {
  ui_display_movie_table_heading();
  for (int i = 0; i < collection->count; ++i) {
    const movie_t *const movie = &collection->records[i];
    ui_display_movie(movie);
  }
}

void ui_display_movie_table_heading() {
  printfc(TC_DARK_GRAY, "Movie Name                      Identifier        Quantity    Price\n");
  // printf("------------------------------  ----------------  ----------  ----------\n");
}

void ui_display_movie(const movie_t *const movie) {
  printf(
    "%-30s  %s|%-12s  %-10d  $%-.2lf\n",
    movie->name,
    movie->id.type == MIT_UPC ? "UPC" : "SKU",
    movie->id.value,
    movie->quantity,
    movie->price
  );
}

void ui_display_movie_changes(
  const movie_t *const before,
  const movie_t *const after
) {
  const bool
    wasNameChanged = strcmp(before->name, after->name) != 0,
    wasQuantityChanged = before->quantity != after->quantity,
    wasPriceChanged = before->price != after->price;

  printhr();
  printf("Movie changes:");
  if (!wasNameChanged && !wasQuantityChanged && !wasPriceChanged) {
    printf(" none\n");
    return;
  }
  printf("\n");

  ui_display_movie_table_heading();
  ui_display_movie(after);

  if (wasNameChanged) {
    printfc(TC_YELLOW, "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
  } else {
    printf("                              ");
  }
  printf("                    ");
  if (wasQuantityChanged) {
    printfc(TC_YELLOW, "^^^^^^^^^^");
  } else {
    printf("          ");
  }
  printf("  ");
  if (wasPriceChanged) {
    printfc(TC_YELLOW, "^^^^^^^^^^");
  }
  printf("\n");

  ui_display_movie(before);
}
