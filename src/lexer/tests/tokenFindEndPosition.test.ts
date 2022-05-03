import TokenCategory from '../TokenCategory';
import tokenFindEndPosition, { findEndPositionNumericConstant } from '../tokenFindEndPosition';

const [
  newline,
  special,
  preproDirective,
  commentOrOperator,
  operator,
  constant,
  operatorOrConstant,
  preproMacroOrKeywordOrIdentifierOrLabel,
] = [
  TokenCategory.newline,
  TokenCategory.special,
  TokenCategory.preproDirective,
  TokenCategory.commentOrOperator,
  TokenCategory.operator,
  TokenCategory.constant,
  TokenCategory.operatorOrConstant,
  TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
];

describe('findEndPositionNumericConstant', () => {
  function assert(
    expectedEndPos: number,
    fileContents: string,
  ) {
    test(`${expectedEndPos} when fileContents=${JSON.stringify(
      fileContents,
    )}`, () => {
      expect(
        findEndPositionNumericConstant(0, fileContents),
      ).toBe(expectedEndPos);
    });
  }

  describe('decimal', () => {
    assert(0, '1');
    assert(1, '12');
    assert(2, '123');
    assert(3, '123U');
    assert(3, '123L');
    assert(4, '123UL');
    assert(4, '123LL');
    assert(5, '123ULL');
    assert(5, '123LLU');
  });
  describe('octal', () => {
    assert(1, '01');
    assert(2, '012');
    assert(3, '0123');
    assert(4, '0123U');
    assert(4, '0123L');
    assert(5, '0123UL');
    assert(5, '0123LL');
    assert(6, '0123ULL');
    assert(6, '0123LLU');
  });
  describe('hexadecimal', () => {
    assert(2, '0x1');
    assert(3, '0x12');
    assert(4, '0x123');
    assert(4, '0x1e2');
    assert(7, '0xABCDEF');
    assert(8, '0xABCDEFu');
    assert(8, '0xABCDEFl');
    assert(9, '0xABCDEFlu');
    assert(9, '0xABCDEFll');
    assert(10, '0xABCDEFllu');
    assert(10, '0x123ABCDEF');
    assert(11, '0x123ABCDEFu');
    assert(11, '0x123ABCDEFl');
    assert(12, '0x123ABCDEFlu');
    assert(12, '0x123ABCDEFll');
    assert(13, '0x123ABCDEFllu');
    assert(10, '0xABCDEF123');
    assert(11, '0xABCDEF123u');
    assert(11, '0xABCDEF123l');
    assert(12, '0xABCDEF123lu');
    assert(12, '0xABCDEF123ll');
    assert(13, '0xABCDEF123llu');
  });
  describe('binary', () => {
    assert(2, '0b1');
    assert(3, '0b10');
    assert(4, '0b101');
    assert(5, '0b101U');
    assert(5, '0b101L');
    assert(6, '0b101LU');
    assert(6, '0b101LL');
    assert(7, '0b101LLU');
  });
  describe('floating', () => {
    assert(3, '0.0f');
    assert(3, '1.0f');
    assert(7, '1.0e+123');
    assert(8, '1.0e+123f');
    assert(7, '1.0e-123');
    assert(8, '1.0e-123f');
    assert(3, '.123');
    assert(4, '.123f');
    assert(8, '.123e+123');
    assert(8, '.123e-123');
    assert(9, '.123e+123f');
    assert(9, '.123e-123f');
  });
  describe('bogus', () => {
    /*
      even though these are not valid numeric literals,
      we still consider them as one token
    */
    assert(5, '123abc');
    assert(5, '0x1.0f');
    assert(6, '0123abc');
    assert(4, '0b123');
    assert(4, '0bAbc');
  });
});

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
  function assertThrows(
    category: TokenCategory,
    fileContents: string,
  ) {
    test(`throws when fileContents=${JSON.stringify(
      fileContents,
    )}`, () => {
      expect(
        () => tokenFindEndPosition(fileContents, 0, category),
      ).toThrow();
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

  describe('preproDirective', () => {
    assert(preproDirective,  0, '#');
    assert(preproDirective,  0, '#\n');
    assert(preproDirective,  2, '#\\\n\n');
    assert(preproDirective, 18, '# include <stdio.h>');
    assert(preproDirective, 18, '# include <stdio.h>\n');
    assert(preproDirective, 10, '#define A 1');
    assert(preproDirective, 10, '#define A 1\n');
    assert(preproDirective, 26, '#define A \\\n \\\n 1 \\\n + \\\n 2');
    assert(preproDirective, 26, '#define A \\\n \\\n 1 \\\n + \\\n 2\n');
    assertThrows(preproDirective, '#define A 1 /*\n');
    assertThrows(preproDirective, '#define A 1 /* comment \n */');
    assertThrows(preproDirective, '#include <stdio.h> /*\n');
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
        assert(operatorOrConstant, 0, '.');
        assert(operatorOrConstant, 0, '. ');
        assert(operatorOrConstant, 0, '.\n');
        assert(operatorOrConstant, 0, '.A');
        assert(operatorOrConstant, 0, '.,');
        assert(operatorOrConstant, 0, '..');
        assert(operatorOrConstant, 0, '.. ');
        assert(operatorOrConstant, 0, '..\n');
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
        assert(operatorOrConstant, 2, '...');
        assert(operatorOrConstant, 2, '... ');
        assert(operatorOrConstant, 2, '...\n');
        assert(operatorOrConstant, 2, '...A');
        assert(operatorOrConstant, 2, '...1');
        assert(operatorOrConstant, 2, '...,');
        assert(operatorOrConstant, 2, '....');
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
      assert(constant, 4, `'0x3'`);
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
        assert(constant, 4, '123lU@'  ); // unsigned
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
        assert(constant, 5, '123llU\\'  ); // unsigned
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
