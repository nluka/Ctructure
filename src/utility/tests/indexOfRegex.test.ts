import indexOfRegex from '../indexOfRegex';

describe('indexOfRegex', () => {
  function assert(
    searchString: string,
    regex: RegExp,
    startIndex: number,
    expectedIndex: number | null,
  ) {
    test(`return ${expectedIndex} when searchString=${JSON.stringify(
      searchString,
    )}, regex=${regex}, startIndex=${startIndex}`, () => {
      expect(indexOfRegex(searchString, regex, startIndex)).toBe(
        expectedIndex,
      );
    });
  }

  assert('0123\n ', /\n/, 0, 4);
  assert('0123 \n', / /, 1, 4);
  assert('0123', / /, 0, null);
});
