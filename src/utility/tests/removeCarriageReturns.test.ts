import removeCarriageReturns from '../removeCarriageReturns';

describe('removeCarriageReturns', () => {
  function assert(
    input: string,
    expected: string
  ) {
    test(`remove ${JSON.stringify('\r')} when input=${JSON.stringify(
      input,
    )}`, () => {
      expect(removeCarriageReturns(input)).toBe(expected);
    });
  }

  assert('', '');
  assert('123', '123');
  assert('\r\n', '\n');
  assert('\r\r\r\n', '\n');
  assert('\r\r\r', '');
  assert('1\r2\r3\r4', '1234');
});
