import TokenSet from '../../TokenSet';

describe('TokenArray.checkIndexBounds', () => {
  function assert(
    tokenArray: TokenSet,
    indexToCheck: number,
    shouldThrow: boolean,
  ) {
    test(`${
      shouldThrow ? 'throw' : 'not throw'
    } when tokenArray.count=${tokenArray.getCount()}, indexToCheck=${indexToCheck}`, () => {
      if (shouldThrow) {
        expect(() => tokenArray.checkIndexBounds(indexToCheck)).toThrowError(
          RangeError,
        );
      } else {
        expect(() => tokenArray.checkIndexBounds(indexToCheck)).not.toThrow();
      }
    });
  }

  {
    const count = 0;
    const ta = new TokenSet(count);
    assert(ta, -10, true);
    assert(ta, -1, true);
    assert(ta, 0, true);
    assert(ta, 1, true);
  }

  {
    const count = 10;
    const ta = new TokenSet(count);
    for (let i = 1; i <= count; ++i) {
      ta.pushUnpacked(0, 0);
    }
    assert(ta, -10, true);
    assert(ta, -1, true);
    assert(ta, 0, false);
    assert(ta, 5, false);
    assert(ta, 9, false);
    assert(ta, 10, true);
    assert(ta, 100, true);
  }

  {
    const count = 100;
    const ta = new TokenSet(count);
    for (let i = 1; i <= count; ++i) {
      ta.pushUnpacked(0, 0);
    }
    assert(ta, -10, true);
    assert(ta, -1, true);
    assert(ta, 0, false);
    assert(ta, 50, false);
    assert(ta, 99, false);
    assert(ta, 100, true);
    assert(ta, 1000, true);
  }
});
