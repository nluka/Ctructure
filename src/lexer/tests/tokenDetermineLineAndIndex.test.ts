import tokenDetermineLineAndIndex from "../tokenDetermineLineAndIndex";

describe('tokenDetermineLineNumAndIndex', () => {
  function assert(
    fileContents: string,
    tokenStartIndex: number,
    expectedLineNum: number,
    expectedIndexOnLine: number,
  ) {
    test(`return ${expectedLineNum},${expectedIndexOnLine} when fileContents=${JSON.stringify(fileContents)}, tokenStartIndex=${tokenStartIndex}`, () => {
      expect(tokenDetermineLineAndIndex(fileContents, tokenStartIndex)).toEqual(
        { lineNum: expectedLineNum, indexOnLine: expectedIndexOnLine }
      );
    });
  }

  assert('\n\n\n  token\n\n\n', 5, 4, 0);
  assert('token', 0, 1, 0);
  assert('token\n\n', 0, 1, 0);
  assert('  token', 2, 1, 0);
  assert('  token\n\n', 2, 1, 0);
  assert('  0 token\n\n', 4, 1, 1);
  assert('  0 1 token\n\n', 6, 1, 2);
});
