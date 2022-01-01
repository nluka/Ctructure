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
      expect(tokenDisambiguate(ambiguousTokenIndex, tokenArray)).toBe(expectedTokenType);
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
        TokenType.specialParenthesisLeft,
        TokenType.ambiguousPlus,
        TokenType.identifier
      ],
      1, TokenType.operatorUnaryPlus, '(+a'
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
          TokenType.specialParenthesisLeft,
          TokenType.ambiguousMinus,
          TokenType.identifier
        ],
        1, TokenType.operatorUnaryMinus, '(-a'
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
          TokenType.operatorBinaryArithmeticDivision,
          TokenType.newline,
          TokenType.ambiguousDecrement,
          TokenType.identifier
        ],
        2, TokenType.operatorUnaryArithmeticDecrementPrefix, '/\n--a'
      );
      assert(
        [
          TokenType.operatorBinaryAssignmentDirect,
          TokenType.ambiguousDecrement,
          TokenType.identifier
        ],
        1, TokenType.operatorUnaryArithmeticDecrementPrefix, '= --a'
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
          TokenType.newline,
          TokenType.ambiguousDecrement,
          TokenType.specialSemicolon
        ],
        2, TokenType.operatorUnaryArithmeticDecrementPostfix, 'a\n--;'
      );
    });
  });

  describe('ambiguousAsterisk', () => {

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
          TokenType.specialParenthesisLeft,
          TokenType.ambiguousAmpersand,
          TokenType.constantString
        ],
        1, TokenType.operatorUnaryAddressOf, '(&"string"'
      );
    });
  });
});
