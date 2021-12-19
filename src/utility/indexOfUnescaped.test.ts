import indexOfUnescaped from './indexOfUnescaped';

describe('indexOfUnescaped', () => {
  function assert(
    searchString: string,
    searchChar: string,
    startIndex: number,
    expectedIndex: number,
  ) {
    test(`return ${expectedIndex} when searchString=${JSON.stringify(
      searchString,
    )}, searchChar=${searchChar}, startIndex=${startIndex}`, () => {
      expect(indexOfUnescaped(searchString, searchChar, startIndex)).toBe(
        expectedIndex,
      );
    });
  }

  assert('"123"', '"', 1, 4);
  assert('0123"', '"', 0, 4);
  assert('0123" ', '"', 0, 4);
  assert('0123\\"', '"', 0, -1);
  assert('0123\\" ', '"', 0, -1);
  assert('0123\\""', '"', 0, 6);
  assert('0123\\"\\""', '"', 0, 8);
  assert('0123\\"\\"" ', '"', 0, 8);
});
