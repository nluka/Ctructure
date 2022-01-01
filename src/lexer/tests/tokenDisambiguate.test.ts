import TokenArray from '../TokenArray';
import tokenDisambiguate from '../tokenDisambiguate';
import tokenEncode from '../tokenEncode';
import TokenType from '../TokenType';
import tokenTypeToNameMap from '../tokenTypeToNameMap';

describe('tokenDisambiguate', () => {
  function assert(
    tokenIndex: number,
    tokens: TokenArray,
    expectedTokenType: TokenType,
    tokensDescription: string,
  ) {
    test(`return ${tokenTypeToNameMap.get(expectedTokenType)} when tokens=${JSON.stringify(tokensDescription)}`, () => {
      expect(tokenDisambiguate(tokenIndex, tokens)).toBe(expectedTokenType);
    });
  }

  describe('ambiguousPlus', () => {
    {
      const ta = new TokenArray(3);
      ta.push(tokenEncode(0, TokenType.operatorBinaryAssignmentDirect));
      ta.push(tokenEncode(0, TokenType.ambiguousPlus));
      ta.push(tokenEncode(0, TokenType.identifier));
      assert(1, ta, TokenType.operatorUnaryPlus, '= +a');
    }
    {
      const ta = new TokenArray(3);
      ta.push(tokenEncode(0, TokenType.specialParenthesisLeft));
      ta.push(tokenEncode(0, TokenType.ambiguousPlus));
      ta.push(tokenEncode(0, TokenType.identifier));
      assert(1, ta, TokenType.operatorUnaryPlus, '(+a');
    }
    {
      const ta = new TokenArray(3);
      ta.push(tokenEncode(0, TokenType.identifier));
      ta.push(tokenEncode(0, TokenType.ambiguousPlus));
      ta.push(tokenEncode(0, TokenType.identifier));
      assert(1, ta, TokenType.operatorBinaryArithmeticAddition, 'a + b');
    }
    {
      const ta = new TokenArray(3);
      ta.push(tokenEncode(0, TokenType.identifier));
      ta.push(tokenEncode(0, TokenType.ambiguousPlus));
      ta.push(tokenEncode(0, TokenType.constantNumber));
      assert(1, ta, TokenType.operatorBinaryArithmeticAddition, 'a + 1');
    }
    {
      const ta = new TokenArray(3);
      ta.push(tokenEncode(0, TokenType.constantNumber));
      ta.push(tokenEncode(0, TokenType.ambiguousPlus));
      ta.push(tokenEncode(0, TokenType.identifier));
      assert(1, ta, TokenType.operatorBinaryArithmeticAddition, '1 + b');
    }
    {
      const ta = new TokenArray(3);
      ta.push(tokenEncode(0, TokenType.constantNumber));
      ta.push(tokenEncode(0, TokenType.ambiguousPlus));
      ta.push(tokenEncode(0, TokenType.constantNumber));
      assert(1, ta, TokenType.operatorBinaryArithmeticAddition, '1 + 1');
    }
    {
      const ta = new TokenArray(3);
      ta.push(tokenEncode(0, TokenType.constantCharacter));
      ta.push(tokenEncode(0, TokenType.ambiguousPlus));
      ta.push(tokenEncode(0, TokenType.constantCharacter));
      assert(1, ta, TokenType.operatorBinaryArithmeticAddition, "'a' + 'b'");
    }
  });

  describe('ambiguousMinus', () => {
    {
      const ta = new TokenArray(3);
      ta.push(tokenEncode(0, TokenType.operatorBinaryAssignmentDirect));
      ta.push(tokenEncode(0, TokenType.ambiguousMinus));
      ta.push(tokenEncode(0, TokenType.identifier));
      assert(1, ta, TokenType.operatorUnaryMinus, '= -a');
    }
    {
      const ta = new TokenArray(3);
      ta.push(tokenEncode(0, TokenType.specialParenthesisLeft));
      ta.push(tokenEncode(0, TokenType.ambiguousMinus));
      ta.push(tokenEncode(0, TokenType.identifier));
      assert(1, ta, TokenType.operatorUnaryMinus, '(-a');
    }
    {
      const ta = new TokenArray(3);
      ta.push(tokenEncode(0, TokenType.identifier));
      ta.push(tokenEncode(0, TokenType.ambiguousMinus));
      ta.push(tokenEncode(0, TokenType.identifier));
      assert(1, ta, TokenType.operatorBinaryArithmeticSubtraction, 'a - b');
    }
    {
      const ta = new TokenArray(3);
      ta.push(tokenEncode(0, TokenType.identifier));
      ta.push(tokenEncode(0, TokenType.ambiguousMinus));
      ta.push(tokenEncode(0, TokenType.constantNumber));
      assert(1, ta, TokenType.operatorBinaryArithmeticSubtraction, 'a - 1');
    }
    {
      const ta = new TokenArray(3);
      ta.push(tokenEncode(0, TokenType.constantNumber));
      ta.push(tokenEncode(0, TokenType.ambiguousMinus));
      ta.push(tokenEncode(0, TokenType.identifier));
      assert(1, ta, TokenType.operatorBinaryArithmeticSubtraction, '1 - b');
    }
    {
      const ta = new TokenArray(3);
      ta.push(tokenEncode(0, TokenType.constantNumber));
      ta.push(tokenEncode(0, TokenType.ambiguousMinus));
      ta.push(tokenEncode(0, TokenType.constantNumber));
      assert(1, ta, TokenType.operatorBinaryArithmeticSubtraction, '1 - 1');
    }
    {
      const ta = new TokenArray(3);
      ta.push(tokenEncode(0, TokenType.constantCharacter));
      ta.push(tokenEncode(0, TokenType.ambiguousMinus));
      ta.push(tokenEncode(0, TokenType.constantCharacter));
      assert(1, ta, TokenType.operatorBinaryArithmeticSubtraction, "'a' - 'b'");
    }
  });

  describe('ambiguousIncrement', () => {
    {
      const ta = new TokenArray(3);
      ta.push(tokenEncode(0, TokenType.newline));
      ta.push(tokenEncode(0, TokenType.ambiguousIncrement));
      ta.push(tokenEncode(0, TokenType.identifier));
      assert(1, ta, TokenType.operatorUnaryArithmeticIncrementPrefix, '\n++a');
    }
    {
      const ta = new TokenArray(3);
      ta.push(tokenEncode(0, TokenType.identifier));
      ta.push(tokenEncode(0, TokenType.ambiguousIncrement));
      ta.push(tokenEncode(0, TokenType.specialSemicolon));
      assert(1, ta, TokenType.operatorUnaryArithmeticIncrementPostfix, 'a++;');
    }
    {
      const ta = new TokenArray(3);
      ta.push(tokenEncode(0, TokenType.operatorBinaryAssignmentDirect));
      ta.push(tokenEncode(0, TokenType.ambiguousIncrement));
      ta.push(tokenEncode(0, TokenType.identifier));
      assert(1, ta, TokenType.operatorUnaryArithmeticIncrementPrefix, '= ++a');
    }
  });

  describe('ambiguousDecrement', () => {
    {
      const ta = new TokenArray(3);
      ta.push(tokenEncode(0, TokenType.newline));
      ta.push(tokenEncode(0, TokenType.ambiguousDecrement));
      ta.push(tokenEncode(0, TokenType.identifier));
      assert(1, ta, TokenType.operatorUnaryArithmeticDecrementPrefix, '\n--a');
    }
    {
      const ta = new TokenArray(3);
      ta.push(tokenEncode(0, TokenType.identifier));
      ta.push(tokenEncode(0, TokenType.ambiguousDecrement));
      ta.push(tokenEncode(0, TokenType.specialSemicolon));
      assert(1, ta, TokenType.operatorUnaryArithmeticDecrementPostfix, 'a--;');
    }
    {
      const ta = new TokenArray(3);
      ta.push(tokenEncode(0, TokenType.operatorBinaryAssignmentDirect));
      ta.push(tokenEncode(0, TokenType.ambiguousDecrement));
      ta.push(tokenEncode(0, TokenType.identifier));
      assert(1, ta, TokenType.operatorUnaryArithmeticDecrementPrefix, '= --a');
    }
  });

  describe('ambiguousAsterisk', () => {

  });

  describe('ambiguousAmpersand', () => {
    // Bitwise AND
    {
      const ta = new TokenArray(3);
      ta.push(tokenEncode(0, TokenType.identifier));
      ta.push(tokenEncode(0, TokenType.ambiguousAmpersand));
      ta.push(tokenEncode(0, TokenType.identifier));
      assert(1, ta, TokenType.operatorBinaryBitwiseAnd, 'a & b');
    }
    {
      const ta = new TokenArray(3);
      ta.push(tokenEncode(0, TokenType.identifier));
      ta.push(tokenEncode(0, TokenType.ambiguousAmpersand));
      ta.push(tokenEncode(0, TokenType.constantNumber));
      assert(1, ta, TokenType.operatorBinaryBitwiseAnd, 'a & 1');
    }
    {
      const ta = new TokenArray(3);
      ta.push(tokenEncode(0, TokenType.constantNumber));
      ta.push(tokenEncode(0, TokenType.ambiguousAmpersand));
      ta.push(tokenEncode(0, TokenType.identifier));
      assert(1, ta, TokenType.operatorBinaryBitwiseAnd, '1 & b');
    }
    {
      const ta = new TokenArray(3);
      ta.push(tokenEncode(0, TokenType.constantNumber));
      ta.push(tokenEncode(0, TokenType.ambiguousAmpersand));
      ta.push(tokenEncode(0, TokenType.constantNumber));
      assert(1, ta, TokenType.operatorBinaryBitwiseAnd, '1 & 1');
    }
    {
      const ta = new TokenArray(3);
      ta.push(tokenEncode(0, TokenType.constantCharacter));
      ta.push(tokenEncode(0, TokenType.ambiguousAmpersand));
      ta.push(tokenEncode(0, TokenType.constantCharacter));
      assert(1, ta, TokenType.operatorBinaryBitwiseAnd, "'a' & 'b'");
    }
    // AddressOf
    {
      const ta = new TokenArray(3);
      ta.push(tokenEncode(0, TokenType.operatorBinaryAssignmentDirect));
      ta.push(tokenEncode(0, TokenType.ambiguousAmpersand));
      ta.push(tokenEncode(0, TokenType.identifier));
      assert(1, ta, TokenType.operatorUnaryAddressOf, '= &b');
    }
    {
      const ta = new TokenArray(3);
      ta.push(tokenEncode(0, TokenType.specialParenthesisLeft));
      ta.push(tokenEncode(0, TokenType.ambiguousAmpersand));
      ta.push(tokenEncode(0, TokenType.constantString));
      assert(1, ta, TokenType.operatorUnaryAddressOf, '(&"string"');
    }
  });
});
