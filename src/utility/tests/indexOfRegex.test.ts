import indexOfRegex from '../indexOfRegex';

describe('indexOfRegex', () => {
  function assert(
    str: string,
    regex: RegExp,
    startPos: number,
    expectedIndex: number,
  ) {
    test(`return ${expectedIndex} when searchString=${JSON.stringify(
      str,
    )}, regex=${regex}, startPos=${startPos}`, () => {
      expect(indexOfRegex(str, regex, startPos)).toBe(
        expectedIndex,
      );
    });
  }

  assert('0123\n ', /\n/, 0, 4);
  assert('0123 \n', / /, 1, 4);
  assert('0123', / /, 0, -1);
});
