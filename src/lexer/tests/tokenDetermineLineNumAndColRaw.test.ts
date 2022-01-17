import tokenDetermineLineNumAndColNumRaw from "../tokenDetermineLineNumAndColNumRaw";

describe('tokenDetermineLineNumAndColNumRaw', () => {
  function assert(
    fileContents: string,
    tokenStartIndex: number,
    expectedLineNum: number,
    expectedColNum: number,
  ) {
    test(`return [${expectedLineNum}, ${expectedColNum}] when fileContents=${JSON.stringify(fileContents)}, tokenStartIndex=${tokenStartIndex}`, () => {
      expect(tokenDetermineLineNumAndColNumRaw(fileContents, tokenStartIndex)).toEqual([
        expectedLineNum,
        expectedColNum,
      ]);
    });
  }

  assert('\n\n\n  token\n\n\n', 5, 4, 3);
  assert('token', 0, 1, 1);
  assert('token\n\n', 0, 1, 1);
  assert('  token', 2, 1, 3);
  assert('  token\n\n', 2, 1, 3);
});
