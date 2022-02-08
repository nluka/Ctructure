import indexOfRegex from '../indexOfRegex';

describe('indexOfRegex', () => {
  function assert(
    searchString: string,
    regex: RegExp,
    startPos: number,
    expectedIndex: number | null,
  ) {
    test(`return ${expectedIndex} when searchString=${JSON.stringify(
      searchString,
    )}, regex=${regex}, startPos=${startPos}`, () => {
      expect(indexOfRegex(searchString, regex, startPos)).toBe(
        expectedIndex,
      );
    });
  }

  assert('0123\n ', /\n/, 0, 4);
  assert('0123 \n', / /, 1, 4);
  assert('0123', / /, 0, null);
});
