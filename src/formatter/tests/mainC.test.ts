import path = require('path');
import { tokenizeFile } from '../../lexer/tokenizeFile';
import assert from './assert';

const filePath = path.join(__dirname, '../../sample_code/main.c');
const tokenizedfile = tokenizeFile(filePath);

const expectedFormat = 

`#include <stdio.h>
#include <ctype.h>
#include <stdbool.h>
#include <string.h>
#include "ui/ui.h"
#include "handlers.h"
#include "core/data.h"

bool g_isGrayscaleModeEnabled = false;

int main(int argc, char **argv) {
  if (argc > 1 && strcmp(argv[1], "--grayscale") == 0)
    g_isGrayscaleModeEnabled = true;
  
  movie_collection_t movieCollection = { 0 };
  printhr();
  if (load_movie_collection_from_data_file(&movieCollection)) {
    printfc(TC_GREEN, "Movies loaded from data file successfully.\\n");
  } else {
    printfc(TC_YELLOW, "Failed to load movies from data file.\\n");
  }
  
  while (1) {
    ui_main_menu();
    
    char choice;
    scanf("%c", &choice);
    fflush(stdin);
    
    switch (tolower(choice)) {
      case \'a\':
        if (movieCollection.count >= 100) {
          printfc(TC_RED, "ERROR: max capacity reached\\n");
        } else {
          handle_add_movie(&movieCollection);
        }
        break;
      case \'c\':
        handle_change_movie(&movieCollection);
        break;
      case \'d\':
        handle_delete_movie(&movieCollection);
        break;
      case \'l\':
        handle_list_movies(&movieCollection);
        break;
      case \'q\':
        return save_movie_collection_to_data_file(&movieCollection) ? 0 : 1;
      default:
        printfc(TC_RED, "ERROR: invalid choice\\n");
        break;
    }
  }
  
  return -1;
}
`;

assert(tokenizedfile, expectedFormat, 'main.c');
