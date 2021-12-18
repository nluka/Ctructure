import { TokenType, _tokenEncode } from "../lexer";

describe("_tokenEncode", () => {
  function assert(
    startIndex: number,
    tokenType: TokenType,
    expectedEncoding: number,
  ) {
    test(`return ${expectedEncoding} when startIndex=${startIndex}, type=${tokenType}`, () => {
      expect(_tokenEncode(startIndex, tokenType)).toBe(expectedEncoding);
    });
  }

  // startIndex(decimal) tokenType(decimal)
  // startIndex(binary)  tokenType(binary) = encodedToken(decimal)

  // 0                        0
  // 000000000000000000000000 00000000 = 0
  assert(0, 0, 0);

  // 14                       1
  // 000000000000000000001110 00000001 = 3585
  assert(14, TokenType.specialSemicolon, 3585);

  // 20_847                   109
  // 000000000101000101101111 01101101 = 5_336_941
  assert(20_847, TokenType.identifier, 5_336_941);

  // 16_777_215               83
  // 111111111111111111111111 01010011 = -173
  assert(16_777_215, TokenType.keywordExtern, -173);
});
