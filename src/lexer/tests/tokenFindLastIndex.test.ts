import TokenCategory from '../TokenCategory';
import { tokenFindLastIndex } from '../tokenFindLastIndex';
import TokenType from '../TokenType';

describe('tokenFindLastIndex', () => {
  function assert(
    fileContents: string,
    startIndex: number,
    category: TokenCategory,
    expectedLastIndex: number,
    prevTokenType: TokenType | null = null,
  ) {
    test(`return ${expectedLastIndex} when fileContents=${JSON.stringify(
      fileContents,
    )}, startIndex=${startIndex}`, () => {
      expect(
        tokenFindLastIndex(fileContents, startIndex, category, prevTokenType),
      ).toBe(expectedLastIndex);
    });
  }

  function assertThrowsError(
    fileContents: string,
    startIndex: number,
    category: TokenCategory,
    prevTokenType: TokenType | null = null,
  ) {
    test(`throw error when fileContents=${JSON.stringify(
      fileContents,
    )}, startIndex=${startIndex}`, () => {
      expect(() =>
        tokenFindLastIndex(fileContents, startIndex, category, prevTokenType),
      ).toThrowError();
    });
  }

  describe('special', () => {
    assert(',', 0, TokenCategory.special, 0);
    assert(';', 0, TokenCategory.special, 0);
    assert('[', 0, TokenCategory.special, 0);
    assert(']', 0, TokenCategory.special, 0);
    assert('(', 0, TokenCategory.special, 0);
    assert(')', 0, TokenCategory.special, 0);
    assert('{', 0, TokenCategory.special, 0);
    assert('}', 0, TokenCategory.special, 0);
    assert(' , ', 1, TokenCategory.special, 1);
    assert(' ; ', 1, TokenCategory.special, 1);
    assert(' [ ', 1, TokenCategory.special, 1);
    assert(' ] ', 1, TokenCategory.special, 1);
    assert(' ( ', 1, TokenCategory.special, 1);
    assert(' ) ', 1, TokenCategory.special, 1);
    assert(' { ', 1, TokenCategory.special, 1);
    assert(' } ', 1, TokenCategory.special, 1);
    assert(
      'const int a = 1, b = 2',
      15,
      TokenCategory.special,
      15,
      TokenType.constantNumber,
    );
    assert('a + b; ', 5, TokenCategory.special, 5, TokenType.identifier);
    assert('a[0]', 1, TokenCategory.special, 1, TokenType.identifier);
    assert(
      'a[100] = 10',
      5,
      TokenCategory.special,
      5,
      TokenType.constantNumber,
    );
    assert(' (a + b) ', 1, TokenCategory.special, 1);
    assert('((a+b)-1)', 5, TokenCategory.special, 5, TokenType.identifier);
    assert(' {\n', 1, TokenCategory.special, 1);
    assert('\n}\n', 1, TokenCategory.special, 1);
  });

  describe('prepro', () => {
    assertThrowsError('#', 0, TokenCategory.prepro);
    assertThrowsError('# ', 0, TokenCategory.prepro);
    assertThrowsError('# define PI 3.14', 0, TokenCategory.prepro);
    assertThrowsError('0123#', 4, TokenCategory.prepro);
    assertThrowsError('0123# ', 4, TokenCategory.prepro);
    assertThrowsError('0123# define PI 3.14', 4, TokenCategory.prepro);
    assert('##', 0, TokenCategory.prepro, 1);
    assert('#define', 0, TokenCategory.prepro, 6);
    assert('0123#define', 4, TokenCategory.prepro, 10);
    assert('0123#define PI', 4, TokenCategory.prepro, 10);
    assert('0123#define PI 3.14', 4, TokenCategory.prepro, 10);
    assert('#include <stdio.h>', 0, TokenCategory.prepro, 7);
    assert('#define PI 3.14\n#include <stdio.h>', 16, TokenCategory.prepro, 23);
  });

  describe('preproOrOperator', () => {
    assert(
      '#include <stdio.h>\n',
      9,
      TokenCategory.preproOrOperator,
      17,
      TokenType.preproDirectiveInclude,
    );
    assert(
      '#include <stdio.h>>',
      9,
      TokenCategory.preproOrOperator,
      17,
      TokenType.preproDirectiveInclude,
    );
    assert(
      '#include <stdio',
      9,
      TokenCategory.preproOrOperator,
      14,
      TokenType.preproDirectiveInclude,
    );
    assert(
      '#include <stdio\n.h>',
      9,
      TokenCategory.preproOrOperator,
      18,
      TokenType.preproDirectiveInclude,
    );

    assert('<', 0, TokenCategory.preproOrOperator, 0);
    assert('<=', 0, TokenCategory.preproOrOperator, 1);
    assert('<<', 0, TokenCategory.preproOrOperator, 1);
    assert('<<=', 0, TokenCategory.preproOrOperator, 2);

    assert('(a<b)', 2, TokenCategory.preproOrOperator, 2);
    assert('(a < b)', 3, TokenCategory.preproOrOperator, 3);
    assert('(a<b.h)', 2, TokenCategory.preproOrOperator, 2);
    assert('(a<b.height)', 2, TokenCategory.preproOrOperator, 2);
    assert('(a < b.h)', 3, TokenCategory.preproOrOperator, 3);
    assert('(a < b.height)', 3, TokenCategory.preproOrOperator, 3);

    assert('(a<=b)', 2, TokenCategory.preproOrOperator, 3);
    assert('(a <= b)', 3, TokenCategory.preproOrOperator, 4);
    assert('(a<=b.h)', 2, TokenCategory.preproOrOperator, 3);
    assert('(a<=b.height)', 2, TokenCategory.preproOrOperator, 3);
    assert('(a <= b.h)', 3, TokenCategory.preproOrOperator, 4);
    assert('(a <= b.height)', 3, TokenCategory.preproOrOperator, 4);

    assert('(a<<b)', 2, TokenCategory.preproOrOperator, 3);
    assert('(a << b)', 3, TokenCategory.preproOrOperator, 4);
    assert('(a<<b.h)', 2, TokenCategory.preproOrOperator, 3);
    assert('(a<<b.height)', 2, TokenCategory.preproOrOperator, 3);
    assert('(a << b.h)', 3, TokenCategory.preproOrOperator, 4);
    assert('(a << b.height)', 3, TokenCategory.preproOrOperator, 4);

    assert('(a<<=b)', 2, TokenCategory.preproOrOperator, 4);
    assert('(a <<= b)', 3, TokenCategory.preproOrOperator, 5);
    assert('(a<<=b.h)', 2, TokenCategory.preproOrOperator, 4);
    assert('(a<<=b.height)', 2, TokenCategory.preproOrOperator, 4);
    assert('(a <<= b.h)', 3, TokenCategory.preproOrOperator, 5);
    assert('(a <<= b.height)', 3, TokenCategory.preproOrOperator, 5);
  });

  describe('Constants', () => {
    describe('Character', () => {
      assert("'\\''", 0, TokenCategory.constant, 3);
      assert("'a'", 0, TokenCategory.constant, 2);
      assert("'a' ", 0, TokenCategory.constant, 2);
      assert(" 'a' ", 1, TokenCategory.constant, 3);
    });
    describe('String', () => {
      assert('"string literal"', 0, TokenCategory.constant, 15);
      assert(' "string literal" ', 1, TokenCategory.constant, 16);
      assert('"\\"escaped\\" string literal"', 0, TokenCategory.constant, 27);
    });
    describe('Number', () => {
      describe('int', () => {
        assert('123', 0, TokenCategory.constant, 2); // decimal
        assert('123u', 0, TokenCategory.constant, 3); // decimal unsigned
        assert('123U', 0, TokenCategory.constant, 3); // decimal unsigned
        assert('0123', 0, TokenCategory.constant, 3); // octal
        assert('0x12c', 0, TokenCategory.constant, 4); // hex
        assert('0x12C', 0, TokenCategory.constant, 4); // hex
      });
      describe('long', () => {
        assert(' 123l ', 1, TokenCategory.constant, 4);
        assert(' 123lu\n', 1, TokenCategory.constant, 5); // unsigned
        assert(' [123lU]', 2, TokenCategory.constant, 6); // unsigned
        assert(' 123L)', 1, TokenCategory.constant, 4);
        assert(' 123Lu+', 1, TokenCategory.constant, 5); // unsigned
        assert(' 123LU-', 1, TokenCategory.constant, 5); // unsigned
        assert(' 0123l/', 1, TokenCategory.constant, 5); // octal
        assert(' 0123lu*', 1, TokenCategory.constant, 6); // octal unsigned
        assert(' 0123lU=', 1, TokenCategory.constant, 6); // octal unsigned
        assert(' 0123L%', 1, TokenCategory.constant, 5); // octal
        assert(' 0123Lu<', 1, TokenCategory.constant, 6); // octal unsigned
        assert(' 0123LU>', 1, TokenCategory.constant, 6); // octal unsigned
        assert(' 0x12clu!', 1, TokenCategory.constant, 7); // hex
        assert(' 0x12clU|', 1, TokenCategory.constant, 7); // hex unsigned
        assert(' 0X12Cu?', 1, TokenCategory.constant, 6); // hex
        assert(' 0X12CU,', 1, TokenCategory.constant, 6); // hex unsigned
      });
      describe('long long int', () => {
        assert('123ll;', 0, TokenCategory.constant, 4);
        assert('123llu:', 0, TokenCategory.constant, 5); // unsigned
        assert("123llU'", 0, TokenCategory.constant, 5); // unsigned
        assert('123LL"', 0, TokenCategory.constant, 4);
        assert('123LLu&', 0, TokenCategory.constant, 5); // unsigned
        assert('123LLU^', 0, TokenCategory.constant, 5); // unsigned
        assert('0123ll~', 0, TokenCategory.constant, 5); // octal
        assert('0123llu ', 0, TokenCategory.constant, 6); // octal unsigned
        assert('0123llU ', 0, TokenCategory.constant, 6); // octal unsigned
        assert('0123LL ', 0, TokenCategory.constant, 5); // octal unsigned
        assert('0123LLu ', 0, TokenCategory.constant, 6); // octal unsigned
        assert('0123LLU ', 0, TokenCategory.constant, 6); // octal unsigned
        assert('0x12cll ', 0, TokenCategory.constant, 6); // hex
        assert('0x12cllu ', 0, TokenCategory.constant, 7); // hex unsigned
        assert('0x12cllU ', 0, TokenCategory.constant, 7); // hex unsigned
        assert('0x12CLL ', 0, TokenCategory.constant, 6); // hex
        assert('0x12CLLu ', 0, TokenCategory.constant, 7); // hex unsigned
        assert('0x12CLLU ', 0, TokenCategory.constant, 7); // hex unsigned
      });
      describe('float', () => {
        assert('123.45,', 0, TokenCategory.constant, 5);
        assert(' 123.45f\n', 1, TokenCategory.constant, 7);
        assert('> 123.45F)', 2, TokenCategory.constant, 8);
      });
    });
  });
});
