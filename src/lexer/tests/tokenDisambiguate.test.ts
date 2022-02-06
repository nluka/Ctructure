import TokenArray from '../TokenArray';
import tokenDisambiguate from '../tokenDisambiguate';
import TokenType from '../TokenType';
import tokenTypeToNameMap from '../tokenTypeToNameMap';

describe('tokenDisambiguate', () => {
  function assert(
    tokenTypes: TokenType[],
    ambiguousTokenIndex: number,
    expectedTokenType: TokenType,
    fileContents: string,
  ) {
    test(`${tokenTypeToNameMap.get(expectedTokenType)} when tokens=${JSON.stringify(fileContents)}`, () => {
      const tokens = new TokenArray(tokenTypes.length);
      for (const tokenType of tokenTypes) {
        tokens.pushPacked([0, tokenType]);
      }
      expect(tokenDisambiguate(ambiguousTokenIndex, tokens, fileContents)).toBe(expectedTokenType);
    });
  }

  describe('ambiguousPlus', () => {
    assert(
      [ TokenType.operatorBinaryAssignmentDirect,
        TokenType.ambiguousPlus,
        TokenType.identifier ],
      1, TokenType.operatorUnaryPlus, '= +a'
    );
    assert(
      [ TokenType.operatorBinaryAssignmentSubtraction,
        TokenType.newline,
        TokenType.ambiguousPlus,
        TokenType.identifier ],
      2, TokenType.operatorUnaryPlus, '-=\n+a'
    );
    assert(
      [ TokenType.operatorBinaryBitwiseShiftLeft,
        TokenType.newline,
        TokenType.ambiguousPlus,
        TokenType.identifier ],
      2, TokenType.operatorUnaryPlus, '<<\n+a'
    );
    assert(
      [ TokenType.specialParenthesisOpening,
        TokenType.ambiguousPlus,
        TokenType.identifier ],
      1, TokenType.operatorUnaryPlus, '(+a'
    );
    assert(
      [ TokenType.specialBracketOpening,
        TokenType.ambiguousPlus,
        TokenType.identifier ],
      1, TokenType.operatorUnaryPlus, '[+a'
    );
    assert(
      [ TokenType.keywordReturn,
        TokenType.ambiguousPlus,
        TokenType.constantNumber ],
      1, TokenType.operatorUnaryPlus, 'return +1'
    );
    assert(
      [ TokenType.identifier,
        TokenType.ambiguousPlus,
        TokenType.identifier ],
      1, TokenType.operatorBinaryArithmeticAddition, 'a + b'
    );
    assert(
      [ TokenType.identifier,
        TokenType.ambiguousPlus,
        TokenType.specialParenthesisOpening ],
      1, TokenType.operatorBinaryArithmeticAddition, 'a + ('
    );
    assert(
      [ TokenType.specialParenthesisClosing,
        TokenType.ambiguousPlus,
        TokenType.identifier ],
      1, TokenType.operatorBinaryArithmeticAddition, ') + b'
    );
    assert(
      [ TokenType.specialParenthesisClosing,
        TokenType.ambiguousPlus,
        TokenType.specialParenthesisOpening ],
      1, TokenType.operatorBinaryArithmeticAddition, ') + ('
    );
    assert(
      [ TokenType.specialBracketClosing,
        TokenType.ambiguousPlus,
        TokenType.identifier ],
      1, TokenType.operatorBinaryArithmeticAddition, '] + b'
    );
    assert(
      [ TokenType.specialBracketClosing,
        TokenType.ambiguousPlus,
        TokenType.specialParenthesisOpening ],
      1, TokenType.operatorBinaryArithmeticAddition, '] + ('
    );
    assert(
      [ TokenType.identifier,
        TokenType.ambiguousPlus,
        TokenType.constantNumber ],
      1, TokenType.operatorBinaryArithmeticAddition, 'a + 1'
    );
    assert(
      [ TokenType.constantNumber,
        TokenType.ambiguousPlus,
        TokenType.identifier ],
      1, TokenType.operatorBinaryArithmeticAddition, '1 + b'
    );
    assert(
      [ TokenType.constantNumber,
        TokenType.ambiguousPlus,
        TokenType.constantNumber ],
      1, TokenType.operatorBinaryArithmeticAddition, '1 + 1'
    );
    assert(
      [ TokenType.constantCharacter,
        TokenType.newline,
        TokenType.newline,
        TokenType.ambiguousPlus,
        TokenType.newline,
        TokenType.constantCharacter ],
      3, TokenType.operatorBinaryArithmeticAddition, "'a'\n\n+\n'b'"
    );
    assert(
      [ TokenType.operatorBinaryAssignmentDirect,
        TokenType.ambiguousPlus,
        TokenType.specialParenthesisOpening ],
      1, TokenType.operatorUnaryPlus, "= +("
    );
  });

  describe('ambiguousMinus', () => {
    describe('Unary', () => {
      assert(
        [ TokenType.operatorBinaryAssignmentDirect,
          TokenType.newline,
          TokenType.newline,
          TokenType.ambiguousMinus,
          TokenType.identifier ],
        3, TokenType.operatorUnaryMinus, '=\n\n-a'
      );
      assert(
        [ TokenType.operatorBinaryArithmeticModulo,
          TokenType.ambiguousMinus,
          TokenType.identifier ],
        1, TokenType.operatorUnaryMinus, '% -a'
      );
      assert(
        [ TokenType.specialParenthesisOpening,
          TokenType.ambiguousMinus,
          TokenType.identifier ],
        1, TokenType.operatorUnaryMinus, '(-a'
      );
      assert(
        [ TokenType.specialBracketOpening,
          TokenType.ambiguousMinus,
          TokenType.identifier ],
        1, TokenType.operatorUnaryMinus, '[-a'
      );
      assert(
        [ TokenType.keywordReturn,
          TokenType.ambiguousMinus,
          TokenType.constantNumber ],
        1, TokenType.operatorUnaryMinus, 'return -1'
      );
    });
    describe('Binary', () => {
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousMinus,
          TokenType.identifier ],
        1, TokenType.operatorBinaryArithmeticSubtraction, 'a - b'
      );
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousMinus,
          TokenType.specialParenthesisOpening ],
        1, TokenType.operatorBinaryArithmeticSubtraction, 'a - ('
      );
      assert(
        [ TokenType.specialParenthesisClosing,
          TokenType.ambiguousMinus,
          TokenType.identifier ],
        1, TokenType.operatorBinaryArithmeticSubtraction, ') - b'
      );
      assert(
        [ TokenType.specialParenthesisClosing,
          TokenType.ambiguousMinus,
          TokenType.specialParenthesisOpening ],
        1, TokenType.operatorBinaryArithmeticSubtraction, ') - ('
      );
      assert(
        [ TokenType.specialBracketClosing,
          TokenType.ambiguousMinus,
          TokenType.identifier ],
        1, TokenType.operatorBinaryArithmeticSubtraction, '] - b'
      );
      assert(
        [ TokenType.specialBracketClosing,
          TokenType.ambiguousMinus,
          TokenType.specialParenthesisOpening ],
        1, TokenType.operatorBinaryArithmeticSubtraction, '] - ('
      );
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousMinus,
          TokenType.constantNumber ],
        1, TokenType.operatorBinaryArithmeticSubtraction, 'a - 1'
      );
      assert(
        [ TokenType.constantNumber,
          TokenType.ambiguousMinus,
          TokenType.identifier ],
        1, TokenType.operatorBinaryArithmeticSubtraction, '1 - b'
      );
      assert(
        [ TokenType.constantNumber,
          TokenType.ambiguousMinus,
          TokenType.constantNumber ],
        1, TokenType.operatorBinaryArithmeticSubtraction, '1 - 1'
      );
      assert(
        [ TokenType.constantCharacter,
          TokenType.newline,
          TokenType.ambiguousMinus,
          TokenType.newline,
          TokenType.constantCharacter ],
        2, TokenType.operatorBinaryArithmeticSubtraction, "'a'\n-\n'b'"
      );
      assert(
      [ TokenType.specialParenthesisClosing,
        TokenType.ambiguousMinus,
        TokenType.identifier ],
      1, TokenType.operatorBinaryArithmeticSubtraction, ") - a"
    );
    assert(
      [ TokenType.specialParenthesisClosing,
        TokenType.ambiguousMinus,
        TokenType.specialParenthesisOpening ],
      1, TokenType.operatorBinaryArithmeticSubtraction, ") - ("
    );
    assert(
      [ TokenType.specialBracketClosing,
        TokenType.ambiguousMinus,
        TokenType.specialParenthesisOpening ],
      1, TokenType.operatorBinaryArithmeticSubtraction, "] - ("
    );
    assert(
      [ TokenType.operatorBinaryAssignmentDirect,
        TokenType.ambiguousMinus,
        TokenType.specialParenthesisOpening ],
      1, TokenType.operatorUnaryMinus, "= +("
    );
    });
  });

  describe('ambiguousIncrement', () => {
    describe('Prefix', () => {
      assert(
        [ TokenType.specialSemicolon,
          TokenType.newline,
          TokenType.ambiguousIncrement,
          TokenType.identifier ],
        2, TokenType.operatorUnaryArithmeticIncrementPrefix, ';\n++a'
      );
      assert(
        [ TokenType.operatorBinaryArithmeticAddition,
          TokenType.newline,
          TokenType.ambiguousIncrement,
          TokenType.identifier ],
        2, TokenType.operatorUnaryArithmeticIncrementPrefix, '+\n++a'
      );
      assert(
        [ TokenType.operatorBinaryAssignmentDirect,
          TokenType.ambiguousIncrement,
          TokenType.identifier ],
        1, TokenType.operatorUnaryArithmeticIncrementPrefix, '= ++a'
      );
      assert(
        [ TokenType.specialSemicolon,
          TokenType.newline,
          TokenType.ambiguousIncrement,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        2, TokenType.operatorUnaryArithmeticIncrementPrefix, ';\n++*a'
      );
    });
    describe('Postfix', () => {
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousIncrement,
          TokenType.specialSemicolon ],
        1, TokenType.operatorUnaryArithmeticIncrementPostfix, 'a++;'
      );
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousIncrement,
          TokenType.specialParenthesisClosing ],
        1, TokenType.operatorUnaryArithmeticIncrementPostfix, 'a++)'
      );
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousIncrement,
          TokenType.specialBracketClosing ],
        1, TokenType.operatorUnaryArithmeticIncrementPostfix, 'a++]'
      );
      assert(
        [ TokenType.specialBracketClosing,
          TokenType.ambiguousIncrement,
          TokenType.specialSemicolon /* irrelevant */ ],
        1, TokenType.operatorUnaryArithmeticIncrementPostfix, ']++;'
      );
      assert(
        [ TokenType.specialParenthesisClosing,
          TokenType.ambiguousIncrement,
          TokenType.specialParenthesisClosing ],
        1, TokenType.operatorUnaryArithmeticIncrementPostfix, ')++)'
      );
      assert(
        [ TokenType.newline,
          TokenType.newline,
          TokenType.identifier,
          TokenType.ambiguousIncrement,
          TokenType.specialSemicolon ],
        3, TokenType.operatorUnaryArithmeticIncrementPostfix, 'a\n\n++;'
      );
    });
  });

  describe('ambiguousDecrement', () => {
    describe('Prefix', () => {
      assert(
        [ TokenType.specialSemicolon,
          TokenType.newline,
          TokenType.ambiguousDecrement,
          TokenType.identifier ],
        2, TokenType.operatorUnaryArithmeticDecrementPrefix, ';\n--a'
      );
      assert(
        [ TokenType.operatorBinaryArithmeticAddition,
          TokenType.newline,
          TokenType.ambiguousDecrement,
          TokenType.identifier ],
        2, TokenType.operatorUnaryArithmeticDecrementPrefix, '+\n--a'
      );
      assert(
        [ TokenType.operatorBinaryAssignmentDirect,
          TokenType.ambiguousDecrement,
          TokenType.identifier ],
        1, TokenType.operatorUnaryArithmeticDecrementPrefix, '= --a'
      );
      assert(
        [ TokenType.specialSemicolon,
          TokenType.ambiguousDecrement,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        1, TokenType.operatorUnaryArithmeticDecrementPrefix, ';--*a'
      );
    });
    describe('Postfix', () => {
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousDecrement,
          TokenType.specialSemicolon ],
        1, TokenType.operatorUnaryArithmeticDecrementPostfix, 'a--;'
      );
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousDecrement,
          TokenType.specialParenthesisClosing ],
        1, TokenType.operatorUnaryArithmeticDecrementPostfix, 'a--)'
      );
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousDecrement,
          TokenType.specialBracketClosing ],
        1, TokenType.operatorUnaryArithmeticDecrementPostfix, 'a--]'
      );
      assert(
        [ TokenType.specialBracketClosing,
          TokenType.ambiguousDecrement,
          TokenType.specialSemicolon /* irrelevant */ ],
        1, TokenType.operatorUnaryArithmeticDecrementPostfix, ']--;'
      );
      assert(
        [ TokenType.specialParenthesisClosing,
          TokenType.ambiguousDecrement,
          TokenType.specialParenthesisClosing ],
        1, TokenType.operatorUnaryArithmeticDecrementPostfix, ')--)'
      );
      assert(
        [ TokenType.newline,
          TokenType.newline,
          TokenType.identifier,
          TokenType.ambiguousDecrement,
          TokenType.specialSemicolon ],
        3, TokenType.operatorUnaryArithmeticDecrementPostfix, 'a\n\n--;'
      );
    });
  });

  describe('ambiguousAsterisk', () => {
    describe('Dereference', () => {
      assert(
        [ TokenType.specialBraceOpening,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        1, TokenType.operatorUnaryDereference, '{*a'
      );
      assert(
        [ TokenType.specialBracketOpening,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        1, TokenType.operatorUnaryDereference, '[*a'
      );
      assert(
        [ TokenType.specialBracketOpening,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        1, TokenType.operatorUnaryDereference, '(*a'
      );
      assert(
        [ TokenType.specialSemicolon,
          TokenType.newline,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        2, TokenType.operatorUnaryDereference, ';\n*a'
      );
      assert(
        [ TokenType.identifier,
          TokenType.newline,
          TokenType.specialParenthesisOpening,
          TokenType.identifier,
          TokenType.specialComma,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        5, TokenType.operatorUnaryDereference, 'func\n(a, *b'
      );
      assert(
        [ TokenType.operatorBinaryAssignmentDirect,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        1, TokenType.operatorUnaryDereference, '= *a'
      );
      assert(
        [ TokenType.operatorBinaryAssignmentDirect,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        1, TokenType.operatorUnaryDereference, '+ *a'
      );
      assert(
        [ TokenType.keywordSizeof,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        1, TokenType.operatorUnaryDereference, 'sizeof *a'
      );
      assert(
        [ TokenType.keywordIf,
          TokenType.specialParenthesisOpening,
          TokenType.identifier,
          TokenType.operatorBinaryComparisonGreaterThan,
          TokenType.identifier,
          TokenType.newline,
          TokenType.operatorBinaryLogicalAnd,
          TokenType.newline,
          TokenType.identifier,
          TokenType.operatorBinaryArithmeticAddition,
          TokenType.constantNumber,
          TokenType.operatorBinaryComparisonNotEqualTo,
          TokenType.identifier,
          TokenType.specialParenthesisClosing,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        14, TokenType.operatorUnaryDereference, 'if (a > b \n && \n b + 1 != c) *a'
      );
      assert(
        [ TokenType.keywordSizeof,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        1, TokenType.operatorUnaryDereference, 'sizeof *a'
      );
      assert(
        [ TokenType.operatorUnaryArithmeticIncrementPrefix,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        1, TokenType.operatorUnaryDereference, '++*a'
      );
      assert(
        [ TokenType.operatorUnaryMinus,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        1, TokenType.operatorUnaryDereference, '-*a'
      );
      assert(
        [ TokenType.operatorUnaryBitwiseOnesComplement,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        1, TokenType.operatorUnaryDereference, '~*a'
      );
      assert(
        [ TokenType.operatorUnaryLogicalNegation,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        1, TokenType.operatorUnaryDereference, '!*a'
      );
    });
    describe('Multiplication or Indirection', () => {
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.operatorBinaryAssignmentDirect ],
        1, TokenType.operatorBinaryMultiplicationOrIndirection, 'CusType * p ='
      );
      assert(
        [ TokenType.specialComma,
          TokenType.ambiguousAsterisk,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        1, TokenType.operatorBinaryMultiplicationOrIndirection, ', ** pp'
      );
      assert(
        [ TokenType.operatorBinaryMultiplicationOrIndirection,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        1, TokenType.operatorBinaryMultiplicationOrIndirection, '** pp'
      );
      assert(
        [ TokenType.keywordInt,
          TokenType.ambiguousAsterisk,
          TokenType.ambiguousAsterisk ],
        1, TokenType.operatorBinaryMultiplicationOrIndirection, 'int **'
      );
      assert(
        [ TokenType.operatorBinaryMultiplicationOrIndirection,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        1, TokenType.operatorBinaryMultiplicationOrIndirection, '** p'
      );
      assert(
        [ TokenType.operatorBinaryMultiplicationOrIndirection,
          TokenType.ambiguousAsterisk,
          TokenType.ambiguousAsterisk ],
        1, TokenType.operatorBinaryMultiplicationOrIndirection, '***'
      );
      assert(
        [ TokenType.specialBraceClosing,
          TokenType.ambiguousAsterisk,
          TokenType.newline,
          TokenType.identifier,
          TokenType.newline,
          TokenType.specialSemicolon ],
        1, TokenType.operatorBinaryMultiplicationOrIndirection, '} * \n p \n ;'
      );
      assert(
        [ TokenType.specialBraceOpening,
          TokenType.newline,
          TokenType.keywordInt,
          TokenType.identifier,
          TokenType.operatorBinaryAssignmentDirect,
          TokenType.constantNumber,
          TokenType.specialComma,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        7, TokenType.operatorBinaryMultiplicationOrIndirection, '{ \n int a = 1, * p1 = &a;'
      );
      assert(
        [ TokenType.specialSemicolon,
          TokenType.newline,
          TokenType.newline,
          TokenType.identifier,
          TokenType.operatorBinaryAssignmentDirect,
          TokenType.constantNumber,
          TokenType.specialComma,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        7, TokenType.operatorBinaryMultiplicationOrIndirection, '; \n\n a = 1, * p1;'
      );
      assert(
        [ TokenType.specialParenthesisOpening,
          TokenType.identifier,
          TokenType.operatorBinaryArithmeticAddition,
          TokenType.constantNumber,
          TokenType.specialComma,
          TokenType.ambiguousAsterisk,
          TokenType.identifier ],
        5, TokenType.operatorUnaryDereference, '(a + 1, * p1'
      );
      assert(
        [ TokenType.specialParenthesisOpening,
          TokenType.ambiguousAsterisk,
          TokenType.keywordConst ],
        1, TokenType.operatorBinaryMultiplicationOrIndirection, '(* const'
      );
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousAsterisk,
          TokenType.keywordVolatile ],
        1, TokenType.operatorBinaryMultiplicationOrIndirection, 'CusType * volatile'
      );
      assert(
        [ TokenType.keywordVoid,
          TokenType.ambiguousAsterisk,
          TokenType.specialComma ],
        1, TokenType.operatorBinaryMultiplicationOrIndirection, 'void *,'
      );
      assert(
        [ TokenType.specialBraceClosing,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.operatorBinaryAssignmentDirect ],
        1, TokenType.operatorUnaryDereference, '} *p ='
      );
      assert(
        [ TokenType.specialBraceClosing,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.ambiguousIncrement ],
        1, TokenType.operatorUnaryDereference, '} *p++'
      );
      assert(
        [ TokenType.specialBraceClosing,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.ambiguousDecrement ],
        1, TokenType.operatorUnaryDereference, '} *p--'
      );
    });
  });

  describe('ambiguousAmpersand', () => {
    describe('Bitwise AND', () => {
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousAmpersand,
          TokenType.identifier ],
        1, TokenType.operatorBinaryBitwiseAnd, 'a & b'
      );
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousAmpersand,
          TokenType.constantNumber ],
        1, TokenType.operatorBinaryBitwiseAnd, 'a & 1'
      );
      assert(
        [ TokenType.constantNumber,
          TokenType.ambiguousAmpersand,
          TokenType.identifier ],
        1, TokenType.operatorBinaryBitwiseAnd, '1 & b'
      );
      assert(
        [ TokenType.constantNumber,
          TokenType.ambiguousAmpersand,
          TokenType.constantNumber ],
        1, TokenType.operatorBinaryBitwiseAnd, '1 & 1'
      );
      assert(
        [ TokenType.constantCharacter,
          TokenType.newline,
          TokenType.ambiguousAmpersand,
          TokenType.newline,
          TokenType.newline,
          TokenType.constantCharacter ],
        2, TokenType.operatorBinaryBitwiseAnd, "'a'\n&\n\n'b'"
      );
      assert(
        [ TokenType.specialParenthesisClosing,
          TokenType.ambiguousAmpersand,
          TokenType.specialParenthesisOpening ],
        1, TokenType.operatorBinaryBitwiseAnd, ') & ('
      );
      assert(
        [ TokenType.identifier,
          TokenType.ambiguousAmpersand,
          TokenType.specialParenthesisOpening ],
        1, TokenType.operatorBinaryBitwiseAnd, 'report_mask & ('
      );
    });
    describe('Address Of', () => {
      assert(
        [ TokenType.operatorBinaryAssignmentDirect,
          TokenType.ambiguousAmpersand,
          TokenType.identifier ],
        1, TokenType.operatorUnaryAddressOf, '= &b'
      );
      assert(
        [ TokenType.specialComma,
          TokenType.ambiguousAmpersand,
          TokenType.identifier ],
        1, TokenType.operatorUnaryAddressOf, ', &b'
      );
      assert(
        [ TokenType.specialParenthesisOpening,
          TokenType.ambiguousAmpersand,
          TokenType.constantString ],
        1, TokenType.operatorUnaryAddressOf, '(&"string"'
      );
      assert(
        [ TokenType.specialParenthesisOpening,
          TokenType.ambiguousAmpersand,
          TokenType.identifier ],
        1, TokenType.operatorUnaryAddressOf, '(&a'
      );
      assert(
        [ TokenType.operatorBinaryAssignmentDirect,
          TokenType.ambiguousAmpersand,
          TokenType.specialParenthesisOpening ],
        1, TokenType.operatorUnaryAddressOf, '= &('
      );
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
        6, TokenType.specialColonSwitchOrLabelOrBitField, 'case (a + 1):'
      );
      assert(
        [ TokenType.keywordDefault,
          TokenType.ambiguousColon ],
        1, TokenType.specialColonSwitchOrLabelOrBitField, 'default:'
      );
    });
    describe('Ternary', () => {
      assert(
        [ TokenType.operatorTernaryQuestion,
          TokenType.identifier,
          TokenType.ambiguousColon ],
        2, TokenType.operatorTernaryColon, '? a : b'
      );
      assert(
        [ TokenType.operatorTernaryQuestion,
          TokenType.specialParenthesisOpening,
          TokenType.identifier,
          TokenType.operatorBinaryArithmeticAddition,
          TokenType.constantNumber,
          TokenType.specialParenthesisClosing,
          TokenType.ambiguousColon ],
        6, TokenType.operatorTernaryColon, '? (a + 1) :'
      );
    });
    describe('Label', () => {
      assert(
        [ TokenType.specialSemicolon,
          TokenType.identifier,
          TokenType.ambiguousColon ],
        2, TokenType.specialColonSwitchOrLabelOrBitField, '; label:'
      );
      assert(
        [ TokenType.specialBraceOpening,
          TokenType.identifier,
          TokenType.ambiguousColon ],
        2, TokenType.specialColonSwitchOrLabelOrBitField, '{ label:'
      );
    });
    describe('Bit Field', () => {
      assert(
        [ TokenType.specialBraceOpening,
          TokenType.keywordInt,
          TokenType.identifier,
          TokenType.ambiguousColon ],
        3, TokenType.specialColonSwitchOrLabelOrBitField, '{ int a: 1'
      );
      assert(
        [ TokenType.specialSemicolon,
          TokenType.keywordInt,
          TokenType.identifier,
          TokenType.ambiguousColon ],
        3, TokenType.specialColonSwitchOrLabelOrBitField, '; int b: 1'
      );
    });
  });
});
