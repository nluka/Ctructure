import TokenArray from '../../lexer/TokenArray';
import TokenType from '../../lexer/TokenType';
import formatFile, { toString } from '../formatter';

describe('formatter', () => {
  function assert(tokenizedFile: TokenArray, expectedFormat: string) {
    test(`return correct format`, () => {
      expect(toString(formatFile(tokenizedFile))).toBe(expectedFormat);
    });
  }

  test('placeholder', () => {
    expect(1).toBe(1);
  });

  //single var declaration
  {
    const singleVarDec: TokenArray = new TokenArray(4);
    singleVarDec.push(TokenType.keywordInt);
    singleVarDec.push(TokenType.label);
    singleVarDec.push(TokenType.operatorBinaryAssignmentDirect);
    singleVarDec.push(TokenType.constantNumber);
    singleVarDec.push(TokenType.specialSemicolon);
    assert(singleVarDec, 'int thing = 0;');
  }

  //multi var declaration
  {
    const multiVarDec: TokenArray = new TokenArray(13);
    multiVarDec.push(TokenType.keywordInt);
    multiVarDec.push(TokenType.label);
    multiVarDec.push(TokenType.operatorBinaryAssignmentDirect);
    multiVarDec.push(TokenType.constantNumber);
    multiVarDec.push(TokenType.specialComma);
    multiVarDec.push(TokenType.label);
    multiVarDec.push(TokenType.operatorBinaryAssignmentDirect);
    multiVarDec.push(TokenType.constantNumber);
    multiVarDec.push(TokenType.specialComma);
    multiVarDec.push(TokenType.label);
    multiVarDec.push(TokenType.operatorBinaryAssignmentDirect);
    multiVarDec.push(TokenType.constantNumber);
    multiVarDec.push(TokenType.specialSemicolon);
    assert(multiVarDec, 'int thing = 0,\n  thing = 0,\n  thing = 0;');
  }

  //single line if
  {
    const singleLineIf: TokenArray = new TokenArray(9);
    singleLineIf.push(TokenType.keywordIf);
    singleLineIf.push(TokenType.specialParenthesisLeft);
    singleLineIf.push(TokenType.label);
    singleLineIf.push(TokenType.operatorBinaryComparisonNotEqualTo);
    singleLineIf.push(TokenType.constantNumber);
    singleLineIf.push(TokenType.specialParenthesisRight);
    singleLineIf.push(TokenType.keywordReturn);
    singleLineIf.push(TokenType.label);
    singleLineIf.push(TokenType.specialSemicolon);
    assert(singleLineIf, 'if (thing != 0)\n  return thing;\n');
  }

  //if
  {
    const ifStatement: TokenArray = new TokenArray(14);
    ifStatement.push(TokenType.keywordIf);
    ifStatement.push(TokenType.specialParenthesisLeft);
    ifStatement.push(TokenType.label);
    ifStatement.push(TokenType.operatorBinaryComparisonNotEqualTo);
    ifStatement.push(TokenType.constantString);
    ifStatement.push(TokenType.specialParenthesisRight);
    ifStatement.push(TokenType.specialBraceLeft);
    ifStatement.push(TokenType.keywordBool);
    ifStatement.push(TokenType.label);
    ifStatement.push(TokenType.specialSemicolon);
    ifStatement.push(TokenType.keywordReturn);
    ifStatement.push(TokenType.constantCharacter);
    ifStatement.push(TokenType.specialSemicolon);
    ifStatement.push(TokenType.specialBraceRight);
    assert(
      ifStatement,
      'if (thing != "hello") {\n  bool thing;\n  return \'J\';\n}',
    );
  }

  //nested if
  {
    const nestedIf: TokenArray = new TokenArray(24);
    nestedIf.push(TokenType.keywordIf);
    nestedIf.push(TokenType.specialParenthesisLeft);
    nestedIf.push(TokenType.label);
    nestedIf.push(TokenType.operatorBinaryComparisonEqualTo);
    nestedIf.push(TokenType.constantNumber);
    nestedIf.push(TokenType.specialParenthesisRight);
    nestedIf.push(TokenType.specialBraceLeft);
    nestedIf.push(TokenType.keywordIf);
    nestedIf.push(TokenType.specialParenthesisLeft);
    nestedIf.push(TokenType.label);
    nestedIf.push(TokenType.operatorBinaryComparisonEqualTo);
    nestedIf.push(TokenType.constantNumber);
    nestedIf.push(TokenType.specialParenthesisRight);
    nestedIf.push(TokenType.specialBraceLeft);
    nestedIf.push(TokenType.label);
    nestedIf.push(TokenType.operatorBinaryAssignmentAddition);
    nestedIf.push(TokenType.constantNumber);
    nestedIf.push(TokenType.specialSemicolon);
    nestedIf.push(TokenType.label);
    nestedIf.push(TokenType.operatorBinaryAssignmentAddition);
    nestedIf.push(TokenType.constantNumber);
    nestedIf.push(TokenType.specialSemicolon);
    nestedIf.push(TokenType.specialBraceRight);
    nestedIf.push(TokenType.specialBraceRight);
    assert(
      nestedIf,
      'if (thing == 0) {\n  if (thing == 0) {\n    thing += 0;\n    thing += 0;\n  }\n}',
    );
  }

  //switch
  {
    const switchStatement: TokenArray = new TokenArray(10);
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
    combo.push(TokenType.label);
    combo.push(TokenType.preproDirectiveInclude);
    combo.push(TokenType.label);
    combo.push(TokenType.keywordBool);
    combo.push(TokenType.label);
    combo.push(TokenType.operatorBinaryAssignmentDirect);
    combo.push(TokenType.constantNumber);
    combo.push(TokenType.specialSemicolon);
    combo.push(TokenType.keywordInt);
    combo.push(TokenType.label);
    combo.push(TokenType.specialParenthesisLeft);
    combo.push(TokenType.keywordInt);
    combo.push(TokenType.label);
    combo.push(TokenType.specialComma);
    combo.push(TokenType.keywordChar);
    combo.push(TokenType.operatorUnaryDereference);
    combo.push(TokenType.operatorUnaryDereference);
    combo.push(TokenType.label);
    combo.push(TokenType.specialParenthesisRight);
    combo.push(TokenType.specialBraceLeft);
    combo.push(TokenType.keywordIf);
    combo.push(TokenType.specialParenthesisLeft);
    combo.push(TokenType.label);
    combo.push(TokenType.operatorBinaryComparisonGreaterThan);
    combo.push(TokenType.constantCharacter);
    combo.push(TokenType.operatorBinaryLogicalAnd);
    combo.push(TokenType.label);
    combo.push(TokenType.specialParenthesisLeft);
    combo.push(TokenType.label);
    combo.push(TokenType.specialBracketLeft);
    combo.push(TokenType.constantNumber);
    combo.push(TokenType.specialBracketRight);
    combo.push(TokenType.specialComma);
    combo.push(TokenType.constantNumber);
    combo.push(TokenType.specialParenthesisRight);
    combo.push(TokenType.operatorBinaryComparisonEqualTo);
    combo.push(TokenType.constantNumber);
    combo.push(TokenType.specialParenthesisRight);
    combo.push(TokenType.label);
    combo.push(TokenType.operatorBinaryAssignmentDirect);
    combo.push(TokenType.constantNumber);
    combo.push(TokenType.specialSemicolon);
    combo.push(TokenType.keywordInt);
    combo.push(TokenType.label);
    combo.push(TokenType.operatorBinaryAssignmentDirect);
    combo.push(TokenType.specialBraceLeft);
    combo.push(TokenType.constantNumber);
    combo.push(TokenType.specialBraceRight);
    combo.push(TokenType.specialSemicolon);
    assert(
      combo,
      "#include thing\n#include thing\nbool thing = 0;\nint thing(int thing, char **thing) {\n  if (thing > 'J' && thing(thing[0], 0) == 0)\n    thing = 0;\n\n  int thing = { 0 };",
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
