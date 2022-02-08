import tokenDetermineLineAndNum from "../tokenDetermineLineAndNum";

describe('tokenDetermineLineAndNum', () => {
  function assert(
    tokStartPos: number,
    fileContents: string,
    expectedLineNum: number,
    expectedTokenNum: number,
  ) {
    test(`return ${expectedLineNum},${expectedTokenNum} when fileContents=${JSON.stringify(fileContents)}, tokStartPos=${tokStartPos}`, () => {
      expect(tokenDetermineLineAndNum(fileContents, tokStartPos)).toEqual(
        { lineNum: expectedLineNum, tokenNum: expectedTokenNum }
      );
    });
  }

  assert(5, '\n\n\n  token\n\n\n', 4, 1);
  assert(0, 'token',               1, 1);
  assert(0, 'token\n\n',           1, 1);
  assert(2, '  token',             1, 1);
  assert(2, '  token\n\n',         1, 1);
  assert(4, '  1 token\n\n',       1, 2);
  assert(6, '  1 2 token\n\n',     1, 3);
});
