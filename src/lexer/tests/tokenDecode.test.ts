import { tokenDecode, TokenType } from "../lexer";

describe("tokenDecode", () => {
  function assert(
    encodedToken: number,
    expectedStartIndex: number,
    expectedTokenType: TokenType
  ) {
    test(`return [${expectedStartIndex}, ${expectedTokenType}] when token=${encodedToken}`, () => {
      expect(tokenDecode(encodedToken)).toEqual([
        expectedStartIndex,
        expectedTokenType,
      ]);
    });
  }

  // same cases (but reversed) from `tokenEncode.test.ts`
  assert(0, 0, 0);
  assert(3585, 14, TokenType.specialSemicolon);
  assert(5_336_941, 20_847, TokenType.identifier);
  assert(-173, 16_777_215, TokenType.keywordExtern);
});
