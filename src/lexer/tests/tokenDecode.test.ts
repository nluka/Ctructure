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

  // same cases (but reversed) from `tokenEncode.test.ts`
  assert(0, 0, TokenType.preproDirectiveInclude);
  assert(1793, 14, TokenType.preproDirectiveDefine);
  assert(2_668_525, 20_847, TokenType.specialParenthesisLeft);
  assert(-1, 33_554_431, TokenType.ambiguousAmpersand);
});
