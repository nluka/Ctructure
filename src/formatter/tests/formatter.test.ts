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
      //console.log(stringed);
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
    multiVarDec.push(TokenType.keywordInt);
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
      'int thing = thing,\n  thing = thing,\n  thing = thing;',
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
      'if (thing != thing)\n  return thing;',
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
    assert(['thing', whileLoop], 'while (thing) {\n  thing += thing;\n}', 'while loop');
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

  ////combination
  // {
  //   const combo: TokenArray = new TokenArray(50);
  //   combo.push(TokenType.preproDirectiveInclude);
  //   combo.push(TokenType.identifier);
  //   combo.push(TokenType.preproDirectiveInclude);
  //   combo.push(TokenType.identifier);
  //   combo.push(TokenType.keywordBool);
  //   combo.push(TokenType.identifier);
  //   combo.push(TokenType.operatorBinaryAssignmentDirect);
  //   combo.push(TokenType.constantNumber);
  //   combo.push(TokenType.specialSemicolon);
  //   combo.push(TokenType.keywordInt);
  //   combo.push(TokenType.identifier);
  //   combo.push(TokenType.specialParenthesisLeft);
  //   combo.push(TokenType.keywordInt);
  //   combo.push(TokenType.identifier);
  //   combo.push(TokenType.specialComma);
  //   combo.push(TokenType.keywordChar);
  //   combo.push(TokenType.operatorUnaryDereference);
  //   combo.push(TokenType.operatorUnaryDereference);
  //   combo.push(TokenType.identifier);
  //   combo.push(TokenType.specialParenthesisRight);
  //   combo.push(TokenType.specialBraceLeft);
  //   combo.push(TokenType.keywordIf);
  //   combo.push(TokenType.specialParenthesisLeft);
  //   combo.push(TokenType.identifier);
  //   combo.push(TokenType.operatorBinaryComparisonGreaterThan);
  //   combo.push(TokenType.constantCharacter);
  //   combo.push(TokenType.operatorBinaryLogicalAnd);
  //   combo.push(TokenType.identifier);
  //   combo.push(TokenType.specialParenthesisLeft);
  //   combo.push(TokenType.identifier);
  //   combo.push(TokenType.specialBracketLeft);
  //   combo.push(TokenType.constantNumber);
  //   combo.push(TokenType.specialBracketRight);
  //   combo.push(TokenType.specialComma);
  //   combo.push(TokenType.constantNumber);
  //   combo.push(TokenType.specialParenthesisRight);
  //   combo.push(TokenType.operatorBinaryComparisonEqualTo);
  //   combo.push(TokenType.constantNumber);
  //   combo.push(TokenType.specialParenthesisRight);
  //   combo.push(TokenType.identifier);
  //   combo.push(TokenType.operatorBinaryAssignmentDirect);
  //   combo.push(TokenType.constantNumber);
  //   combo.push(TokenType.specialSemicolon);
  //   combo.push(TokenType.keywordInt);
  //   combo.push(TokenType.identifier);
  //   combo.push(TokenType.operatorBinaryAssignmentDirect);
  //   combo.push(TokenType.specialBraceLeft);
  //   combo.push(TokenType.constantNumber);
  //   combo.push(TokenType.specialBraceRight);
  //   combo.push(TokenType.specialSemicolon);
  //   combo.push(TokenType.specialBraceRight);
  //   assert(
  //     ['thing', combo],
  //     "#include thing\n#include thing\nbool thing = thing;\nint thing(int thing, char **thing) {\n  if (thing > thing && thing(thing[thing], thing) == thing)\n    thing = thing;\n\n  int thing = { thing };\n}",
  //     'combo',
  //   );
  // }

  //read file, tokenize, format
  {
   // const filePath = '/Users/justinallard/Documents/GitHub/Ctructure/src/sample_code/str.c';
    const filePath = path.join(__dirname, '../../sample_code/str.c');
    const tokenizedfile = tokenizeFile(filePath);
    assert(tokenizedfile, "#include <string.h>\n#include <stdio.h>\n#include \"str.h\"\n\n/*\n  constructs a string and returns it, allocating enough memory to hold\n  `initialCount` chars (`initialCount` does not include nul-terminator)\n*/\nstring_t string_create(const size_t initialCount) {\n  string_t string;\n  \n  if (initialCount == 0) {\n    string.data = NULL;\n    string.availableCount = 0;\n  } else {\n    string.data = calloc(initialCount+1, sizef(char ));\n    string.availableCount = string.data == NULL ? 0 : initialCount;\n  }\n  string.count = 0;\n  \n  return string;\n}\n\n/*\n  resizes `data` by `expansionAmount`, returns boolean indicating whether\n  expansion was successful\n*/\nbool string_expand(string_t *const string, const size_t expansionAmount) {\n  const size_t newAvailableCount = string->availableCount+expansionAmount;\n  \n  string->data = realloc(string->data, newAvailableCount+1);\n  if (string->data == NULL) {\n    return false;\n  }\n  \n  // zero-init new chars\n  memset(string->data+string->availableCount, 0, expansionAmount);\n  string->availableCount = newAvailableCount;\n  return true;\n}\n\n/*\n  attempts to append `charCount` characters from `chars` to `string`,\n  returns boolean indicating whether append was successful\n*/\nbool string_append_chars(\n  string_t *const string,\n  const char *const chars,\n  const size_t charCount\n) {\n  const longlongint overflowCount = (string->count+charCount)-string->availableCount;\n  if (overflowCount > 0 && !string_expand(string, overflowCount)) {\n    return false;\n  }\n  \n  const bool wasAppendSuccessful = snprintf(\n    string->data+string->count,\n    charCount+1,\n    \"%s\",\n    chars\n  ) > 0;\n  \n  if (wasAppendSuccessful) {\n    string->count += charCount;\n  }\n  return wasAppendSuccessful;\n}\n\n/*\n  destroys `string`, freeing `string->data`\n*/\nvoid string_destroy(string_t *const string) {\n  free(string->data);\n  string->data = NULL;\n  string->count = 0;\n  string->availableCount = 0;\n}\n", 'readfile');
  }
});