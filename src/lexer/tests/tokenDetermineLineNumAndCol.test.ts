import TokenArray from "../TokenArray";
import tokenDetermineLineNumAndColNum from "../tokenDetermineLineNumAndCol";
import tokenEncode from "../tokenEncode";
import TokenType from "../TokenType";

describe('tokenDetermineLineNumAndColNum', () => {
  function assert(
    tokens: [TokenType, number][],
    tokenIndex: number,
    expectedLineNum: number,
    expectedColNum: number,
    description: string
  ) {
    test(`return [${expectedLineNum}, ${expectedColNum}] when ${JSON.stringify(description)}`, () => {
      const ta = new TokenArray(tokens.length);
      for (const [type, startIndex] of tokens) {
        ta.push(tokenEncode(startIndex, type));
      }

      expect(tokenDetermineLineNumAndColNum(tokenIndex, ta)).toEqual([
        expectedLineNum,
        expectedColNum,
      ]);
    });
  }

  assert(
    [
      [TokenType.newline, 0],
      [TokenType.newline, 1],
      [TokenType.newline, 2],
      [TokenType.identifier, 5],
      [TokenType.newline, 10],
      [TokenType.newline, 11],
      [TokenType.newline, 12],
    ],
    3, // tokenIndex
    4, 3, // expected lineNum, colNum
    '\n\n\n  token\n\n\n'
  );
  assert(
    [
      [TokenType.identifier, 0],
    ],
    0, // tokenIndex
    1, 1, // expected lineNum, colNum
    'token'
  );
  assert(
    [
      [TokenType.identifier, 0],
      [TokenType.newline, 5],
      [TokenType.newline, 6],
    ],
    0, // tokenIndex
    1, 1, // expected lineNum, colNum
    'token\n\n'
  );
  assert(
    [
      [TokenType.identifier, 2],
    ],
    0, // tokenIndex
    1, 3, // expected lineNum, colNum
    '  token'
  );
  assert(
    [
      [TokenType.identifier, 2],
      [TokenType.newline, 7],
      [TokenType.newline, 8],
    ],
    0, // tokenIndex
    1, 3, // expected lineNum, colNum
    '  token\n\n'
  );
});
