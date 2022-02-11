import addCarriageReturns from '../addCarriageReturns';

describe('addCarriageReturns', () => {
  function assert(
    input: string,
    expected: string
  ) {
    test(`transform ${JSON.stringify(input)} into ${JSON.stringify(
      expected,
    )}`, () => {
      expect(addCarriageReturns(input)).toBe(expected);
    });
  }

  assert('', '');
  assert('123', '123');
  assert('\n', '\r\n');
  assert('\r\n', '\r\n');
  assert('\n\n', '\r\n\r\n');
  assert(' 1 \n 2 \n 3 \n 4', ' 1 \r\n 2 \r\n 3 \r\n 4');
});
