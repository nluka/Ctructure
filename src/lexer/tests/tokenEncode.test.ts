import tokenEncode from '../tokenEncode';
import TokenType from '../TokenType';

describe('tokenEncode', () => {
  function assert(
    startIndex: number,
    tokenType: TokenType,
    expectedEncoding: number,
  ) {
    test(`return ${expectedEncoding} when startIndex=${startIndex}, type=${tokenType}`, () => {
      expect(tokenEncode(startIndex, tokenType)).toBe(expectedEncoding);
    });
  }

  // startIndex(decimal) tokenType(decimal)
  // startIndex(binary)  tokenType(binary) = encodedToken(decimal)

  // // 0                         0
  // // 0000000000000000000000000 0000000 = 0
  assert(0, TokenType.preproDirectiveInclude, 0);

  // // 14                        1
  // // 0000000000000000000001110 0000001 = 1793
  assert(14, TokenType.preproDirectiveDefine, 1793);

  // // 20_847                    109
  // // 0000000000101000101101111 1101101 = 2_668_525
  assert(20_847, TokenType.specialComma, 2_668_525);

  // // 33_554_431                83
  // // 1111111111111111111111111 1010011 = -45
  assert(33_554_431, TokenType.operatorBinaryBitwiseAnd, -45);
});
