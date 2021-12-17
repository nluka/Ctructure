import { TokenType, _tokenEncode } from "../lexer";

describe("_tokenEncode", () => {
  function assert(
    startIndex: number,
    tokenType: TokenType,
    expectedEncoding: number
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

  // 14                       2
  // 000000000000000000001110 00000010 = 3586
  assert(14, TokenType.specialSemicolon, 3586);

  // 20_847                   108
  // 000000000101000101101111 01101100 = 5_336_940
  assert(20_847, TokenType.identifier, 5_336_940);

  // 16_777_215               79
  // 111111111111111111111111 01010010 = -174
  assert(16_777_215, TokenType.keywordExtern, -174);
});
