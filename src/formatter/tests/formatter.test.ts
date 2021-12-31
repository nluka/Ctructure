import path = require('path');
import TokenArray from '../../lexer/TokenArray';
import { tokenizeFile } from '../../lexer/tokenizeFile';
import TokenType from '../../lexer/TokenType';
import formatFile, { toString } from '../formatter';

describe('formatter', () => {
  function assert(
    tokenizedFile: [string, TokenArray],
    expectedFormat: string,
    name: string,
  ) {
    test(`test type: ${name}`, () => {
      const stringed = toString(formatFile(tokenizedFile));
      console.log(stringed);
      expect(stringed).toBe(expectedFormat);
    });
  }

  //single var declaration
  {
    const singleVarDec: TokenArray = new TokenArray(4);
    singleVarDec.push(TokenType.keywordInt);
    singleVarDec.push(TokenType.identifier);
    singleVarDec.push(TokenType.operatorBinaryAssignmentDirect);
    singleVarDec.push(TokenType.constantNumber);
    singleVarDec.push(TokenType.specialSemicolon);
    assert(['num', singleVarDec], 'int num = num;', 'single var declaration');
  }

  //multi var declaration
  {
    const multiVarDec: TokenArray = new TokenArray(13);
    multiVarDec.push(TokenType.identifier);
    multiVarDec.push(TokenType.identifier);
    multiVarDec.push(TokenType.operatorBinaryAssignmentDirect);
    multiVarDec.push(TokenType.constantNumber);
    multiVarDec.push(TokenType.specialComma);
    multiVarDec.push(TokenType.identifier);
    multiVarDec.push(TokenType.operatorBinaryAssignmentDirect);
    multiVarDec.push(TokenType.constantNumber);
    multiVarDec.push(TokenType.specialComma);
    multiVarDec.push(TokenType.identifier);
    multiVarDec.push(TokenType.operatorBinaryAssignmentDirect);
    multiVarDec.push(TokenType.constantNumber);
    multiVarDec.push(TokenType.specialSemicolon);
    assert(
      ['thing', multiVarDec],
      'thing thing = thing,\n  thing = thing,\n  thing = thing;',
      'multi var declaration',
    );
  }

  //single line if
  {
    const singleLineIf: TokenArray = new TokenArray(9);
    singleLineIf.push(TokenType.keywordIf);
    singleLineIf.push(TokenType.specialParenthesisLeft);
    singleLineIf.push(TokenType.identifier);
    singleLineIf.push(TokenType.operatorBinaryComparisonNotEqualTo);
    singleLineIf.push(TokenType.constantNumber);
    singleLineIf.push(TokenType.specialParenthesisRight);
    singleLineIf.push(TokenType.keywordReturn);
    singleLineIf.push(TokenType.identifier);
    singleLineIf.push(TokenType.specialSemicolon);
    assert(
    ['thing', singleLineIf],
      'if (thing != thing)\n  return thing;\n',
      'single line if',
    );
  }

  //if
  {
    const ifStatement: TokenArray = new TokenArray(14);
    ifStatement.push(TokenType.keywordIf);
    ifStatement.push(TokenType.specialParenthesisLeft);
    ifStatement.push(TokenType.identifier);
    ifStatement.push(TokenType.operatorBinaryComparisonNotEqualTo);
    ifStatement.push(TokenType.constantString);
    ifStatement.push(TokenType.specialParenthesisRight);
    ifStatement.push(TokenType.specialBraceLeft);
    ifStatement.push(TokenType.keywordReturn);
    ifStatement.push(TokenType.constantCharacter);
    ifStatement.push(TokenType.specialSemicolon);
    ifStatement.push(TokenType.specialBraceRight);
    assert(
      ['thing', ifStatement],
      'if (thing != thing) {\n  return thing;\n}',
      'standard if',
    );
  }

  //if, else if, else
  {
    const ifelseStatement: TokenArray = new TokenArray(35);
    ifelseStatement.push(TokenType.keywordIf);
    ifelseStatement.push(TokenType.specialParenthesisLeft);
    ifelseStatement.push(TokenType.identifier);
    ifelseStatement.push(TokenType.operatorBinaryComparisonNotEqualTo);
    ifelseStatement.push(TokenType.constantString);
    ifelseStatement.push(TokenType.specialParenthesisRight);
    ifelseStatement.push(TokenType.specialBraceLeft);
    ifelseStatement.push(TokenType.keywordBool);
    ifelseStatement.push(TokenType.identifier);
    ifelseStatement.push(TokenType.specialSemicolon);
    ifelseStatement.push(TokenType.keywordReturn);
    ifelseStatement.push(TokenType.constantCharacter);
    ifelseStatement.push(TokenType.specialSemicolon);
    ifelseStatement.push(TokenType.specialBraceRight);
    ifelseStatement.push(TokenType.keywordElse);
    ifelseStatement.push(TokenType.keywordIf);
    ifelseStatement.push(TokenType.specialParenthesisLeft);
    ifelseStatement.push(TokenType.identifier);
    ifelseStatement.push(TokenType.operatorBinaryComparisonNotEqualTo);
    ifelseStatement.push(TokenType.constantNumber);
    ifelseStatement.push(TokenType.specialParenthesisRight);
    ifelseStatement.push(TokenType.specialBraceLeft);
    ifelseStatement.push(TokenType.keywordInt);
    ifelseStatement.push(TokenType.identifier);
    ifelseStatement.push(TokenType.specialSemicolon);
    ifelseStatement.push(TokenType.keywordReturn);
    ifelseStatement.push(TokenType.constantString);
    ifelseStatement.push(TokenType.specialSemicolon);
    ifelseStatement.push(TokenType.specialBraceRight);
    ifelseStatement.push(TokenType.keywordElse);
    ifelseStatement.push(TokenType.specialBraceLeft);
    ifelseStatement.push(TokenType.keywordReturn);
    ifelseStatement.push(TokenType.constantCharacter);
    ifelseStatement.push(TokenType.specialSemicolon);
    ifelseStatement.push(TokenType.specialBraceRight);
    assert(
      ['thing', ifelseStatement],
      'if (thing != thing) {\n  bool thing;\n  return thing;\n} else if (thing != thing) {\n  int thing;\n  return thing;\n} else {\n  return thing;\n}',
      'if else',
    );
  }

  //nested if
  {
    const nestedIf: TokenArray = new TokenArray(24);
    nestedIf.push(TokenType.keywordIf);
    nestedIf.push(TokenType.specialParenthesisLeft);
    nestedIf.push(TokenType.identifier);
    nestedIf.push(TokenType.operatorBinaryComparisonEqualTo);
    nestedIf.push(TokenType.constantNumber);
    nestedIf.push(TokenType.specialParenthesisRight);
    nestedIf.push(TokenType.specialBraceLeft);
    nestedIf.push(TokenType.keywordIf);
    nestedIf.push(TokenType.specialParenthesisLeft);
    nestedIf.push(TokenType.identifier);
    nestedIf.push(TokenType.operatorBinaryComparisonEqualTo);
    nestedIf.push(TokenType.constantNumber);
    nestedIf.push(TokenType.specialParenthesisRight);
    nestedIf.push(TokenType.specialBraceLeft);
    nestedIf.push(TokenType.identifier);
    nestedIf.push(TokenType.operatorBinaryAssignmentAddition);
    nestedIf.push(TokenType.constantNumber);
    nestedIf.push(TokenType.specialSemicolon);
    nestedIf.push(TokenType.identifier);
    nestedIf.push(TokenType.operatorBinaryAssignmentAddition);
    nestedIf.push(TokenType.constantNumber);
    nestedIf.push(TokenType.specialSemicolon);
    nestedIf.push(TokenType.specialBraceRight);
    nestedIf.push(TokenType.specialBraceRight);
    assert(
      ['thing', nestedIf],
      'if (thing == thing) {\n  if (thing == thing) {\n    thing += thing;\n    thing += thing;\n  }\n}',
      'nested if',
    );
  }

  //switch
  {
    const switchStatement: TokenArray = new TokenArray(31);
    switchStatement.push(TokenType.keywordSwitch);
    switchStatement.push(TokenType.specialParenthesisLeft);
    switchStatement.push(TokenType.identifier);
    switchStatement.push(TokenType.specialParenthesisRight);
    switchStatement.push(TokenType.specialBraceLeft);
    switchStatement.push(TokenType.keywordCase);
    switchStatement.push(TokenType.constantNumber);
    switchStatement.push(TokenType.operatorTernaryColon);
    switchStatement.push(TokenType.keywordChar);
    switchStatement.push(TokenType.identifier);
    switchStatement.push(TokenType.operatorBinaryAssignmentDirect);
    switchStatement.push(TokenType.constantString);
    switchStatement.push(TokenType.specialSemicolon);
    switchStatement.push(TokenType.keywordBreak);
    switchStatement.push(TokenType.specialSemicolon);
    switchStatement.push(TokenType.keywordCase);
    switchStatement.push(TokenType.constantNumber);
    switchStatement.push(TokenType.operatorTernaryColon);
    switchStatement.push(TokenType.keywordInt);
    switchStatement.push(TokenType.identifier);
    switchStatement.push(TokenType.operatorBinaryAssignmentDirect);
    switchStatement.push(TokenType.constantNumber);
    switchStatement.push(TokenType.specialSemicolon);
    switchStatement.push(TokenType.keywordBreak);
    switchStatement.push(TokenType.specialSemicolon);
    switchStatement.push(TokenType.keywordDefault);
    switchStatement.push(TokenType.operatorTernaryColon);
    switchStatement.push(TokenType.keywordReturn);
    switchStatement.push(TokenType.constantCharacter);
    switchStatement.push(TokenType.specialSemicolon);
    switchStatement.push(TokenType.newline);
    switchStatement.push(TokenType.specialBraceRight);

    assert(
      ['thing', switchStatement],
      'switch (thing) {\n  case thing:\n    char thing = thing;\n    break;\n  case thing:\n    int thing = thing;\n    break;\n  default:\n    return thing;\n}',
      'switch',
    );
  }

  //for loop
  {
    const forLoop: TokenArray = new TokenArray(19);
    forLoop.push(TokenType.keywordFor);
    forLoop.push(TokenType.specialParenthesisLeft);
    forLoop.push(TokenType.keywordInt);
    forLoop.push(TokenType.identifier);
    forLoop.push(TokenType.operatorBinaryAssignmentDirect);
    forLoop.push(TokenType.constantNumber);
    forLoop.push(TokenType.specialSemicolon);
    forLoop.push(TokenType.identifier);
    forLoop.push(TokenType.operatorBinaryComparisonGreaterThan);
    forLoop.push(TokenType.constantNumber);
    forLoop.push(TokenType.specialSemicolon);
    forLoop.push(TokenType.operatorUnaryArithmeticIncrementPrefix);
    forLoop.push(TokenType.identifier);
    forLoop.push(TokenType.specialParenthesisRight);
    forLoop.push(TokenType.specialBraceLeft);
    forLoop.push(TokenType.operatorUnaryArithmeticDecrementPrefix);
    forLoop.push(TokenType.identifier);
    forLoop.push(TokenType.specialSemicolon);
    forLoop.push(TokenType.specialBraceRight);
    assert(
      ['thing', forLoop],
      'for (int thing = thing; thing > thing; ++thing) {\n  --thing;\n}',
      'for loop',
    );
  }

  //while loop
  {
    const whileLoop: TokenArray = new TokenArray(10);
    whileLoop.push(TokenType.keywordWhile);
    whileLoop.push(TokenType.specialParenthesisLeft);
    whileLoop.push(TokenType.identifier);
    whileLoop.push(TokenType.specialParenthesisRight);
    whileLoop.push(TokenType.specialBraceLeft);
    whileLoop.push(TokenType.identifier);
    whileLoop.push(TokenType.operatorBinaryAssignmentAddition);
    whileLoop.push(TokenType.constantNumber);
    whileLoop.push(TokenType.specialSemicolon);
    whileLoop.push(TokenType.specialBraceRight);
    whileLoop.push(TokenType.newline);
    assert(['thing', whileLoop], 'while (thing) {\n  thing += thing;\n}\n', 'while loop');
  }

  //do while loop
  {
    const doWhileLoop: TokenArray = new TokenArray(12);
    doWhileLoop.push(TokenType.keywordDo);
    doWhileLoop.push(TokenType.specialBraceLeft);
    doWhileLoop.push(TokenType.identifier);
    doWhileLoop.push(TokenType.operatorBinaryAssignmentAddition);
    doWhileLoop.push(TokenType.constantNumber);
    doWhileLoop.push(TokenType.specialSemicolon);
    doWhileLoop.push(TokenType.specialBraceRight);
    doWhileLoop.push(TokenType.keywordWhile);
    doWhileLoop.push(TokenType.specialParenthesisLeft);
    doWhileLoop.push(TokenType.identifier);
    doWhileLoop.push(TokenType.specialParenthesisRight);
    doWhileLoop.push(TokenType.specialSemicolon);
    assert(
      ['thing', doWhileLoop],
      'do {\n  thing += thing;\n} while (thing);',
      'do while loop',
    );
  }

  //combination
  {
    const combo: TokenArray = new TokenArray(50);
    combo.push(TokenType.preproDirectiveInclude);
    combo.push(TokenType.preproStandardHeader);
    combo.push(TokenType.preproDirectiveInclude);
    combo.push(TokenType.preproStandardHeader);
    combo.push(TokenType.keywordBool);
    combo.push(TokenType.identifier);
    combo.push(TokenType.operatorBinaryAssignmentDirect);
    combo.push(TokenType.constantNumber);
    combo.push(TokenType.specialSemicolon);
    combo.push(TokenType.keywordInt);
    combo.push(TokenType.identifier);
    combo.push(TokenType.specialParenthesisLeft);
    combo.push(TokenType.keywordInt);
    combo.push(TokenType.identifier);
    combo.push(TokenType.specialComma);
    combo.push(TokenType.keywordChar);
    combo.push(TokenType.operatorUnaryDereference);
    combo.push(TokenType.operatorUnaryDereference);
    combo.push(TokenType.identifier);
    combo.push(TokenType.specialParenthesisRight);
    combo.push(TokenType.specialBraceLeft);
    combo.push(TokenType.keywordIf);
    combo.push(TokenType.specialParenthesisLeft);
    combo.push(TokenType.identifier);
    combo.push(TokenType.operatorBinaryComparisonGreaterThan);
    combo.push(TokenType.constantCharacter);
    combo.push(TokenType.operatorBinaryLogicalAnd);
    combo.push(TokenType.identifier);
    combo.push(TokenType.specialParenthesisLeft);
    combo.push(TokenType.identifier);
    combo.push(TokenType.specialBracketLeft);
    combo.push(TokenType.constantNumber);
    combo.push(TokenType.specialBracketRight);
    combo.push(TokenType.specialComma);
    combo.push(TokenType.constantNumber);
    combo.push(TokenType.specialParenthesisRight);
    combo.push(TokenType.operatorBinaryComparisonEqualTo);
    combo.push(TokenType.constantNumber);
    combo.push(TokenType.specialParenthesisRight);
    combo.push(TokenType.identifier);
    combo.push(TokenType.operatorBinaryAssignmentDirect);
    combo.push(TokenType.constantNumber);
    combo.push(TokenType.specialSemicolon);
    combo.push(TokenType.newline);
    combo.push(TokenType.newline);
    combo.push(TokenType.keywordInt);
    combo.push(TokenType.identifier);
    combo.push(TokenType.operatorBinaryAssignmentDirect);
    combo.push(TokenType.specialBraceLeft);
    combo.push(TokenType.constantNumber);
    combo.push(TokenType.specialBraceRight);
    combo.push(TokenType.specialSemicolon);
    combo.push(TokenType.specialBraceRight);
    assert(
      ['thing', combo],
      "#include thing\n#include thing\nbool thing = thing;\nint thing(int thing, char **thing) {\n  if (thing > thing && thing(thing[thing], thing) == thing)\n    thing = thing;\n  \n  int thing = { thing };\n}",
      'combo',
    );
  }

  //read file, tokenize, format
  {
    const filePath = path.join(__dirname, '../../sample_code/str.c');
    const tokenizedfile = tokenizeFile(filePath);
    assert(tokenizedfile, "#include <string.h>\n#include <stdio.h>\n#include \"str.h\"\n\n/*\n  constructs a string and returns it, allocating enough memory to hold\n  `initialCount` chars (`initialCount` does not include nul-terminator)\n*/\nstring_t string_create(const size_t initialCount) {\n  string_t string;\n  \n  if (initialCount == 0) {\n    string.data = NULL;\n    string.availableCount = 0;\n  } else {\n    string.data = calloc(initialCount + 1, sizef(char));\n    string.availableCount = string.data == NULL ? 0 : initialCount;\n  }\n  string.count = 0;\n  \n  return string;\n}\n\n/*\n  resizes `data` by `expansionAmount`, returns boolean indicating whether\n  expansion was successful\n*/\nbool string_expand(string_t *const string, const size_t expansionAmount) {\n  const size_t newAvailableCount = string->availableCount + expansionAmount;\n  \n  string->data = realloc(string->data, newAvailableCount + 1);\n  if (string->data == NULL) {\n    return false;\n  }\n  \n  // zero-init new chars\n  memset(string->data + string->availableCount, 0, expansionAmount);\n  string->availableCount = newAvailableCount;\n  return true;\n}\n\n/*\n  attempts to append `charCount` characters from `chars` to `string`,\n  returns boolean indicating whether append was successful\n*/\nbool string_append_chars(\n  string_t *const string,\n  const char *const chars,\n  const size_t charCount\n) {\n  const longlongint overflowCount = (string->count + charCount)-string->availableCount;\n  if (overflowCount > 0 && !string_expand(string, overflowCount)) {\n    return false;\n  }\n  \n  const bool wasAppendSuccessful = snprintf(\n    string->data + string->count,\n    charCount + 1,\n    \"%s\",\n    chars\n  ) > 0;\n  \n  if (wasAppendSuccessful) {\n    string->count += charCount;\n  }\n  return wasAppendSuccessful;\n}\n\n/*\n  destroys `string`, freeing `string->data`\n*/\nvoid string_destroy(string_t *const string) {\n  free(string->data);\n  string->data = NULL;\n  string->count = 0;\n  string->availableCount = 0;\n}\n", 'str.c');
  }

  {
    const filePath = path.join(__dirname, '../../sample_code/str.h');
    const tokenizedfile = tokenizeFile(filePath);
    assert(tokenizedfile, "#ifndef STR_H\n#define STR_H\n\n#include <stdbool.h>\n#include <stdlib.h>\n\ntypedef struct string{\n  char *data;\n  \n  // the number of chars (excluding nul-terminator) stored in `data`\n  size_t count;\n  \n  /*\n    the number of chars (excluding nul-terminator)\n    that can be stored in `data` without resizing\n   */\n  size_t availableCount;\n} string_t;\n\nstring_t string_create(size_t initialLength);\n\nbool string_expand(string_t *string, size_t expansionAmount);\n\nbool string_append_chars(\n  string_t *string,\n  const char *appendChars,\n  size_t appendCharsSize\n);\n\nbool string_append_number(\n  string_t *string,\n  const char *numberFormat,\n  const void *number\n);\n\nvoid string_destroy(string_t *string);\n\n#endif // STR_H\n", 'str.h');
  }

  {
    const filePath = path.join(__dirname, '../../sample_code/header_with_guards.h');
    const tokenizedfile = tokenizeFile(filePath);
    assert(tokenizedfile, "#ifndef HEADER_WITH_GUARDS_H\n#define HEADER_WITH_GUARDS_H\n\n#include <stdbool.h>\n\nbool func1(void);\nbool func2();\n\n#endif // HEADER_WITH_GUARDS_H\n", 'header_with_guard.h');
  }

  {
    const filePath = path.join(__dirname, '../../sample_code/hello_world.c');
    const tokenizedfile = tokenizeFile(filePath);
    assert(tokenizedfile, '#include <stdio.h>\n\nint main(int argc, char **argv) {\n  printf("Hello World!\\n");\n  return 0;\n}\n', 'hello_world.c');
  }

  {
    const filePath = path.join(__dirname, '../../sample_code/main.c');
    const tokenizedfile = tokenizeFile(filePath);
    assert(tokenizedfile, '#include <stdio.h>\n#include <ctype.h>\n#include <stdbool.h>\n#include <string.h>\n#include "ui/ui.h"\n#include "handlers.h"\n#include "core/data.h"\n\nbool g_isGrayscaleModeEnabled = false;\n\nint main(int argc, char **argv) {\n  if (argc > 1 && strcmp(argv[1], "--grayscale") == 0)\n    g_isGrayscaleModeEnabled = true;\n  \n  movie_collection_t movieCollection = { 0 };\n  printhr();\n  if (load_movie_collection_from_data_file(&movieCollection)) {\n    printfc(TC_GREEN, "Movies loaded from data file successfully.\\n");\n  } else {\n    printfc(TC_YELLOW, "Failed to load movies from data file.\\n");\n  }\n  \n  while (1) {\n    ui_main_menu();\n    \n    char choice;\n    scanf("%c", &choice);\n    fflush(stdin);\n    \n    switch (tolower(choice)) {\n      case \'a\':\n        if (movieCollection.count >= 100) {\n          printfc(TC_RED, "ERROR: max capacity reached\\n");\n        } else {\n          handle_add_movie(&movieCollection);\n        }\n        break;\n      case \'c\':\n        handle_change_movie(&movieCollection);\n        break;\n      case \'d\':\n        handle_delete_movie(&movieCollection);\n        break;\n      case \'l\':\n        handle_list_movies(&movieCollection);\n        break;\n      case \'q\':\n        return save_movie_collection_to_data_file(&movieCollection) ? 0 : 1;\n      default:\n        printfc(TC_RED, "ERROR: invalid choice\\n");\n        break;\n    }\n  }\n  \n  return -1;\n}\n', 'main.c');
  }

  // {
  //   const filePath = path.join(__dirname, '../../sample_code/movie_operations.c');
  //   const tokenizedfile = tokenizeFile(filePath);
  //   assert(tokenizedfile,'#include <stdio.h>\n#include <ctype.h>\n#include <stdlib.h>\n#include <string.h>\n#include "movie_operations.h"\n#include "print.h"\n\n#define MAX_MOVIE_QUANTITY_DIGITS 10\n#define MAX_MOVIE_PRICE_DIGITS 6\n\n// returns true if a value was inputted, false otherwise\nbool ui_get_movie_id_type(MovieIdType_t *const out) {\n  char input;\n  \n  while (1) {\n    printhr();\n    printf(\n      "Choose movie ID type (\'u\' = UPC, \'s\' = SKU, leave blank to abort)\\n"\n    );\n    printfc(TC_MAGENTA, "> ");\n    \n    scanf("%c", &input);\n    fflush(stdin);\n    \n    const bool wasValueInputted = input != \'\\n\';\n    if (!wasValueInputted) {\n      return false;\n    }\n    \n    if (input == \'u\') {\n      *out = MIT_UPC;\n    } else if (input == \'s\') {\n      *out = MIT_SKU;\n    } else {\n      printfc(TC_RED, "ERROR: invalid movie ID type choice\\n");\n      continue;\n    }\n    return true;\n  }\n}\n\n// returns true if a value was inputted, false otherwise\nbool ui_get_unique_movie_id(\n  const MovieIdType_t idType,\n  const movie_collection_t *const collection,\n  char *const out\n) {\n  while (1) {\n    printhr();\n    printf(\n      "Enter movie %s (max. 12 digits, leave blank to abort)\\n",\n      idType == MIT_UPC ? "UPC" : "SKU"\n    );\n    printfc(TC_MAGENTA, "> ");\n    \n    fgets(out, MAX_MOVIE_ID_LENGTH + 1, stdin);\n    fflush(stdin);\n    \n    const bool wasValueInputted = out[0] != \'\\n\';\n    if (!wasValueInputted) {\n      return false;\n    }\n    \n    out[strcspn(out, "\\n")] = \'\\0\'; // remove captured newline from fgets\n    \n    if (movie_collection_find_immut(collection, idType, out)) {\n      printfc(TC_RED, "ERROR: ID already in use\\n");\n    } else {\n      return true;\n    }\n  }\n}\n\n// returns NULL if no value was inputted\nmovie_t *ui_get_existing_movie_by_id(\n  const MovieIdType_t idType,\n  movie_collection_t *const collection\n) {\n  char input[MAX_MOVIE_ID_LENGTH + 1] = { 0 };\n  \n  while (1) {\n    printhr();\n    printf(\n      "Enter movie %s (max. 12 digits, leave blank to abort)\\n",\n      idType == MIT_UPC ? "UPC" : "SKU"\n    );\n    printfc(TC_MAGENTA, "> ");\n    \n    fgets(input, MAX_MOVIE_ID_LENGTH + 1, stdin);\n    fflush(stdin);\n    \n    const bool wasValueInputted = input[0] != \'\\n\';\n    if (!wasValueInputted) {\n      return NULL;\n    }\n    \n    input[strcspn(input, "\\n")] = \'\\0\'; // remove captured newline from fgets\n    \n    movie_t *const movie = movie_collection_find(collection, idType, input);\n    if (movie == NULL) {\n      printfc(TC_RED, "ERROR: movie not found\\n");\n    } else {\n      return movie;\n    }\n  }\n}\n\n// returns true if a value was inputted, false otherwise\nbool ui_get_movie_name(char *const out) {\n  printhr();\n  printf("Enter movie name (max. 30 chars, leave blank to abort)\\n");\n  printfc(TC_MAGENTA, "> ");\n  \n  fgets(out, MAX_MOVIE_NAME_LENGTH + 1, stdin);\n  fflush(stdin);\n  \n  const bool wasValueInputted = out[0] != \'\\n\';\n  out[strcspn(out, "\\n")] = \'\\0\'; // remove captured newline from fgets\n  return wasValueInputted;\n}\n\n// returns true if a value was inputted, false otherwise\nbool ui_get_movie_quantity(int *const out) {\n  char input[MAX_MOVIE_QUANTITY_DIGITS + 1];\n  int quantityInput;\n  \n  while (1) {\n    printhr();\n    printf("Enter movie quantity (max. 10 digits, leave blank to abort)\\n");\n    printfc(TC_MAGENTA, "> ");\n    \n    fgets(input, MAX_MOVIE_QUANTITY_DIGITS + 1, stdin);\n    fflush(stdin);\n    \n    const bool wasValueInputted = input[0] != \'\\n\';\n    if (!wasValueInputted) {\n      return false;\n    }\n    \n    input[strcspn(input, "\\n")] = \'\\0\'; // remove captured newline from fgets\n    \n    quantityInput = atoi(input);\n    if (quantityInput <= 0) {\n      printfc(TC_RED, "ERROR: quantity must be > 0\\n");\n      continue;\n    } else {\n      *out = quantityInput;\n      return true;\n    }\n  }\n}\n\n// returns true if a value was inputted, false otherwise\nbool ui_get_movie_price(double *const out) {\n  char input[MAX_MOVIE_PRICE_DIGITS + 1];\n  double priceInput;\n  \n  while (1) {\n    printhr();\n    printf("Enter movie price (max. 6 chars, leave blank to abort)\\n");\n    printfc(TC_MAGENTA, "> ");\n    \n    fgets(input, MAX_MOVIE_PRICE_DIGITS + 1, stdin);\n    fflush(stdin);\n    \n    const bool wasValueInputted = input[0] != \'\\n\';\n    if (!wasValueInputted) {\n      return false;\n    }\n    \n    input[strcspn(input, "\\n")] = \'\\0\'; // remove captured newline from fgets\n    \n    priceInput = atof(input);\n    if (priceInput <= 0) {\n      printfc(TC_RED, "ERROR: price must be > 0\\n");\n      continue;\n    } else {\n      *out = priceInput;\n      return true;\n    }\n  }\n}\n\nvoid ui_display_movie_collection(const movie_collection_t *const collection) {\n  ui_display_movie_table_heading();\n  for (int i = 0; i < collection->count; ++i) {\n    const movie_t *const movie = &collection->records[i];\n    ui_display_movie(movie);\n  }\n}\n\nvoid ui_display_movie_table_heading() {\n  printfc(\n    TC_DARK_GRAY,\n    "Movie Name                      Identifier        Quantity    Price\\n"\n  );\n  // printf("------------------------------  ----------------  ----------  ----------\\n");\n}\n\nvoid ui_display_movie(const movie_t *const movie) {\n  printf(\n    "%-30s  %s|%-12s  %-10d  $%-.2lf\\n",\n    movie->name,\n    movie->id.type == MIT_UPC ? "UPC" : "SKU",\n    movie->id.value,\n    movie->quantity,\n    movie->price\n  );\n}\n\nvoid ui_display_movie_changes(\n  const movie_t *const before,\n  const movie_t *const after\n) {\n  const bool wasNameChanged = strcmp(before->name, after->name) != 0,\n    wasQuantityChanged = before->quantity != after->quantity,\n    wasPriceChanged = before->price != after->price;\n  \n  printhr();\n  printf("Movie changes:");\n  if (!wasNameChanged && !wasQuantityChanged && !wasPriceChanged) {\n    printf(" none\\n");\n    return;\n  }\n  printf("\\n");\n  \n  ui_display_movie_table_heading();\n  ui_display_movie(after);\n  \n  if (wasNameChanged) {\n    printfc(TC_YELLOW, "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");\n  } else {\n    printf("                              ");\n  }\n  printf("                    ");\n  if (wasQuantityChanged) {\n    printfc(TC_YELLOW, "^^^^^^^^^^");\n  } else {\n    printf("          ");\n  }\n  printf("  ");\n  if (wasPriceChanged) {\n    printfc(TC_YELLOW, "^^^^^^^^^^");\n  }\n  printf("\\n");\n  \n  ui_display_movie(before);\n}\n', 'movie_operations.c' );
  // }

  {
    const filePath = path.join(__dirname, '../../sample_code/handle_change_movie.c');
    const tokenizedfile = tokenizeFile(filePath);
    assert(tokenizedfile, '#include <stdlib.h>\n#include <string.h>\n#include \"handlers.h\"\n#include \"ui/ui.h\"\n\nvoid handle_change_movie(movie_collection_t *const collection) {\n  MovieIdType_t idType;\n  if (!ui_get_movie_id_type(&idType))\n    goto abort_update;\n  \n  movie_t *const movie = ui_get_existing_movie_by_id(idType, collection);\n  if (movie == NULL)\n    goto abort_update;\n  \n  const movie_t before = *movie;\n  \n  char nameInput[MAX_MOVIE_NAME_LENGTH + 1];\n  if (ui_get_movie_name(nameInput))\n    strncpy(movie->name, nameInput, MAX_MOVIE_NAME_LENGTH + 1);\n  \n  int quantityInput;\n  if (ui_get_movie_quantity(&quantityInput))\n    movie->quantity = quantityInput;\n  \n  double priceInput;\n  if (ui_get_movie_price(&priceInput))\n    movie->price = priceInput;\n  \n  ui_display_movie_changes(&before, movie);\n  return;\n  \n  abort_update:printfc(TC_YELLOW, \"Movie update aborted!\\n\");\n  return;\n}\n', 'handle_change_movie.c');
  }

  {
    const filePath = path.join(__dirname, '../../sample_code/handle_add_movie.c');
    const tokenizedfile = tokenizeFile(filePath);
    assert(tokenizedfile, '#include "handlers.h"\n#include "ui/ui.h"\n\nvoid handle_add_movie(movie_collection_t *const collection) {\n  MovieIdType_t idType;\n  if (!ui_get_movie_id_type(&idType))\n    goto abort_addition;\n  \n  char idInput[MAX_MOVIE_ID_LENGTH + 1];\n  if (!ui_get_unique_movie_id(idType, collection, idInput))\n    goto abort_addition;\n  \n  char nameInput[MAX_MOVIE_NAME_LENGTH + 1];\n  if (!ui_get_movie_name(nameInput))\n    goto abort_addition;\n  \n  int quantityInput;\n  if (!ui_get_movie_quantity(&quantityInput))\n    goto abort_addition;\n  \n  double priceInput;\n  if (!ui_get_movie_price(&priceInput))\n    goto abort_addition;\n  \n  const bool wasMovieAdded = movie_collection_add(\n    collection,\n    idType,\n    idInput,\n    nameInput,\n    quantityInput,\n    priceInput\n  );\n  printfc(TC_GREEN, "Movie added successfully.\\n");\n  return;\n  \n  abort_addition:printfc(TC_YELLOW, "Movie addition aborted!\\n");\n  return;\n}\n', 'handle_add_movie.c');
  }

});