import TokenArray from '../../lexer/TokenArray';
import TokenType from '../../lexer/TokenType';
import formatFile, { toString } from '../formatter';

describe('formatter', () => {
  function assert(
    tokenizedFile: TokenArray,
    expectedFormat: string,
    name: string,
  ) {
    test(`return correct format for ${name}`, () => {
      expect(toString(formatFile(tokenizedFile))).toBe(expectedFormat);
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
    assert(singleVarDec, 'int thing = 0;', 'single var declaration');
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
      multiVarDec,
      'int thing = 0,\n  thing = 0,\n  thing = 0;',
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
      singleLineIf,
      'if (thing != 0)\n  return thing;\n',
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
    ifStatement.push(TokenType.keywordBool);
    ifStatement.push(TokenType.identifier);
    ifStatement.push(TokenType.specialSemicolon);
    ifStatement.push(TokenType.keywordReturn);
    ifStatement.push(TokenType.constantCharacter);
    ifStatement.push(TokenType.specialSemicolon);
    ifStatement.push(TokenType.specialBraceRight);
    assert(
      ifStatement,
      'if (thing != "hello") {\n  bool thing;\n  return \'J\';\n}',
      'standard if',
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
      nestedIf,
      'if (thing == 0) {\n  if (thing == 0) {\n    thing += 0;\n    thing += 0;\n  }\n}',
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
      switchStatement,
      'switch (thing) {\n  case 0:\n    char thing = "hello";\n    break;\n  case 0:\n    int thing = 0;\n    break;\n  default:\n    return \'J\';\n}',
      'switch',
    );
  }

  //for loop
  {
    const forLoop: TokenArray = new TokenArray(10);
  }

  //while loop
  {
    const whileLoop: TokenArray = new TokenArray(10);
  }

  //do while loop
  {
    const doWhileLoop: TokenArray = new TokenArray(50);
  }

  //combination
  {
    const combo: TokenArray = new TokenArray(50);
    combo.push(TokenType.preproDirectiveInclude);
    combo.push(TokenType.identifier);
    combo.push(TokenType.preproDirectiveInclude);
    combo.push(TokenType.identifier);
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
    combo.push(TokenType.keywordInt);
    combo.push(TokenType.identifier);
    combo.push(TokenType.operatorBinaryAssignmentDirect);
    combo.push(TokenType.specialBraceLeft);
    combo.push(TokenType.constantNumber);
    combo.push(TokenType.specialBraceRight);
    combo.push(TokenType.specialSemicolon);
    assert(
      combo,
      "#include thing\n#include thing\nbool thing = 0;\nint thing(int thing, char **thing) {\n  if (thing > 'J' && thing(thing[0], 0) == 0)\n    thing = 0;\n\n  int thing = { 0 };",
      'combo',
    );
  }
});

// #include 0\n#include 0\n#include 0\n#include 0\n#include 0\n\n

//   printhr();
//   if (load_movie_collection_from_data_file(&movieCollection)) {
//     printfc(TC_GREEN, "Movies loaded from data file successfully.\n");
//   } else {
//     printfc(TC_YELLOW, "Failed to load movies from data file.\n");
//   }

//   while (1) {
//     ui_main_menu();

//     char choice;
//     scanf("%c", &choice);
//     fflush(stdin);

//     switch (tolower(choice)) {
//       case 'a':
//         if (movieCollection.count >= 100) {
//           printfc(TC_RED, "ERROR: max capacity reached\n");
//         } else {
//           handle_add_movie(&movieCollection);
//         }
//         break;
//       case 'c':
//         handle_change_movie(&movieCollection);
//         break;
//       case 'd':
//         handle_delete_movie(&movieCollection);
//         break;
//       case 'l':
//         handle_list_movies(&movieCollection);
//         break;
//       case 'q':
//         return save_movie_collection_to_data_file(&movieCollection) ? 0 : 1;
//       default:
//         printfc(TC_RED, "ERROR: invalid choice\n");
//         break;
//     }
//   }

//   return -1;
// }
