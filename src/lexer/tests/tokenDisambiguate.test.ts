import tokenDisambiguate from '../tokenDisambiguate';
import TokenSet from '../TokenSet';
import TokenType, { isTokenAmbiguous } from '../TokenType';
import tokenTypeToNameMap from '../tokenTypeToNameMap';

describe('tokenDisambiguate', () => {
  function assert(
    tokenTypes: TokenType[],
    expectedTokenType: TokenType,
    fileContents: string,
  ) {
    test(`${tokenTypeToNameMap.get(expectedTokenType)} <- ${JSON.stringify(fileContents)}`, () => {
      const tokens = new TokenSet(tokenTypes.length);
      for (const tokenType of tokenTypes) {
        tokens.pushPacked([0, tokenType]);
      }
      let ambiguousTokenIndex = 0;
      for (; ambiguousTokenIndex < tokenTypes.length; ++ambiguousTokenIndex) {
        if (isTokenAmbiguous(tokenTypes[ambiguousTokenIndex])) {
          break;
        }
      }
      expect(tokenDisambiguate(ambiguousTokenIndex, tokens, fileContents)).toBe(expectedTokenType);
    });
  }

  describe('ambiguousPlus', () => {
    assert(
      [ TokenType.operatorBinaryAssignmentDirect,
        TokenType.ambiguousPlus,
        TokenType.identifier ],
      TokenType.operatorUnaryPlus, '= +a');
    assert(
      [ TokenType.operatorBinaryAssignmentSubtraction,
        TokenType.newline,
        TokenType.ambiguousPlus,
        TokenType.identifier ],
      TokenType.operatorUnaryPlus, '-=\n+a');
    assert(
      [ TokenType.operatorBinaryBitwiseShiftLeft,
        TokenType.newline,
        TokenType.ambiguousPlus,
        TokenType.identifier ],
      TokenType.operatorUnaryPlus, '<<\n+a');
    assert(
      [ TokenType.specialParenthesisOpening,
        TokenType.ambiguousPlus,
        TokenType.identifier ],
      TokenType.operatorUnaryPlus, '(+a');
    assert(
      [ TokenType.specialBracketOpening,
        TokenType.ambiguousPlus,
        TokenType.identifier ],
      TokenType.operatorUnaryPlus, '[+a');
    assert(
      [ TokenType.keywordReturn,
        TokenType.ambiguousPlus,
        TokenType.constantNumber ],
      TokenType.operatorUnaryPlus, 'return +1');
    assert(
      [ TokenType.identifier,
        TokenType.ambiguousPlus,
        TokenType.identifier ],
      TokenType.operatorBinaryArithmeticAddition, 'a + b');
    assert(
      [ TokenType.identifier,
        TokenType.ambiguousPlus,
        TokenType.specialParenthesisOpening ],
      TokenType.operatorBinaryArithmeticAddition, 'a + (');
    assert(
      [ TokenType.specialParenthesisClosing,
        TokenType.ambiguousPlus,
        TokenType.identifier ],
      TokenType.operatorBinaryArithmeticAddition, ') + b');
    assert(
      [ TokenType.specialParenthesisClosing,
        TokenType.ambiguousPlus,
        TokenType.specialParenthesisOpening ],
      TokenType.operatorBinaryArithmeticAddition, ') + (');
    assert(
      [ TokenType.specialBracketClosing,
        TokenType.ambiguousPlus,
        TokenType.identifier ],
      TokenType.operatorBinaryArithmeticAddition, '] + b');
    assert(
      [ TokenType.specialBracketClosing,
        TokenType.ambiguousPlus,
        TokenType.specialParenthesisOpening ],
      TokenType.operatorBinaryArithmeticAddition, '] + (');
    assert(
      [ TokenType.identifier,
        TokenType.ambiguousPlus,
        TokenType.constantNumber ],
      TokenType.operatorBinaryArithmeticAddition, 'a + 1');
    assert(
      [ TokenType.constantNumber,
        TokenType.ambiguousPlus,
        TokenType.identifier ],
      TokenType.operatorBinaryArithmeticAddition, '1 + b');
    assert(
      [ TokenType.constantNumber,
        TokenType.ambiguousPlus,
        TokenType.constantNumber ],
      TokenType.operatorBinaryArithmeticAddition, '1 + 1');
    assert(
      [ TokenType.constantCharacter,
        TokenType.newline,
        TokenType.newline,
        TokenType.ambiguousPlus,
        TokenType.newline,
        TokenType.constantCharacter ],
      TokenType.operatorBinaryArithmeticAddition, "'a'\n\n+\n'b'");
    assert(
      [ TokenType.operatorBinaryAssignmentDirect,
        TokenType.ambiguousPlus,
        TokenType.specialParenthesisOpening ],
      TokenType.operatorUnaryPlus, "= +(");
  });

  describe('ambiguousMinus', () => {
    describe('Unary', () => {
      assert(
        [ TokenType.operatorBinaryAssignmentDirect,
          TokenType.newline,
          TokenType.newline,
          TokenType.ambiguousMinus,
          TokenType.identifier ],
        TokenType.operatorUnaryMinus, '=\n\n-a');
      assert(
        [ TokenType.operatorBinaryArithmeticModulo,
          TokenType.ambiguousMinus,
          TokenType.identifier ],
        TokenType.operatorUnaryMinus, '% -a');
      assert(
        [ TokenType.specialParenthesisOpening,
          TokenType.ambiguousMinus,
          TokenType.identifier ],
        TokenType.operatorUnaryMinus, '(-a');
      assert(
        [ TokenType.specialBracketOpening,
          TokenType.ambiguousMinus,
          TokenType.identifier ],
        TokenType.operatorUnaryMinus, '[-a');
      assert(
        [ TokenType.keywordReturn,
          TokenType.ambiguousMinus,
          TokenType.constantNumber ],
        TokenType.operatorUnaryMinus, 'return -1');
    });
    describe('Binary', () => {
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousMinus,
          TokenType.identifier ],
        TokenType.operatorBinaryArithmeticSubtraction, 'a - b');
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousMinus,
          TokenType.specialParenthesisOpening ],
        TokenType.operatorBinaryArithmeticSubtraction, 'a - (');
      assert(
        [ TokenType.specialParenthesisClosing,
          TokenType.ambiguousMinus,
          TokenType.identifier ],
        TokenType.operatorBinaryArithmeticSubtraction, ') - b');
      assert(
        [ TokenType.specialParenthesisClosing,
          TokenType.ambiguousMinus,
          TokenType.specialParenthesisOpening ],
        TokenType.operatorBinaryArithmeticSubtraction, ') - (');
      assert(
        [ TokenType.specialBracketClosing,
          TokenType.ambiguousMinus,
          TokenType.identifier ],
        TokenType.operatorBinaryArithmeticSubtraction, '] - b');
      assert(
        [ TokenType.specialBracketClosing,
          TokenType.ambiguousMinus,
          TokenType.specialParenthesisOpening ],
        TokenType.operatorBinaryArithmeticSubtraction, '] - (');
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousMinus,
          TokenType.constantNumber ],
        TokenType.operatorBinaryArithmeticSubtraction, 'a - 1');
      assert(
        [ TokenType.constantNumber,
          TokenType.ambiguousMinus,
          TokenType.identifier ],
        TokenType.operatorBinaryArithmeticSubtraction, '1 - b');
      assert(
        [ TokenType.constantNumber,
          TokenType.ambiguousMinus,
          TokenType.constantNumber ],
        TokenType.operatorBinaryArithmeticSubtraction, '1 - 1');
      assert(
        [ TokenType.constantCharacter,
          TokenType.newline,
          TokenType.ambiguousMinus,
          TokenType.newline,
          TokenType.constantCharacter ],
        TokenType.operatorBinaryArithmeticSubtraction, "'a' \n - \n 'b'");
      assert(
        [ TokenType.specialParenthesisClosing,
          TokenType.ambiguousMinus,
          TokenType.identifier ],
        TokenType.operatorBinaryArithmeticSubtraction, ") - a");
      assert(
        [ TokenType.specialParenthesisClosing,
          TokenType.ambiguousMinus,
          TokenType.specialParenthesisOpening ],
        TokenType.operatorBinaryArithmeticSubtraction, ") - (");
      assert(
        [ TokenType.specialBracketClosing,
          TokenType.ambiguousMinus,
          TokenType.specialParenthesisOpening ],
        TokenType.operatorBinaryArithmeticSubtraction, "] - (");
      assert(
        [ TokenType.operatorBinaryAssignmentDirect,
          TokenType.ambiguousMinus,
          TokenType.specialParenthesisOpening ],
        TokenType.operatorUnaryMinus, "= +(");
    });
  });

  describe('ambiguousIncrement', () => {
    describe('Prefix', () => {
      assert(
        [ TokenType.specialSemicolon,
          TokenType.newline,
          TokenType.ambiguousIncrement,
          TokenType.identifier ],
        TokenType.operatorUnaryArithmeticIncrementPrefix, ';\n++a');
      assert(
        [ TokenType.operatorBinaryArithmeticAddition,
          TokenType.newline,
          TokenType.ambiguousIncrement,
          TokenType.identifier ],
        TokenType.operatorUnaryArithmeticIncrementPrefix, '+\n++a');
      assert(
        [ TokenType.operatorBinaryAssignmentDirect,
          TokenType.ambiguousIncrement,
          TokenType.identifier ],
        TokenType.operatorUnaryArithmeticIncrementPrefix, '= ++a');
      assert(
        [ TokenType.specialSemicolon,
          TokenType.newline,
          TokenType.ambiguousIncrement,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        TokenType.operatorUnaryArithmeticIncrementPrefix, ';\n++*a');
    });
    describe('Postfix', () => {
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousIncrement,
          TokenType.specialSemicolon ],
        TokenType.operatorUnaryArithmeticIncrementPostfix, 'a++;');
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousIncrement,
          TokenType.specialParenthesisClosing ],
        TokenType.operatorUnaryArithmeticIncrementPostfix, 'a++)');
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousIncrement,
          TokenType.specialBracketClosing ],
        TokenType.operatorUnaryArithmeticIncrementPostfix, 'a++]');
      assert(
        [ TokenType.specialBracketClosing,
          TokenType.ambiguousIncrement,
          TokenType.specialSemicolon /* irrelevant */ ],
        TokenType.operatorUnaryArithmeticIncrementPostfix, ']++;');
      assert(
        [ TokenType.specialParenthesisClosing,
          TokenType.ambiguousIncrement,
          TokenType.specialParenthesisClosing ],
        TokenType.operatorUnaryArithmeticIncrementPostfix, ')++)');
      assert(
        [ TokenType.newline,
          TokenType.newline,
          TokenType.identifier,
          TokenType.ambiguousIncrement,
          TokenType.specialSemicolon ],
        TokenType.operatorUnaryArithmeticIncrementPostfix, 'a\n\n++;');
    });
  });

  describe('ambiguousDecrement', () => {
    describe('Prefix', () => {
      assert(
        [ TokenType.specialSemicolon,
          TokenType.newline,
          TokenType.ambiguousDecrement,
          TokenType.identifier ],
        TokenType.operatorUnaryArithmeticDecrementPrefix, ';\n--a');
      assert(
        [ TokenType.operatorBinaryArithmeticAddition,
          TokenType.newline,
          TokenType.ambiguousDecrement,
          TokenType.identifier ],
        TokenType.operatorUnaryArithmeticDecrementPrefix, '+\n--a');
      assert(
        [ TokenType.operatorBinaryAssignmentDirect,
          TokenType.ambiguousDecrement,
          TokenType.identifier ],
        TokenType.operatorUnaryArithmeticDecrementPrefix, '= --a');
      assert(
        [ TokenType.specialSemicolon,
          TokenType.ambiguousDecrement,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        TokenType.operatorUnaryArithmeticDecrementPrefix, ';--*a');
    });
    describe('Postfix', () => {
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousDecrement,
          TokenType.specialSemicolon ],
        TokenType.operatorUnaryArithmeticDecrementPostfix, 'a--;');
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousDecrement,
          TokenType.specialParenthesisClosing ],
        TokenType.operatorUnaryArithmeticDecrementPostfix, 'a--)');
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousDecrement,
          TokenType.specialBracketClosing ],
        TokenType.operatorUnaryArithmeticDecrementPostfix, 'a--]');
      assert(
        [ TokenType.specialBracketClosing,
          TokenType.ambiguousDecrement,
          TokenType.specialSemicolon /* irrelevant */ ],
        TokenType.operatorUnaryArithmeticDecrementPostfix, ']--;');
      assert(
        [ TokenType.specialParenthesisClosing,
          TokenType.ambiguousDecrement,
          TokenType.specialParenthesisClosing ],
        TokenType.operatorUnaryArithmeticDecrementPostfix, ')--)');
      assert(
        [ TokenType.newline,
          TokenType.newline,
          TokenType.identifier,
          TokenType.ambiguousDecrement,
          TokenType.specialSemicolon ],
        TokenType.operatorUnaryArithmeticDecrementPostfix, 'a\n\n--;');
    });
  });

  describe('ambiguousAsterisk', () => {
    describe('Indirection', () => {
      assert(
        [ TokenType.keywordInt,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.operatorBinaryAssignmentDirect ],
        TokenType.operatorUnaryIndirectionOrDereference, 'int *p =');
      assert(
        [ TokenType.specialComma,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.operatorBinaryAssignmentDirect ],
        TokenType.operatorUnaryIndirectionOrDereference, ', *p =');
      assert(
        [ TokenType.specialComma,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.specialSemicolon ],
        TokenType.operatorUnaryIndirectionOrDereference, ', *p;');
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.operatorBinaryAssignmentDirect ],
        TokenType.operatorUnaryIndirectionOrDereference, 'CusType *p =');
      assert(
        [ TokenType.specialComma,
          TokenType.ambiguousAsterisk,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        TokenType.operatorUnaryIndirectionOrDereference, ', **pp');
      assert(
        [ TokenType.operatorUnaryIndirectionOrDereference,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        TokenType.operatorUnaryIndirectionOrDereference, '**pp');
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.ambiguousAsterisk ],
        TokenType.operatorUnaryIndirectionOrDereference, 'CusType **');
      assert(
        [ TokenType.operatorUnaryIndirectionOrDereference,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        TokenType.operatorUnaryIndirectionOrDereference, '**p');
      assert(
        [ TokenType.operatorUnaryIndirectionOrDereference,
          TokenType.ambiguousAsterisk,
          TokenType.ambiguousAsterisk ],
        TokenType.operatorUnaryIndirectionOrDereference, '***');
      assert(
        [ TokenType.specialBraceClosing,
          TokenType.newline,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        TokenType.operatorUnaryIndirectionOrDereference, '}\n*p');
      assert(
        [ TokenType.specialParenthesisOpening,
          TokenType.ambiguousAsterisk,
          TokenType.keywordConst ],
        TokenType.operatorUnaryIndirectionOrDereference, '(*fp');
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.keywordVolatile ],
        TokenType.operatorUnaryIndirectionOrDereference, 'CusType * volatile');
      assert(
        [ TokenType.keywordVoid,
          TokenType.ambiguousAsterisk,
          TokenType.specialComma ],
        TokenType.operatorUnaryIndirectionOrDereference, 'void *,');
      assert(
        [ TokenType.keywordStruct,
          TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.specialSemicolon ],
        TokenType.operatorUnaryIndirectionOrDereference, 'struct CusType *p;');
      assert(
        [ TokenType.keywordInline,
          TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.specialSemicolon ],
        TokenType.operatorUnaryIndirectionOrDereference, 'inline CusType *p;');
      assert(
        [ TokenType.keywordTypedef,
          TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.specialSemicolon ],
        TokenType.operatorUnaryIndirectionOrDereference, 'typedef CusType *CusTypePtr;');
      assert(
        [ TokenType.specialBraceOpening,
          TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.specialSemicolon ],
        TokenType.operatorUnaryIndirectionOrDereference, '{ CusType *p;');
      assert(
        [ TokenType.specialBraceClosing,
          TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.specialSemicolon ],
        TokenType.operatorUnaryIndirectionOrDereference, '} CusType *p;');
      assert(
        [ TokenType.specialBraceOpening,
          TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.specialComma ],
        TokenType.operatorUnaryIndirectionOrDereference, '{ CusType *p,');
      assert(
        [ TokenType.specialSemicolon,
          TokenType.newline,
          TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.specialSemicolon ],
        TokenType.operatorUnaryIndirectionOrDereference, ';\nCusType *p;');
      assert(
        [ TokenType.specialSemicolon,
          TokenType.newline,
          TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.specialComma ],
        TokenType.operatorUnaryIndirectionOrDereference, ';\nCusType *p,');
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.specialParenthesisOpening ],
        TokenType.operatorUnaryIndirectionOrDereference, 'CusType *func(');
      assert(
        [ TokenType.keywordVoid,
          TokenType.identifier,
          TokenType.specialParenthesisOpening,
          TokenType.keywordInt,
          TokenType.keywordConst,
          TokenType.identifier,
          TokenType.specialComma,
          TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.specialComma ],
        TokenType.operatorUnaryIndirectionOrDereference, 'void func(int const a, CusType *p,');
      assert(
        [ TokenType.keywordVoid,
          TokenType.identifier,
          TokenType.specialParenthesisOpening,
          TokenType.identifier,
          TokenType.identifier,
          TokenType.specialComma,
          TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.specialComma ],
        TokenType.operatorUnaryIndirectionOrDereference, 'void func(CusType a, CusType *p,');
      assert(
        [ TokenType.identifier,
          TokenType.identifier,
          TokenType.specialParenthesisOpening,
          TokenType.identifier,
          TokenType.identifier,
          TokenType.specialComma,
          TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.specialComma ],
        TokenType.operatorUnaryIndirectionOrDereference, 'CusType func(CusType a, CusType *p,');
    });
    describe('Dereference', () => {
      assert(
        [ TokenType.specialBraceOpening,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        TokenType.operatorUnaryIndirectionOrDereference, '{ *p');
      assert(
        [ TokenType.specialBracketOpening,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        TokenType.operatorUnaryIndirectionOrDereference, '[*p');
      assert(
        [ TokenType.specialBracketOpening,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        TokenType.operatorUnaryIndirectionOrDereference, '(*p');
      assert(
        [ TokenType.specialSemicolon,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        TokenType.operatorUnaryIndirectionOrDereference, '; *p');
      assert(
        [ TokenType.operatorBinaryAssignmentDirect,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        TokenType.operatorUnaryIndirectionOrDereference, '= *p');
      assert(
        [ TokenType.operatorBinaryArithmeticSubtraction,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        TokenType.operatorUnaryIndirectionOrDereference, '- *p');
      assert(
        [ TokenType.operatorUnaryPlus,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        TokenType.operatorUnaryIndirectionOrDereference, '+*p');
      assert(
        [ TokenType.operatorUnaryArithmeticIncrementPrefix,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        TokenType.operatorUnaryIndirectionOrDereference, '++*p');
      assert(
        [ TokenType.operatorUnaryLogicalNegation,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        TokenType.operatorUnaryIndirectionOrDereference, '!*p');
      assert(
        [ TokenType.operatorTernaryQuestion,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        TokenType.operatorUnaryIndirectionOrDereference, '? *p');
      assert(
        [ TokenType.operatorTernaryColon,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        TokenType.operatorUnaryIndirectionOrDereference, '? () : *p');
      assert(
        [ TokenType.keywordSizeof,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        TokenType.operatorUnaryIndirectionOrDereference, 'sizeof *p');
      assert(
        [ TokenType.keywordReturn,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        TokenType.operatorUnaryIndirectionOrDereference, 'return *p');
      assert(
        [ TokenType.specialColonSwitchOrLabelOrBitField,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        TokenType.operatorUnaryIndirectionOrDereference, 'labelOrSwitch: *p');
      assert(
        [ TokenType.specialParenthesisClosing,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.operatorBinaryAssignmentDirect ],
        TokenType.operatorUnaryIndirectionOrDereference, ') *p =');
      assert(
        [ TokenType.specialParenthesisClosing,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.operatorUnaryArithmeticIncrementPostfix ],
        TokenType.operatorUnaryIndirectionOrDereference, ') *p++');
    });
    describe('Multiplication', () => {
      assert(
        [ TokenType.constantNumber,
          TokenType.ambiguousAsterisk,
          TokenType.constantNumber ],
        TokenType.operatorBinaryArithmeticMultiplication, '1 * 1');
      assert(
        [ TokenType.constantNumber,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        TokenType.operatorBinaryArithmeticMultiplication, '1 * a');
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.constantNumber ],
        TokenType.operatorBinaryArithmeticMultiplication, 'a * 1');
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.constantCharacter ],
        TokenType.operatorBinaryArithmeticMultiplication, `a * 'c'`);
      assert(
        [ TokenType.specialBracketClosing,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        TokenType.operatorBinaryArithmeticMultiplication, '] * a');
      assert(
        [ TokenType.specialBracketClosing,
          TokenType.ambiguousAsterisk,
          TokenType.constantNumber ],
        TokenType.operatorBinaryArithmeticMultiplication, '] * 1');
      assert(
        [ TokenType.operatorBinaryAssignmentDirect,
          TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.specialSemicolon ],
        TokenType.operatorBinaryArithmeticMultiplication, '= a * b;');
      assert(
        [ TokenType.operatorUnaryPlus,
          TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.specialParenthesisClosing ],
        TokenType.operatorBinaryArithmeticMultiplication, '+a * b)');
      assert(
        [ TokenType.operatorUnaryPlus,
          TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.operatorBinaryArithmeticSubtraction ],
        TokenType.operatorBinaryArithmeticMultiplication, '(a * b -');
      assert(
        [ TokenType.specialBracketOpening,
          TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.specialBracketClosing ],
        TokenType.operatorBinaryArithmeticMultiplication, '[a * b]');
      assert(
        [ TokenType.operatorTernaryQuestion,
          TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.specialBracketClosing ],
        TokenType.operatorBinaryArithmeticMultiplication, '? a * b');
      assert(
        [ TokenType.operatorTernaryColon,
          TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.specialBracketClosing ],
        TokenType.operatorBinaryArithmeticMultiplication, ': a * b');
      assert(
        [ TokenType.operatorBinaryAssignmentDirect,
          TokenType.identifier,
          TokenType.specialParenthesisOpening,
          TokenType.identifier,
          TokenType.operatorBinaryArithmeticAddition,
          TokenType.identifier,
          TokenType.specialComma,
          TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.specialComma ],
        TokenType.operatorBinaryArithmeticMultiplication, '= func(a + b, a * b,');
      assert(
        [ TokenType.operatorBinaryArithmeticAddition,
          TokenType.identifier,
          TokenType.specialParenthesisOpening,
          TokenType.identifier,
          TokenType.operatorBinaryArithmeticAddition,
          TokenType.identifier,
          TokenType.specialComma,
          TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.specialComma ],
        TokenType.operatorBinaryArithmeticMultiplication, '+ func(a || b, c * d,');
      assert(
        [ TokenType.specialComma,
          TokenType.identifier,
          TokenType.specialParenthesisOpening,
          TokenType.identifier,
          TokenType.operatorBinaryArithmeticAddition,
          TokenType.identifier,
          TokenType.specialComma,
          TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.specialComma ],
        TokenType.operatorBinaryArithmeticMultiplication, ', func(a, b * c,');
      assert(
        [ TokenType.specialSemicolon,
          TokenType.identifier,
          TokenType.specialParenthesisOpening,
          TokenType.identifier,
          TokenType.operatorBinaryArithmeticAddition,
          TokenType.identifier,
          TokenType.specialComma,
          TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.specialComma ],
        TokenType.operatorBinaryArithmeticMultiplication, '; func(a, b, c * d,');
      assert(
        [ TokenType.specialBraceOpening,
          TokenType.identifier,
          TokenType.specialParenthesisOpening,
          TokenType.identifier,
          TokenType.operatorBinaryArithmeticAddition,
          TokenType.identifier,
          TokenType.specialComma,
          TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.specialComma ],
        TokenType.operatorBinaryArithmeticMultiplication, '{ func(~a, *b, c * d,');
      assert(
        [ TokenType.identifier,
          TokenType.specialColonSwitchOrLabelOrBitField,
          TokenType.newline,
          TokenType.identifier,
          TokenType.specialParenthesisOpening,
          TokenType.identifier,
          TokenType.operatorBinaryArithmeticAddition,
          TokenType.identifier,
          TokenType.specialComma,
          TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.specialComma ],
        TokenType.operatorBinaryArithmeticMultiplication, 'label:\nfunc(~a, *b, c * d,');
      assert(
        [ TokenType.specialBracketOpening,
          TokenType.identifier,
          TokenType.specialParenthesisOpening,
          TokenType.identifier,
          TokenType.operatorBinaryArithmeticAddition,
          TokenType.identifier,
          TokenType.specialComma,
          TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.specialComma ],
        TokenType.operatorBinaryArithmeticMultiplication, '[func(--a, b * c,');
    });
  });

  describe('ambiguousAmpersand', () => {
    describe('Bitwise AND', () => {
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousAmpersand,
          TokenType.identifier ],
        TokenType.operatorBinaryBitwiseAnd, 'a & b');
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousAmpersand,
          TokenType.constantNumber ],
        TokenType.operatorBinaryBitwiseAnd, 'a & 1');
      assert(
        [ TokenType.constantNumber,
          TokenType.ambiguousAmpersand,
          TokenType.identifier ],
        TokenType.operatorBinaryBitwiseAnd, '1 & b');
      assert(
        [ TokenType.constantNumber,
          TokenType.ambiguousAmpersand,
          TokenType.constantNumber ],
        TokenType.operatorBinaryBitwiseAnd, '1 & 1');
      assert(
        [ TokenType.constantCharacter,
          TokenType.newline,
          TokenType.ambiguousAmpersand,
          TokenType.newline,
          TokenType.newline,
          TokenType.constantCharacter ],
        TokenType.operatorBinaryBitwiseAnd, "'c'\n&\n\n'c'");
      assert(
        [ TokenType.specialParenthesisClosing,
          TokenType.ambiguousAmpersand,
          TokenType.specialParenthesisOpening ],
        TokenType.operatorBinaryBitwiseAnd, ') & (');
      assert(
        [ TokenType.specialBracketClosing,
          TokenType.ambiguousAmpersand,
          TokenType.identifier ],
        TokenType.operatorBinaryBitwiseAnd, '] & a');
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousAmpersand,
          TokenType.specialParenthesisOpening ],
        TokenType.operatorBinaryBitwiseAnd, 'a & (');
    });
    describe('Address Of', () => {
      assert(
        [ TokenType.operatorBinaryAssignmentDirect,
          TokenType.ambiguousAmpersand,
          TokenType.identifier ],
        TokenType.operatorUnaryAddressOf, '= &a');
      assert(
        [ TokenType.specialComma,
          TokenType.ambiguousAmpersand,
          TokenType.identifier ],
        TokenType.operatorUnaryAddressOf, ', &a');
      assert(
        [ TokenType.specialParenthesisOpening,
          TokenType.ambiguousAmpersand,
          TokenType.constantString ],
        TokenType.operatorUnaryAddressOf, '(&"string"');
      assert(
        [ TokenType.specialParenthesisOpening,
          TokenType.ambiguousAmpersand,
          TokenType.identifier ],
        TokenType.operatorUnaryAddressOf, '(&a');
      assert(
        [ TokenType.operatorBinaryAssignmentDirect,
          TokenType.ambiguousAmpersand,
          TokenType.specialParenthesisOpening ],
        TokenType.operatorUnaryAddressOf, '= &(');
    });
  });

  describe('ambiguousColon', () => {
    describe('Switch', () => {
      assert(
        [ TokenType.keywordCase,
          TokenType.specialParenthesisOpening,
          TokenType.identifier,
          TokenType.operatorBinaryArithmeticAddition,
          TokenType.constantNumber,
          TokenType.specialParenthesisClosing,
          TokenType.ambiguousColon ],
        TokenType.specialColonSwitchOrLabelOrBitField, 'case (a + 1):');
      assert(
        [ TokenType.keywordDefault,
          TokenType.ambiguousColon ],
        TokenType.specialColonSwitchOrLabelOrBitField, 'default:');
    });
    describe('Ternary', () => {
      assert(
        [ TokenType.operatorTernaryQuestion,
          TokenType.identifier,
          TokenType.ambiguousColon ],
        TokenType.operatorTernaryColon, '? a : b');
      assert(
        [ TokenType.operatorTernaryQuestion,
          TokenType.specialParenthesisOpening,
          TokenType.identifier,
          TokenType.operatorBinaryArithmeticAddition,
          TokenType.constantNumber,
          TokenType.specialParenthesisClosing,
          TokenType.ambiguousColon ],
        TokenType.operatorTernaryColon, '? (a + 1) :');
    });
    describe('Label', () => {
      assert(
        [ TokenType.specialSemicolon,
          TokenType.identifier,
          TokenType.ambiguousColon ],
        TokenType.specialColonSwitchOrLabelOrBitField, '; label:');
      assert(
        [ TokenType.specialBraceOpening,
          TokenType.identifier,
          TokenType.ambiguousColon ],
        TokenType.specialColonSwitchOrLabelOrBitField, '{ label:');
    });
    describe('Bit Field', () => {
      assert(
        [ TokenType.specialBraceOpening,
          TokenType.keywordInt,
          TokenType.identifier,
          TokenType.ambiguousColon ],
        TokenType.specialColonSwitchOrLabelOrBitField, '{ int a: 1');
      assert(
        [ TokenType.specialSemicolon,
          TokenType.keywordInt,
          TokenType.identifier,
          TokenType.ambiguousColon ],
        TokenType.specialColonSwitchOrLabelOrBitField, '; int b: 1');
    });
  });
});
