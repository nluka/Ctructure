import { tokenDecode } from '../tokenDecode';
import TokenType from '../TokenType';

describe('tokenDecode', () => {
  function assert(
    encodedToken: number,
    expectedStartIndex: number,
    expectedTokenType: TokenType,
  ) {
    test(`return [${expectedStartIndex}, ${expectedTokenType}] when token=${encodedToken}`, () => {
      expect(tokenDecode(encodedToken)).toEqual([
        expectedStartIndex,
        expectedTokenType,
      ]);
    });
  }

  test('placeholder', () => {
    expect(1).toBe(1);
  });

  // same cases (but reversed) from `tokenEncode.test.ts`
  assert(0, 0, TokenType.specialComma);
  assert(1793, 14, TokenType.specialSemicolon);
  assert(2_668_525, 20_847, TokenType.label);
  assert(-45, 33_554_431, TokenType.keywordFloat);
});
