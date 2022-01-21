import TokenArray from '../TokenArray';
import tokenDisambiguate from '../tokenDisambiguate';
import tokenEncode from '../tokenEncode';
import TokenType from '../TokenType';
import tokenTypeToNameMap from '../tokenTypeToNameMap';

describe('tokenDisambiguate', () => {
  function assert(
    tokenTypes: TokenType[],
    ambiguousTokenIndex: number,
    expectedTokenType: TokenType,
    tokensDescription: string,
  ) {
    test(`return ${tokenTypeToNameMap.get(expectedTokenType)} when tokens=${JSON.stringify(tokensDescription)}`, () => {
      const tokenArray = new TokenArray(tokenTypes.length);
      for (const tokenType of tokenTypes) {
        tokenArray.push(tokenEncode(0, tokenType));
      }
      expect(tokenDisambiguate(ambiguousTokenIndex, tokenArray, tokensDescription)).toBe(expectedTokenType);
    });
  }

  describe('ambiguousPlus', () => {
    assert(
      [
        TokenType.operatorBinaryAssignmentDirect,
        TokenType.ambiguousPlus,
        TokenType.identifier
      ],
      1, TokenType.operatorUnaryPlus, '= +a'
    );
    assert(
      [
        TokenType.operatorBinaryAssignmentSubtraction,
        TokenType.newline,
        TokenType.ambiguousPlus,
        TokenType.identifier
      ],
      2, TokenType.operatorUnaryPlus, '-=\n+a'
    );
    assert(
      [
        TokenType.operatorBinaryBitwiseShiftLeft,
        TokenType.newline,
        TokenType.ambiguousPlus,
        TokenType.identifier
      ],
      2, TokenType.operatorUnaryPlus, '<<\n+a'
    );
    assert(
      [
        TokenType.specialParenthesisOpening,
        TokenType.ambiguousPlus,
        TokenType.identifier
      ],
      1, TokenType.operatorUnaryPlus, '(+a'
    );
    assert(
      [
        TokenType.specialBracketOpening,
        TokenType.ambiguousPlus,
        TokenType.identifier
      ],
      1, TokenType.operatorUnaryPlus, '[+a'
    );
    assert(
      [
        TokenType.keywordReturn,
        TokenType.ambiguousPlus,
        TokenType.constantNumber
      ],
      1, TokenType.operatorUnaryPlus, 'return +1'
    );
    assert(
      [
        TokenType.identifier,
        TokenType.ambiguousPlus,
        TokenType.identifier
      ],
      1, TokenType.operatorBinaryArithmeticAddition, 'a + b'
    );
    assert(
      [
        TokenType.identifier,
        TokenType.ambiguousPlus,
        TokenType.specialParenthesisOpening
      ],
      1, TokenType.operatorBinaryArithmeticAddition, 'a + ('
    );
    assert(
      [
        TokenType.specialParenthesisClosing,
        TokenType.ambiguousPlus,
        TokenType.identifier
      ],
      1, TokenType.operatorBinaryArithmeticAddition, ') + b'
    );
    assert(
      [
        TokenType.specialParenthesisClosing,
        TokenType.ambiguousPlus,
        TokenType.specialParenthesisOpening
      ],
      1, TokenType.operatorBinaryArithmeticAddition, ') + ('
    );
    assert(
      [
        TokenType.specialBracketClosing,
        TokenType.ambiguousPlus,
        TokenType.identifier
      ],
      1, TokenType.operatorBinaryArithmeticAddition, '] + b'
    );
    assert(
      [
        TokenType.specialBracketClosing,
        TokenType.ambiguousPlus,
        TokenType.specialParenthesisOpening
      ],
      1, TokenType.operatorBinaryArithmeticAddition, '] + ('
    );
    assert(
      [
        TokenType.identifier,
        TokenType.ambiguousPlus,
        TokenType.constantNumber
      ],
      1, TokenType.operatorBinaryArithmeticAddition, 'a + 1'
    );
    assert(
      [
        TokenType.constantNumber,
        TokenType.ambiguousPlus,
        TokenType.identifier
      ],
      1, TokenType.operatorBinaryArithmeticAddition, '1 + b'
    );
    assert(
      [
        TokenType.constantNumber,
        TokenType.ambiguousPlus,
        TokenType.constantNumber
      ],
      1, TokenType.operatorBinaryArithmeticAddition, '1 + 1'
    );
    assert(
      [
        TokenType.constantCharacter,
        TokenType.newline,
        TokenType.newline,
        TokenType.ambiguousPlus,
        TokenType.newline,
        TokenType.constantCharacter
      ],
      3, TokenType.operatorBinaryArithmeticAddition, "'a'\n\n+\n'b'"
    );
    assert(
      [
        TokenType.operatorBinaryAssignmentDirect,
        TokenType.ambiguousPlus,
        TokenType.specialParenthesisOpening
      ],
      1, TokenType.operatorUnaryPlus, "= +("
    );
  });

  describe('ambiguousMinus', () => {
    describe('Unary', () => {
      assert(
        [
          TokenType.operatorBinaryAssignmentDirect,
          TokenType.newline,
          TokenType.newline,
          TokenType.ambiguousMinus,
          TokenType.identifier
        ],
        3, TokenType.operatorUnaryMinus, '=\n\n-a'
      );
      assert(
        [
          TokenType.operatorBinaryArithmeticModulo,
          TokenType.ambiguousMinus,
          TokenType.identifier
        ],
        1, TokenType.operatorUnaryMinus, '% -a'
      );
      assert(
        [
          TokenType.specialParenthesisOpening,
          TokenType.ambiguousMinus,
          TokenType.identifier
        ],
        1, TokenType.operatorUnaryMinus, '(-a'
      );
      assert(
        [
          TokenType.specialBracketOpening,
          TokenType.ambiguousMinus,
          TokenType.identifier
        ],
        1, TokenType.operatorUnaryMinus, '[-a'
      );
      assert(
        [
          TokenType.keywordReturn,
          TokenType.ambiguousMinus,
          TokenType.constantNumber
        ],
        1, TokenType.operatorUnaryMinus, 'return -1'
      );
    });
    describe('Binary', () => {
      assert(
        [
          TokenType.identifier,
          TokenType.ambiguousMinus,
          TokenType.identifier
        ],
        1, TokenType.operatorBinaryArithmeticSubtraction, 'a - b'
      );
      assert(
        [
          TokenType.identifier,
          TokenType.ambiguousMinus,
          TokenType.specialParenthesisOpening
        ],
        1, TokenType.operatorBinaryArithmeticSubtraction, 'a - ('
      );
      assert(
        [
          TokenType.specialParenthesisClosing,
          TokenType.ambiguousMinus,
          TokenType.identifier
        ],
        1, TokenType.operatorBinaryArithmeticSubtraction, ') - b'
      );
      assert(
        [
          TokenType.specialParenthesisClosing,
          TokenType.ambiguousMinus,
          TokenType.specialParenthesisOpening
        ],
        1, TokenType.operatorBinaryArithmeticSubtraction, ') - ('
      );
      assert(
        [
          TokenType.specialBracketClosing,
          TokenType.ambiguousMinus,
          TokenType.identifier
        ],
        1, TokenType.operatorBinaryArithmeticSubtraction, '] - b'
      );
      assert(
        [
          TokenType.specialBracketClosing,
          TokenType.ambiguousMinus,
          TokenType.specialParenthesisOpening
        ],
        1, TokenType.operatorBinaryArithmeticSubtraction, '] - ('
      );
      assert(
        [
          TokenType.identifier,
          TokenType.ambiguousMinus,
          TokenType.constantNumber
        ],
        1, TokenType.operatorBinaryArithmeticSubtraction, 'a - 1'
      );
      assert(
        [
          TokenType.constantNumber,
          TokenType.ambiguousMinus,
          TokenType.identifier
        ],
        1, TokenType.operatorBinaryArithmeticSubtraction, '1 - b'
      );
      assert(
        [
          TokenType.constantNumber,
          TokenType.ambiguousMinus,
          TokenType.constantNumber
        ],
        1, TokenType.operatorBinaryArithmeticSubtraction, '1 - 1'
      );
      assert(
        [
          TokenType.constantCharacter,
          TokenType.newline,
          TokenType.ambiguousMinus,
          TokenType.newline,
          TokenType.constantCharacter
        ],
        2, TokenType.operatorBinaryArithmeticSubtraction, "'a'\n-\n'b'"
      );
      assert(
      [
        TokenType.specialParenthesisClosing,
        TokenType.ambiguousMinus,
        TokenType.identifier
      ],
      1, TokenType.operatorBinaryArithmeticSubtraction, ") - a"
    );
    assert(
      [
        TokenType.specialParenthesisClosing,
        TokenType.ambiguousMinus,
        TokenType.specialParenthesisOpening
      ],
      1, TokenType.operatorBinaryArithmeticSubtraction, ") - ("
    );
    assert(
      [
        TokenType.specialBracketClosing,
        TokenType.ambiguousMinus,
        TokenType.specialParenthesisOpening
      ],
      1, TokenType.operatorBinaryArithmeticSubtraction, "] - ("
    );
    assert(
      [
        TokenType.operatorBinaryAssignmentDirect,
        TokenType.ambiguousMinus,
        TokenType.specialParenthesisOpening
      ],
      1, TokenType.operatorUnaryMinus, "= +("
    );
    });
  });

  describe('ambiguousIncrement', () => {
    describe('Prefix', () => {
      assert(
        [
          TokenType.specialSemicolon,
          TokenType.newline,
          TokenType.ambiguousIncrement,
          TokenType.identifier
        ],
        2, TokenType.operatorUnaryArithmeticIncrementPrefix, ';\n++a'
      );
      assert(
        [
          TokenType.operatorBinaryArithmeticAddition,
          TokenType.newline,
          TokenType.ambiguousIncrement,
          TokenType.identifier
        ],
        2, TokenType.operatorUnaryArithmeticIncrementPrefix, '+\n++a'
      );
      assert(
        [
          TokenType.operatorBinaryAssignmentDirect,
          TokenType.ambiguousIncrement,
          TokenType.identifier
        ],
        1, TokenType.operatorUnaryArithmeticIncrementPrefix, '= ++a'
      );
      assert(
        [
          TokenType.specialSemicolon,
          TokenType.ambiguousIncrement,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
        ],
        1, TokenType.operatorUnaryArithmeticIncrementPrefix, ';++*a'
      );
    });
    describe('Postfix', () => {
      assert(
        [
          TokenType.identifier,
          TokenType.ambiguousIncrement,
          TokenType.specialSemicolon
        ],
        1, TokenType.operatorUnaryArithmeticIncrementPostfix, 'a++;'
      );
      assert(
        [
          TokenType.identifier,
          TokenType.ambiguousIncrement,
          TokenType.specialParenthesisClosing
        ],
        1, TokenType.operatorUnaryArithmeticIncrementPostfix, 'a++)'
      );
      assert(
        [
          TokenType.identifier,
          TokenType.ambiguousIncrement,
          TokenType.specialBracketClosing
        ],
        1, TokenType.operatorUnaryArithmeticIncrementPostfix, 'a++]'
      );
      assert(
        [
          TokenType.specialParenthesisClosing,
          TokenType.ambiguousIncrement,
          TokenType.specialParenthesisClosing
        ],
        1, TokenType.operatorUnaryArithmeticIncrementPostfix, ')++)'
      );
      assert(
        [
          TokenType.newline,
          TokenType.newline,
          TokenType.identifier,
          TokenType.ambiguousIncrement,
          TokenType.specialSemicolon
        ],
        3, TokenType.operatorUnaryArithmeticIncrementPostfix, 'a\n\n++;'
      );
    });
  });

  describe('ambiguousDecrement', () => {
    describe('Prefix', () => {
      assert(
        [
          TokenType.specialSemicolon,
          TokenType.newline,
          TokenType.ambiguousDecrement,
          TokenType.identifier
        ],
        2, TokenType.operatorUnaryArithmeticDecrementPrefix, ';\n--a'
      );
      assert(
        [
          TokenType.operatorBinaryArithmeticAddition,
          TokenType.newline,
          TokenType.ambiguousDecrement,
          TokenType.identifier
        ],
        2, TokenType.operatorUnaryArithmeticDecrementPrefix, '+\n--a'
      );
      assert(
        [
          TokenType.operatorBinaryAssignmentDirect,
          TokenType.ambiguousDecrement,
          TokenType.identifier
        ],
        1, TokenType.operatorUnaryArithmeticDecrementPrefix, '= --a'
      );
      assert(
        [
          TokenType.specialSemicolon,
          TokenType.ambiguousDecrement,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
        ],
        1, TokenType.operatorUnaryArithmeticDecrementPrefix, ';--*a'
      );
    });
    describe('Postfix', () => {
      assert(
        [
          TokenType.identifier,
          TokenType.ambiguousDecrement,
          TokenType.specialSemicolon
        ],
        1, TokenType.operatorUnaryArithmeticDecrementPostfix, 'a--;'
      );
      assert(
        [
          TokenType.identifier,
          TokenType.ambiguousDecrement,
          TokenType.specialParenthesisClosing
        ],
        1, TokenType.operatorUnaryArithmeticDecrementPostfix, 'a--)'
      );
      assert(
        [
          TokenType.identifier,
          TokenType.ambiguousDecrement,
          TokenType.specialBracketClosing
        ],
        1, TokenType.operatorUnaryArithmeticDecrementPostfix, 'a--]'
      );
      assert(
        [
          TokenType.specialParenthesisClosing,
          TokenType.ambiguousDecrement,
          TokenType.specialParenthesisClosing
        ],
        1, TokenType.operatorUnaryArithmeticDecrementPostfix, ')--)'
      );
      assert(
        [
          TokenType.newline,
          TokenType.newline,
          TokenType.identifier,
          TokenType.ambiguousDecrement,
          TokenType.specialSemicolon
        ],
        3, TokenType.operatorUnaryArithmeticDecrementPostfix, 'a\n\n--;'
      );
    });
  });

  describe('ambiguousDecrement', () => {
    describe('Dereference', () => {
      assert(
        [
          TokenType.specialBraceOpening,
          TokenType.ambiguousAsterisk,
          TokenType.identifier
        ],
        1, TokenType.operatorUnaryDereference, '{*a'
      );
      // assert(
      //   [
      //     TokenType.specialBraceClosing,
      //     TokenType.ambiguousAsterisk,
      //     TokenType.identifier
      //   ],
      //   1, TokenType.operatorUnaryDereference, '}*a'
      // );
      assert(
        [
          TokenType.specialBracketOpening,
          TokenType.ambiguousAsterisk,
          TokenType.identifier
        ],
        1, TokenType.operatorUnaryDereference, '[*a'
      );
      assert(
        [
          TokenType.specialBracketOpening,
          TokenType.ambiguousAsterisk,
          TokenType.identifier
        ],
        1, TokenType.operatorUnaryDereference, '(*a'
      );
      assert(
        [
          TokenType.specialSemicolon,
          TokenType.newline,
          TokenType.ambiguousAsterisk,
          TokenType.identifier
        ],
        2, TokenType.operatorUnaryDereference, ';\n*a'
      );
      assert(
        [
          TokenType.specialComma,
          TokenType.ambiguousAsterisk,
          TokenType.identifier
        ],
        1, TokenType.operatorUnaryDereference, ', *a'
      );
      assert(
        [
          TokenType.operatorBinaryAssignmentDirect,
          TokenType.ambiguousAsterisk,
          TokenType.identifier
        ],
        1, TokenType.operatorUnaryDereference, '= *a'
      );
      assert(
        [
          TokenType.operatorBinaryAssignmentDirect,
          TokenType.ambiguousAsterisk,
          TokenType.identifier
        ],
        1, TokenType.operatorUnaryDereference, '+ *a'
      );
      assert(
        [
          TokenType.keywordSizeof,
          TokenType.ambiguousAsterisk,
          TokenType.identifier
        ],
        1, TokenType.operatorUnaryDereference, 'sizeof *a'
      );
    });

    describe('Multiplication or Indirection', () => {
      assert(
        [
          TokenType.operatorBinaryMultiplicationOrIndirection,
          TokenType.ambiguousAsterisk,
          TokenType.identifier
        ],
        1, TokenType.operatorBinaryMultiplicationOrIndirection, '** p'
      );
      assert(
        [
          TokenType.specialBraceClosing,
          TokenType.ambiguousAsterisk,
          TokenType.identifier,
          TokenType.specialSemicolon
        ],
        1, TokenType.operatorBinaryMultiplicationOrIndirection, '} * a'
      );
    });
  });

  describe('ambiguousAmpersand', () => {
    describe('Bitwise AND', () => {
      assert(
        [
          TokenType.identifier,
          TokenType.ambiguousAmpersand,
          TokenType.identifier
        ],
        1, TokenType.operatorBinaryBitwiseAnd, 'a & b'
      );
      assert(
        [
          TokenType.identifier,
          TokenType.ambiguousAmpersand,
          TokenType.constantNumber
        ],
        1, TokenType.operatorBinaryBitwiseAnd, 'a & 1'
      );
      assert(
        [
          TokenType.constantNumber,
          TokenType.ambiguousAmpersand,
          TokenType.identifier
        ],
        1, TokenType.operatorBinaryBitwiseAnd, '1 & b'
      );
      assert(
        [
          TokenType.constantNumber,
          TokenType.ambiguousAmpersand,
          TokenType.constantNumber
        ],
        1, TokenType.operatorBinaryBitwiseAnd, '1 & 1'
      );
      assert(
        [
          TokenType.constantCharacter,
          TokenType.newline,
          TokenType.ambiguousAmpersand,
          TokenType.newline,
          TokenType.newline,
          TokenType.constantCharacter
        ],
        2, TokenType.operatorBinaryBitwiseAnd, "'a'\n&\n\n'b'"
      );
      assert(
        [
          TokenType.specialParenthesisClosing,
          TokenType.ambiguousAmpersand,
          TokenType.specialParenthesisOpening
        ],
        1, TokenType.operatorBinaryBitwiseAnd, ') & ('
      );
      assert(
        [
          TokenType.identifier,
          TokenType.ambiguousAmpersand,
          TokenType.specialParenthesisOpening
        ],
        1, TokenType.operatorBinaryBitwiseAnd, 'report_mask & ('
      );
    });
    describe('Address Of', () => {
      assert(
        [
          TokenType.operatorBinaryAssignmentDirect,
          TokenType.ambiguousAmpersand,
          TokenType.identifier
        ],
        1, TokenType.operatorUnaryAddressOf, '= &b'
      );
      assert(
        [
          TokenType.specialComma,
          TokenType.ambiguousAmpersand,
          TokenType.identifier
        ],
        1, TokenType.operatorUnaryAddressOf, ', &b'
      );
      assert(
        [
          TokenType.specialParenthesisOpening,
          TokenType.ambiguousAmpersand,
          TokenType.constantString
        ],
        1, TokenType.operatorUnaryAddressOf, '(&"string"'
      );
      assert(
        [
          TokenType.specialParenthesisOpening,
          TokenType.ambiguousAmpersand,
          TokenType.identifier
        ],
        1, TokenType.operatorUnaryAddressOf, '(&a'
      );
      assert(
        [
          TokenType.operatorBinaryAssignmentDirect,
          TokenType.ambiguousAmpersand,
          TokenType.specialParenthesisOpening
        ],
        1, TokenType.operatorUnaryAddressOf, '= &('
      );
    });
  });
});
