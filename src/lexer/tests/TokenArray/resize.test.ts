import TokenArray from '../../TokenArray';

describe('TokenArray.resize', () => {
  function assert(tokenArray: TokenArray, prevSize: number) {
    test(`expand size of array when prevSize=${prevSize}`, () => {
      expect(tokenArray.getSize()).toBeGreaterThan(prevSize);
      expect(tokenArray.getResizeCount()).toBe(1);
    });
  }

  {
    const initialSize = 0;
    const ta = new TokenArray(initialSize);
    ta.resize();
    assert(ta, initialSize);
  }

  {
    const initialSize = 10;
    const ta = new TokenArray(initialSize);
    ta.resize();
    assert(ta, initialSize);
  }

  {
    const initialSize = 100;
    const ta = new TokenArray(initialSize);
    ta.resize();
    assert(ta, initialSize);
  }
});
