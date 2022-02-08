import TokenCategory from '../TokenCategory';
import tokenFindEndPosition from '../tokenFindEndPosition';

const [
  newline,
  special,
  preproHash,
  commentOrOperator,
  operator,
  constant,
  preproMacroOrKeywordOrIdentifierOrLabel,
] = [
  TokenCategory.newline,
  TokenCategory.special,
  TokenCategory.preproHash,
  TokenCategory.commentOrOperator,
  TokenCategory.operator,
  TokenCategory.constant,
  TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
];

describe('tokenFindEndPosition', () => {
  function assert(
    category: TokenCategory,
    expectedEndPos: number,
    fileContents: string,
  ) {
    test(`${expectedEndPos} when fileContents=${JSON.stringify(
      fileContents,
    )}`, () => {
      expect(
        tokenFindEndPosition(fileContents, 0, category),
      ).toBe(expectedEndPos);
    });
  }

  describe('newline', () => {
    assert(newline, 0, '\n');
    assert(newline, 0, '\n ');
    assert(newline, 0, '\n\n');
  });

  describe('special', () => {
    assert(special, 0, ',');
    assert(special, 0, ';');
    assert(special, 0, '\\');
    {
      // Opening
      assert(special, 0, '( ');
      assert(special, 0, '[\t');
      assert(special, 0, '{ ');
    }
    {
      // Closing
      assert(special, 0, ']\r');
      assert(special, 0, ')\n');
      assert(special, 0, '}}');
    }
  });

  describe('preproHash', () => {
    assert(preproHash,  0, '#');
    assert(preproHash,  0, '#\n');
    assert(preproHash,  2, '#\\\n\n');
    assert(preproHash, 18, '# include <stdio.h>');
    assert(preproHash, 18, '# include <stdio.h>\n');
    assert(preproHash, 10, '#define A 1');
    assert(preproHash, 10, '#define A 1\n');
    assert(preproHash, 26, '#define A \\\n \\\n 1 \\\n + \\\n 2');
    assert(preproHash, 26, '#define A \\\n \\\n 1 \\\n + \\\n 2\n');
  });

  describe('commentOrOperator', () => {
    {
      // comment
      assert(commentOrOperator, 21, '// single line comment\n');
      assert(commentOrOperator, 21, '// single line comment');
      assert(commentOrOperator, 23, '/* multi line comment */');
      assert(commentOrOperator, 20, '/* multi line comment');
    }
    {
      // operator
      assert(commentOrOperator, 0, '/');
      assert(commentOrOperator, 0, '/ ');
      assert(commentOrOperator, 0, '/\n');
      assert(commentOrOperator, 0, '/A');
      assert(commentOrOperator, 0, '/1');
      assert(commentOrOperator, 0, '/,');
      assert(commentOrOperator, 0, '/+');

      assert(commentOrOperator, 1, '/=');
      assert(commentOrOperator, 1, '/= ');
      assert(commentOrOperator, 1, '/=\n');
      assert(commentOrOperator, 1, '/=A');
      assert(commentOrOperator, 1, '/=1');
      assert(commentOrOperator, 1, '/=,');
      assert(commentOrOperator, 1, '/=+');
    }
  });

  describe('operator', () => {
    describe('Binary', () => {
      describe('Logical', () => {
        describe('Negation', () => {
          assert(operator, 0, '!');
          assert(operator, 0, '! ');
          assert(operator, 0, '!\n');
          assert(operator, 0, '!A');
          assert(operator, 0, '!1');
          assert(operator, 0, '!,');
          assert(operator, 0, '!!');
        });
        describe('And', () => {
          assert(operator, 1, '&&');
          assert(operator, 1, '&& ');
          assert(operator, 1, '&&\n');
          assert(operator, 1, '&&A');
          assert(operator, 1, '&&1');
          assert(operator, 1, '&&,');
          assert(operator, 1, '&&&');
        });
        describe('Or', () => {
          assert(operator, 1, '||');
          assert(operator, 1, '|| ');
          assert(operator, 1, '||\n');
          assert(operator, 1, '||A');
          assert(operator, 1, '||1');
          assert(operator, 1, '||,');
          assert(operator, 1, '|||');
        });
      });
      describe('Comparison', () => {
        describe('EqualTo', () => {
          assert(operator, 1, '==');
          assert(operator, 1, '== ');
          assert(operator, 1, '==\n');
          assert(operator, 1, '==A');
          assert(operator, 1, '==1');
          assert(operator, 1, '==,');
          assert(operator, 1, '===');
        });
        describe('NotEqualTo', () => {
          assert(operator, 1, '!=');
          assert(operator, 1, '!= ');
          assert(operator, 1, '!=\n');
          assert(operator, 1, '!=A');
          assert(operator, 1, '!=1');
          assert(operator, 1, '!=,');
          assert(operator, 1, '!==');
          assert(operator, 1, '!=!');
        });
        describe('GreaterThan', () => {
          assert(operator, 0, '>');
          assert(operator, 0, '> ');
          assert(operator, 0, '>\n');
          assert(operator, 0, '>A');
          assert(operator, 0, '>1');
          assert(operator, 0, '>,');
        });
        describe('GreaterThanOrEqualTo', () => {
          assert(operator, 1, '>=');
          assert(operator, 1, '>= ');
          assert(operator, 1, '>=\n');
          assert(operator, 1, '>=A');
          assert(operator, 1, '>=1');
          assert(operator, 1, '>=,');
          assert(operator, 1, '>==');
          assert(operator, 1, '>=>');
        });
        describe('LessThan', () => {
          assert(operator, 0, '<');
          assert(operator, 0, '< ');
          assert(operator, 0, '<\n');
          assert(operator, 0, '<A');
          assert(operator, 0, '<1');
          assert(operator, 0, '<,');
        });
        describe('LessThanOrEqualTo', () => {
          assert(operator, 1, '<=');
          assert(operator, 1, '<= ');
          assert(operator, 1, '<=\n');
          assert(operator, 1, '<=A');
          assert(operator, 1, '<=1');
          assert(operator, 1, '<=,');
          assert(operator, 1, '<==');
          assert(operator, 1, '<=<');
        });
      });
      describe('Bitwise', () => {
        describe('OnesComplements', () => {
          assert(operator, 0, '~');
          assert(operator, 0, '~ ');
          assert(operator, 0, '~\n');
          assert(operator, 0, '~A');
          assert(operator, 0, '~1');
          assert(operator, 0, '~,');
          assert(operator, 0, '~~');
        });
        describe('Or', () => {
          assert(operator, 0, '|');
          assert(operator, 0, '| ');
          assert(operator, 0, '|\n');
          assert(operator, 0, '|A');
          assert(operator, 0, '|1');
          assert(operator, 0, '|,');
          assert(operator, 0, '|&');
        });
      });
      describe('Assignment', () => {
        describe('Direct', () => {
          assert(operator, 0, '=');
          assert(operator, 0, '= ');
          assert(operator, 0, '=\n');
          assert(operator, 0, '=A');
          assert(operator, 0, '=1');
          assert(operator, 0, '=,');
        });
        describe('Addition', () => {
          assert(operator, 1, '+=');
          assert(operator, 1, '+= ');
          assert(operator, 1, '+=\n');
          assert(operator, 1, '+=A');
          assert(operator, 1, '+=1');
          assert(operator, 1, '+=,');
          assert(operator, 1, '+=+');
          assert(operator, 1, '+==');
        });
        describe('Subtraction', () => {
          assert(operator, 1, '-=');
          assert(operator, 1, '-= ');
          assert(operator, 1, '-=\n');
          assert(operator, 1, '-=A');
          assert(operator, 1, '-=1');
          assert(operator, 1, '-=,');
          assert(operator, 1, '-=-');
          assert(operator, 1, '-==');
        });
        describe('Multiplication', () => {
          assert(operator, 1, '*=');
          assert(operator, 1, '*= ');
          assert(operator, 1, '*=\n');
          assert(operator, 1, '*=A');
          assert(operator, 1, '*=1');
          assert(operator, 1, '*=,');
          assert(operator, 1, '*=*');
          assert(operator, 1, '*==');
        });
        describe('Modulo', () => {
          assert(operator, 1, '%=');
          assert(operator, 1, '%= ');
          assert(operator, 1, '%=\n');
          assert(operator, 1, '%=A');
          assert(operator, 1, '%=1');
          assert(operator, 1, '%=,');
          assert(operator, 1, '%=%');
          assert(operator, 1, '%==');
        });
        describe('BitwiseShiftLeft', () => {
          assert(operator, 2, '<<=');
          assert(operator, 2, '<<= ');
          assert(operator, 2, '<<=\n');
          assert(operator, 2, '<<=A');
          assert(operator, 2, '<<=1');
          assert(operator, 2, '<<=,');
          assert(operator, 2, '<<==');
          assert(operator, 2, '<<=<');
        });
        describe('BitwiseShiftRight', () => {
          assert(operator, 2, '>>=');
          assert(operator, 2, '>>= ');
          assert(operator, 2, '>>=\n');
          assert(operator, 2, '>>=A');
          assert(operator, 2, '>>=1');
          assert(operator, 2, '>>=,');
          assert(operator, 2, '>>==');
          assert(operator, 2, '>>=>');
        });
        describe('BitwiseAnd', () => {
          assert(operator, 1, '&=');
          assert(operator, 1, '&= ');
          assert(operator, 1, '&=\n');
          assert(operator, 1, '&=A');
          assert(operator, 1, '&=1');
          assert(operator, 1, '&=,');
          assert(operator, 1, '&==');
          assert(operator, 1, '&=&');
        });
        describe('BitwiseOr', () => {
          assert(operator, 1, '|=');
          assert(operator, 1, '|= ');
          assert(operator, 1, '|=\n');
          assert(operator, 1, '|=A');
          assert(operator, 1, '|=1');
          assert(operator, 1, '|=,');
          assert(operator, 1, '|==');
          assert(operator, 1, '|=|');
        });
        describe('BitwiseXor', () => {
          assert(operator, 1, '^=');
          assert(operator, 1, '^= ');
          assert(operator, 1, '^=\n');
          assert(operator, 1, '^=A');
          assert(operator, 1, '^=1');
          assert(operator, 1, '^=,');
          assert(operator, 1, '^==');
          assert(operator, 1, '^=^');
        });
      });
    });
    describe('Other', () => {
      describe('MemberSelectionDirect', () => {
        assert(operator, 0, '.');
        assert(operator, 0, '. ');
        assert(operator, 0, '.\n');
        assert(operator, 0, '.A');
        assert(operator, 0, '.1');
        assert(operator, 0, '.,');
        assert(operator, 0, '..');
        assert(operator, 0, '.. ');
        assert(operator, 0, '..\n');
      });
      describe('MemberSelectionIndirect', () => {
        assert(operator, 1, '->');
        assert(operator, 1, '-> ');
        assert(operator, 1, '->\n');
        assert(operator, 1, '->A');
        assert(operator, 1, '->1');
        assert(operator, 1, '->,');
        assert(operator, 1, '->>');
        assert(operator, 1, '->-');
      });
      describe('TernaryQuestion', () => {
        assert(operator, 0, '?');
        assert(operator, 0, '? ');
        assert(operator, 0, '?\n');
        assert(operator, 0, '?A');
        assert(operator, 0, '?1');
        assert(operator, 0, '?,');
        assert(operator, 0, '??');
      });
      describe('Ellipses', () => {
        assert(operator, 2, '...');
        assert(operator, 2, '... ');
        assert(operator, 2, '...\n');
        assert(operator, 2, '...A');
        assert(operator, 2, '...1');
        assert(operator, 2, '...,');
        assert(operator, 2, '....');
      });
    });
    describe('Ambiguous', () => {
      describe('Increment', () => {
          assert(operator, 1, '++');
          assert(operator, 1, '++ ');
          assert(operator, 1, '++\n');
          assert(operator, 1, '++A');
          assert(operator, 1, '++1');
          assert(operator, 1, '++,');
          assert(operator, 1, '+++');
        });
        describe('Decrement', () => {
          assert(operator, 1, '--');
          assert(operator, 1, '-- ');
          assert(operator, 1, '--\n');
          assert(operator, 1, '--A');
          assert(operator, 1, '--1');
          assert(operator, 1, '--,');
          assert(operator, 1, '---');
        });
      describe('Plus', () => {
        assert(operator, 0, '+');
        assert(operator, 0, '+ ');
        assert(operator, 0, '+\n');
        assert(operator, 0, '+A');
        assert(operator, 0, '+1');
        assert(operator, 0, '+,');
      });
      describe('Minus', () => {
        assert(operator, 0, '-');
        assert(operator, 0, '- ');
        assert(operator, 0, '-\n');
        assert(operator, 0, '-A');
        assert(operator, 0, '-1');
        assert(operator, 0, '-,');
      });
      describe('Asterisk', () => {
        assert(operator, 0, '*');
        assert(operator, 0, '* ');
        assert(operator, 0, '*\n');
        assert(operator, 0, '*A');
        assert(operator, 0, '*1');
        assert(operator, 0, '*,');
        assert(operator, 0, '**');
      });
      describe('Ampersand', () => {
        assert(operator, 0, '&');
        assert(operator, 0, '& ');
        assert(operator, 0, '&\n');
        assert(operator, 0, '&A');
        assert(operator, 0, '&1');
        assert(operator, 0, '&,');
      });
      describe('Colon', () => {
        assert(operator, 0, ':');
        assert(operator, 0, ': ');
        assert(operator, 0, ':\n');
        assert(operator, 0, ':A');
        assert(operator, 0, ':1');
        assert(operator, 0, ':,');
        assert(operator, 0, '::');
      });
    });
  });

  describe('Constant', () => {
    describe('Character', () => {
      assert(constant, 1, `' `);
      assert(constant, 2, `' '`);
      assert(constant, 2, `'A'`);
      assert(constant, 2, `'1'`);
      assert(constant, 3, `'\\''`);
      assert(constant, 3, `'\\t'`);
      assert(constant, 3, `'\\n'`);
      assert(constant, 3, `'\\r'`);
    });
    describe('String', () => {
      assert(constant, 1, `""`);
      assert(constant, 2, `" "`);
      assert(constant, 3, `"\\""`);
      assert(constant, 3, `"\\t"`);
      assert(constant, 3, `"\\n"`);
      assert(constant, 3, `"\\r"`);
      assert(constant, 4, `"ABC"`);
      assert(constant, 4, `"123"`);
    });
    describe('Number', () => {
      describe('int', () => {
        assert(constant, 2, '123'    ); // decimal
        assert(constant, 3, '123u '  ); // decimal unsigned
        assert(constant, 3, '123U\t' ); // decimal unsigned
        assert(constant, 3, '0123\n' ); // octal
        assert(constant, 4, '0x12c\r'); // hex
        assert(constant, 4, '0X12c'  ); // hex
        assert(constant, 4, '0x12C'  ); // hex
        assert(constant, 4, '0X12C'  ); // hex
      });
      describe('long', () => {
        assert(constant, 3, '123l`'   );
        assert(constant, 3, '123L~'   );
        assert(constant, 4, '123lu!'  ); // unsigned
        assert(constant, 4, "123lU@"  ); // unsigned
        assert(constant, 4, '123Lu#'  ); // unsigned
        assert(constant, 4, '123LU$'  ); // unsigned
        assert(constant, 4, '0123l%'  ); // octal
        assert(constant, 5, '0123lu^' ); // octal unsigned
        assert(constant, 5, '0123lU&' ); // octal unsigned
        assert(constant, 4, '0123L*'  ); // octal unsigned
        assert(constant, 5, '0123Lu(' ); // octal unsigned
        assert(constant, 5, '0123LU)' ); // octal unsigned
        assert(constant, 5, '0x12cl-' ); // hex
        assert(constant, 5, '0X12CL_' ); // hex
        assert(constant, 6, '0x12clu='); // hex unsigned
        assert(constant, 6, '0x12clU+'); // hex unsigned
        assert(constant, 6, '0X12CLu' ); // hex unsigned
        assert(constant, 6, '0X12CLU' ); // hex unsigned
      });
      describe('long long', () => {
        assert(constant, 4, '123ll['    );
        assert(constant, 4, '123lL{'    );
        assert(constant, 4, '123LL]'    );
        assert(constant, 5, '123llu}'   ); // unsigned
        assert(constant, 5, "123llU\\"  ); // unsigned
        assert(constant, 5, '123LLu|'   ); // unsigned
        assert(constant, 5, '123LLU;'   ); // unsigned
        assert(constant, 5, '0123ll:'   ); // octal
        assert(constant, 6, '0123llu\'' ); // octal unsigned
        assert(constant, 6, '0123llU"'  ); // octal unsigned
        assert(constant, 5, '0123LL,'   ); // octal unsigned
        assert(constant, 6, '0123LLu<'  ); // octal unsigned
        assert(constant, 6, '0123LLU '  ); // octal unsigned
        assert(constant, 6, '0x12cll>'  ); // hex
        assert(constant, 6, '0X12CLL/'  ); // hex
        assert(constant, 7, '0x12cllu?' ); // hex unsigned
        assert(constant, 7, '0x12cllU'  ); // hex unsigned
        assert(constant, 7, '0X12CLLu'  ); // hex unsigned
        assert(constant, 7, '0X12CLLU'  ); // hex unsigned
      });
      describe('long long unsigned', () => {
        assert(constant, 4, '123ll'   );
        assert(constant, 4, '123LL'   );
        assert(constant, 5, '123llu'  ); // unsigned
        assert(constant, 5, '123llU'  ); // unsigned
        assert(constant, 5, '123LLu'  ); // unsigned
        assert(constant, 5, '123LLU'  ); // unsigned
        assert(constant, 5, '0123ll'  ); // octal
        assert(constant, 5, '0123ll'  ); // octal unsigned
        assert(constant, 6, '0123llU' ); // octal unsigned
        assert(constant, 5, '0123LL'  ); // octal unsigned
        assert(constant, 6, '0123LLu' ); // octal unsigned
        assert(constant, 6, '0123LLU' ); // octal unsigned
        assert(constant, 6, '0x12cll' ); // hex
        assert(constant, 6, '0X12CLL' ); // hex
        assert(constant, 7, '0x12cllu'); // hex unsigned
        assert(constant, 7, '0x12cllU'); // hex unsigned
        assert(constant, 7, '0X12CLLu'); // hex unsigned
        assert(constant, 7, '0X12CLLU'); // hex unsigned
      });
      describe('float', () => {
        assert(constant, 5, '123.45 ');
        assert(constant, 6, '123.45f');
        assert(constant, 6, '123.45F');
      });
    });
  });

  describe('preproMacroOrKeywordOrIdentifierOrLabel', () => {
    assert(preproMacroOrKeywordOrIdentifierOrLabel,  0, 'i++');
    assert(preproMacroOrKeywordOrIdentifierOrLabel,  2, 'abc');
    assert(preproMacroOrKeywordOrIdentifierOrLabel,  2, 'ABC');
    assert(preproMacroOrKeywordOrIdentifierOrLabel,  4, 'label:');
    assert(preproMacroOrKeywordOrIdentifierOrLabel,  7, '__FILE__');
    assert(preproMacroOrKeywordOrIdentifierOrLabel,  7, '__LINE__');
    assert(preproMacroOrKeywordOrIdentifierOrLabel,  7, '__DATE__');
    assert(preproMacroOrKeywordOrIdentifierOrLabel,  7, '__TIME__');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, 12, '__TIMESTAMP__');
  });
});
