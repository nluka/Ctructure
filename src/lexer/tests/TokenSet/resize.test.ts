import TokenSet from '../../TokenSet';

describe('TokenArray.resize', () => {
  function assert(tokenArray: TokenSet, prevSize: number) {
    test(`expand when prevSize=${prevSize}`, () => {
      expect(tokenArray.getSize()).toBeGreaterThan(prevSize);
      expect(tokenArray.getResizeCount()).toBe(1);
    });
  }

  {
    const initialSize = 0;
    const ta = new TokenSet(initialSize);
    ta.resize();
    assert(ta, initialSize);
  }

  {
    const initialSize = 10;
    const ta = new TokenSet(initialSize);
    ta.resize();
    assert(ta, initialSize);
  }

  {
    const initialSize = 100;
    const ta = new TokenSet(initialSize);
    ta.resize();
    assert(ta, initialSize);
  }
});
