import TokenCategory from '../TokenCategory';
import tokenFindLastIndex from '../tokenFindLastIndex';
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

  describe('newline', () => {
    assert('\n', 0, TokenCategory.newline, 0);
    assert(' \n ', 1, TokenCategory.newline, 1);
  });

  describe('special', () => {
    assert(',', 0, TokenCategory.special, 0);
    assert(';', 0, TokenCategory.special, 0);
    assert('[', 0, TokenCategory.special, 0);
    assert(']', 0, TokenCategory.special, 0);
    assert('(', 0, TokenCategory.special, 0);
    assert(')', 0, TokenCategory.special, 0);
    assert('{', 0, TokenCategory.special, 0);
    assert('}', 0, TokenCategory.special, 0);
    assert(' ,,', 1, TokenCategory.special, 1);
    assert(' ;,', 1, TokenCategory.special, 1);
    assert(' [0', 1, TokenCategory.special, 1);
    assert(' ]=', 1, TokenCategory.special, 1);
    assert(' ()', 1, TokenCategory.special, 1);
    assert(' ){', 1, TokenCategory.special, 1);
    assert(' {\n', 1, TokenCategory.special, 1);
    assert(' } ', 1, TokenCategory.special, 1);
    assert('a = 1, ', 5, TokenCategory.special, 5, TokenType.constantNumber);
    assert('a + b; ', 5, TokenCategory.special, 5, TokenType.identifier);
    assert('a[0]', 1, TokenCategory.special, 1, TokenType.identifier);
    assert('a[100] =', 5, TokenCategory.special, 5, TokenType.constantNumber);
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
    assert(' ##ident', 1, TokenCategory.prepro, 2);
    assert(' ##identifier', 1, TokenCategory.prepro, 2);
    assert(' \\\n', 1, TokenCategory.prepro, 1);
    assert('#define ', 0, TokenCategory.prepro, 6);
    assert('0123#define ', 4, TokenCategory.prepro, 10);
    assert('0123#define PI', 4, TokenCategory.prepro, 10);
    assert('0123#define PI 3.14', 4, TokenCategory.prepro, 10);
    assert('#include <stdio.h>', 0, TokenCategory.prepro, 7);
    assert('#define PI 3.14\n#include <stdio.h>', 16, TokenCategory.prepro, 23);
  });

  describe('preproOrOperator', () => {
    assert('#include <stdio.h> ', 9, TokenCategory.preproOrOperator, 17, TokenType.preproDirectiveInclude);
    assert('#include <stdio.h>>', 9, TokenCategory.preproOrOperator, 17, TokenType.preproDirectiveInclude);
    assert('#include <stdio', 9, TokenCategory.preproOrOperator, 14, TokenType.preproDirectiveInclude);
    assert('#include <stdio\n.h>', 9, TokenCategory.preproOrOperator, 18, TokenType.preproDirectiveInclude);

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

  describe('commentOrOperator', () => {
    assert('// single line comment\n', 0, TokenCategory.commentOrOperator, 21);
    assert('// single line comment', 0, TokenCategory.commentOrOperator, 21);
    assert('/* multi line comment */', 0, TokenCategory.commentOrOperator, 23);
    assert('/* multi line comment', 0, TokenCategory.commentOrOperator, 20);

    assert('/=', 0, TokenCategory.commentOrOperator, 1);
    assert('/=b', 0, TokenCategory.commentOrOperator, 1);
    assert('/=1', 0, TokenCategory.commentOrOperator, 1);
    assert('/= ', 0, TokenCategory.commentOrOperator, 1);
  });

  describe('operator', () => {
    describe('Arithmetic', () => {
      assert('++', 0, TokenCategory.operator, 1);
      assert(' ++ ', 1, TokenCategory.operator, 2);
      assert('++a', 0, TokenCategory.operator, 1);
      assert('a++;', 1, TokenCategory.operator, 2);
      assert('a+++++b', 1, TokenCategory.operator, 2);
      assert('a+++++b', 3, TokenCategory.operator, 4);
      assert('a+++++b', 5, TokenCategory.operator, 5);

      assert('--', 0, TokenCategory.operator, 1);
      assert(' -- ', 1, TokenCategory.operator, 2);
      assert('--a', 0, TokenCategory.operator, 1);
      assert('a--;', 1, TokenCategory.operator, 2);
      assert('a-----b', 1, TokenCategory.operator, 2);
      assert('a-----b', 3, TokenCategory.operator, 4);
      assert('a-----b', 5, TokenCategory.operator, 5);

      assert('a+b', 1, TokenCategory.operator, 1);
      assert('a+\nb', 1, TokenCategory.operator, 1);
      assert('a +b', 2, TokenCategory.operator, 2);
      assert('a +', 2, TokenCategory.operator, 2);

      assert('a-b', 1, TokenCategory.operator, 1);
      assert('a-\nb', 1, TokenCategory.operator, 1);
      assert('a -b', 2, TokenCategory.operator, 2);
      assert('a -', 2, TokenCategory.operator, 2);
    });

    describe('Logical', () => {
      describe('Negation', () => {
        assert('!', 0, TokenCategory.operator, 0);
        assert('! ', 0, TokenCategory.operator, 0);
        assert('!!a', 0, TokenCategory.operator, 0);
        assert('!!a', 1, TokenCategory.operator, 1);
      });
      describe('And', () => {
        assert('&&', 0, TokenCategory.operator, 1);
        assert('&& ', 0, TokenCategory.operator, 1);
        assert('a&&b', 1, TokenCategory.operator, 2);
        assert('a && 1', 2, TokenCategory.operator, 3);
      });
      describe('Or', () => {
        assert('||', 0, TokenCategory.operator, 1);
        assert('|| ', 0, TokenCategory.operator, 1);
        assert('a||b', 1, TokenCategory.operator, 2);
        assert('a || 1', 2, TokenCategory.operator, 3);
      });
    });

    describe('Comparison', () => {
      describe('EqualTo', () => {
        assert('==', 0, TokenCategory.operator, 1);
        assert('== ', 0, TokenCategory.operator, 1);
        assert('==b', 0, TokenCategory.operator, 1);
        assert('==1', 0, TokenCategory.operator, 1);
      });
      describe('NotEqualTo', () => {
        assert('!=', 0, TokenCategory.operator, 1);
        assert('!= ', 0, TokenCategory.operator, 1);
        assert('!=b', 0, TokenCategory.operator, 1);
        assert('!=1', 0, TokenCategory.operator, 1);
      });
      describe('GreaterThan', () => {
        assert('>', 0, TokenCategory.operator, 0);
        assert('> ', 0, TokenCategory.operator, 0);
        assert('>b', 0, TokenCategory.operator, 0);
        assert('>1', 0, TokenCategory.operator, 0);
      });
      describe('GreaterThanOrEqualTo', () => {
        assert('>=', 0, TokenCategory.operator, 1);
        assert('>= ', 0, TokenCategory.operator, 1);
        assert('>=b', 0, TokenCategory.operator, 1);
        assert('>=1', 0, TokenCategory.operator, 1);
      });
    });

    describe('Bitwise', () => {
      describe('OnesComplements', () => {
        assert('~a', 0, TokenCategory.operator, 0);
        assert('~ ', 0, TokenCategory.operator, 0);
        assert('~\n', 0, TokenCategory.operator, 0);
      });
      describe('And', () => {
        assert('a&b', 1, TokenCategory.operator, 1);
        assert('a&1', 1, TokenCategory.operator, 1);
        assert('a & b', 2, TokenCategory.operator, 2);
        assert('a &\nb', 2, TokenCategory.operator, 2);
      });
      describe('Or', () => {
        assert('a|b', 1, TokenCategory.operator, 1);
        assert('a|1', 1, TokenCategory.operator, 1);
        assert('a | b', 2, TokenCategory.operator, 2);
        assert('a |\nb', 2, TokenCategory.operator, 2);
      });
    });

    describe('Assignment', () => {
      describe('Direct', () => {
        assert('=', 0, TokenCategory.operator, 0);
        assert('=b', 0, TokenCategory.operator, 0);
        assert('=1', 0, TokenCategory.operator, 0);
        assert('= ', 0, TokenCategory.operator, 0);
      });
      describe('Addition', () => {
        assert('+=', 0, TokenCategory.operator, 1);
        assert('+=b', 0, TokenCategory.operator, 1);
        assert('+=1', 0, TokenCategory.operator, 1);
        assert('+= ', 0, TokenCategory.operator, 1);
      });
      describe('Subtraction', () => {
        assert('-=', 0, TokenCategory.operator, 1);
        assert('-=b', 0, TokenCategory.operator, 1);
        assert('-=1', 0, TokenCategory.operator, 1);
        assert('-= ', 0, TokenCategory.operator, 1);
      });
      describe('Multiplication', () => {
        assert('*=', 0, TokenCategory.operator, 1);
        assert('*=b', 0, TokenCategory.operator, 1);
        assert('*=1', 0, TokenCategory.operator, 1);
        assert('*= ', 0, TokenCategory.operator, 1);
      });
      describe('Modulo', () => {
        assert('%=', 0, TokenCategory.operator, 1);
        assert('%=b', 0, TokenCategory.operator, 1);
        assert('%=1', 0, TokenCategory.operator, 1);
        assert('%= ', 0, TokenCategory.operator, 1);
      });
      describe('BitwiseShiftRight', () => {
        assert('>>=', 0, TokenCategory.operator, 2);
        assert('>>=b', 0, TokenCategory.operator, 2);
        assert('>>=1', 0, TokenCategory.operator, 2);
        assert('>>= ', 0, TokenCategory.operator, 2);
      });
      describe('BitwiseAnd', () => {
        assert('&=', 0, TokenCategory.operator, 1);
        assert('&=b', 0, TokenCategory.operator, 1);
        assert('&=1', 0, TokenCategory.operator, 1);
        assert('&= ', 0, TokenCategory.operator, 1);
      });
      describe('BitwiseOr', () => {
        assert('|=', 0, TokenCategory.operator, 1);
        assert('|=b', 0, TokenCategory.operator, 1);
        assert('|=1', 0, TokenCategory.operator, 1);
        assert('|= ', 0, TokenCategory.operator, 1);
      });
      describe('BitwiseXor', () => {
        assert('^=', 0, TokenCategory.operator, 1);
        assert('^=b', 0, TokenCategory.operator, 1);
        assert('^=1', 0, TokenCategory.operator, 1);
        assert('^= ', 0, TokenCategory.operator, 1);
      });
    });
  });

  describe('Other', () => {
    describe('Asterisk', () => {
      assert('*', 0, TokenCategory.operator, 0);
      assert('**a', 0, TokenCategory.operator, 0);
      assert('**a', 1, TokenCategory.operator, 1);
      assert('int *const', 4, TokenCategory.operator, 4);
      assert('int * const', 4, TokenCategory.operator, 4);
    });
    describe('Ampersand', () => {
      assert('&', 0, TokenCategory.operator, 0);
      assert('& ', 0, TokenCategory.operator, 0);
      assert('&a);', 0, TokenCategory.operator, 0);
    });
    describe('MemberSelectionDirect', () => {
      assert('.', 0, TokenCategory.operator, 0);
      assert('a.b', 1, TokenCategory.operator, 1);
      assert('a. b', 1, TokenCategory.operator, 1);
      assert('a.\nb', 1, TokenCategory.operator, 1);
    });
    describe('MemberSelectionIndirect', () => {
      assert('->', 0, TokenCategory.operator, 1);
      assert('a->b', 1, TokenCategory.operator, 2);
      assert('a-> b', 1, TokenCategory.operator, 2);
      assert('a->\nb', 1, TokenCategory.operator, 2);
    });
    describe('TernaryQuestion', () => {
      assert('?', 0, TokenCategory.operator, 0);
      assert('a?b', 1, TokenCategory.operator, 1);
      assert('a? b', 1, TokenCategory.operator, 1);
      assert('a?\nb', 1, TokenCategory.operator, 1);
    });
    describe('Ellipses', () => {
      assert('...', 0, TokenCategory.operator, 2);
      assert(' ... ', 1, TokenCategory.operator, 3);
    });
    describe('Colon', () => {
      assert(':', 0, TokenCategory.operator, 0);
      assert('a :b', 2, TokenCategory.operator, 2);
      assert('a : b', 2, TokenCategory.operator, 2);
      assert('a?b\n:c', 4, TokenCategory.operator, 4);
    });
  });

  describe('Constant', () => {
    describe('Character', () => {
      assert("'\\''", 0, TokenCategory.constant, 3);
      assert("'a'", 0, TokenCategory.constant, 2);
      assert("'a' ", 0, TokenCategory.constant, 2);
      assert(" 'a' ", 1, TokenCategory.constant, 3);
      assert(" '@' ", 1, TokenCategory.constant, 3);
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

  describe('preproMacroOrKeywordOrIdentifierOrLabel', () => {
    describe('Macros', () => {
      assert(' __FILE__ ', 1, TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel, 8);
      assert('(__LINE__)', 1, TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel, 8);
      assert('__DATE__ +', 0, TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel, 7);
      assert('__TIME__;', 0, TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel, 7);
      assert('__TIMESTAMP__', 0, TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel, 12);
    });
    describe('Identifiers', () => {
      assert('money', 0, TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel, 4);
      assert('[i++]', 1, TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel, 1);
      assert('if (my_int_var > 1) {\n', 4, TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel, 13);
      assert('if (myVar>1) {\n', 4, TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel, 8);
      assert('if (_myVar.member) {\n', 4, TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel, 9);
      assert('struct my_struct{\n', 7, TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel, 15);
      assert('myVar;', 0, TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel, 4);
    });
    describe('Labels', () => {
      assert('\nend:\n', 1, TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel, 4);
      assert('\nbreak_out:\n', 1, TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel, 10);
      assert(';aLabel:\n', 1, TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel, 7);
    });
  });
});
