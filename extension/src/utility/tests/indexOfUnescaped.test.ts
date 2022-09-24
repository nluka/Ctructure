import indexOfUnescaped from '../indexOfUnescaped';

describe('indexOfUnescaped', () => {
  function assert(
    searchString: string,
    searchChar: string,
    startPos: number,
    expectedIndex: number,
  ) {
    test(`return ${expectedIndex} when searchString=\`${searchString}\`, searchChar=${searchChar}, startPos=${startPos}`, () => {
      expect(indexOfUnescaped(searchString, searchChar, '\\', startPos)).toBe(
        expectedIndex,
      );
    });
  }

  assert(`"123"`, `"`, 1, 4);
  assert(`0123"`, `"`, 0, 4);
  assert(`0123" `, `"`, 0, 4);
  assert(`0123\\"`, `"`, 0, -1);
  assert(`0123\\" `, `"`, 0, -1);
  assert(`0123\\""`, `"`, 0, 6);
  assert(`0123\\"\\""`, `"`, 0, 8);
  assert(`0123\\"\\""`, `"`, 0, 8);
  assert(` \\\\x `, `x`, 0, 3);
  assert(`'\\n'`, `'`, 1, 3);
});
