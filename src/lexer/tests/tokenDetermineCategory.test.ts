import TokenCategory from '../TokenCategory';
import tokenDetermineCategory from '../tokenDetermineCategory';

describe('tokenDetermineCategory', () => {
  function assert(
    firstCharOfToken: string,
    expectedCategory: TokenCategory,
    firstIndexOfToken = 0,
  ) {
    test(`return ${expectedCategory} when firstCharOfToken=${firstCharOfToken}`, () => {
      expect(tokenDetermineCategory(firstCharOfToken, firstIndexOfToken)).toBe(
        expectedCategory,
      );
    });
  }

  describe('Special', () => {
    assert(',', TokenCategory.special);
    assert(';', TokenCategory.special);
    assert('[', TokenCategory.special);
    assert(']', TokenCategory.special);
    assert('(', TokenCategory.special);
    assert(')', TokenCategory.special);
    assert('{', TokenCategory.special);
    assert('}', TokenCategory.special);
  });

  describe('Preprocessor', () => {
    assert('#', TokenCategory.prepro);
    assert('##', TokenCategory.prepro);
    assert('#include', TokenCategory.prepro);
    assert('<stdio.h>', TokenCategory.preproOrOperator);
    assert('#define', TokenCategory.prepro);
    assert('\\', TokenCategory.prepro);
    assert('#undef', TokenCategory.prepro);
    assert('#ifdef', TokenCategory.prepro);
    assert('#ifndef', TokenCategory.prepro);
    assert('#if', TokenCategory.prepro);
    assert('#else', TokenCategory.prepro);
    assert('#elif', TokenCategory.prepro);
    assert('#endif', TokenCategory.prepro);
    assert('#error', TokenCategory.prepro);
    assert('__FILE__', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
    assert('__LINE__', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
    assert('__DATE__', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
    assert('__TIME__', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
    assert('__TIMESTAMP__', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
    assert('#pragma', TokenCategory.prepro);
  });

  describe('Operators', () => {
    describe('Unary', () => {
      assert('++', TokenCategory.operator);
      assert('--', TokenCategory.operator);
      assert('~', TokenCategory.operator);
      assert('!', TokenCategory.operator);
      assert('*', TokenCategory.operator);
    });
    describe('Binary', () => {
      assert('+', TokenCategory.operator);
      assert('-', TokenCategory.operator);
      assert('/', TokenCategory.commentOrOperator);
      assert('*', TokenCategory.operator);
      assert('%', TokenCategory.operator);
      assert('==', TokenCategory.operator);
      assert('!=', TokenCategory.operator);
      assert('>', TokenCategory.operator);
      assert('>=', TokenCategory.operator);
      assert('<', TokenCategory.preproOrOperator);
      assert('<=', TokenCategory.preproOrOperator);
      assert('&&', TokenCategory.operator);
      assert('||', TokenCategory.operator);
      assert('&', TokenCategory.operator);
      assert('|', TokenCategory.operator);
      assert('^', TokenCategory.operator);
      assert('<<', TokenCategory.preproOrOperator);
      assert('>>', TokenCategory.operator);
      assert('=', TokenCategory.operator);
      assert('+=', TokenCategory.operator);
      assert('-=', TokenCategory.operator);
      assert('*=', TokenCategory.operator);
      assert('/=', TokenCategory.commentOrOperator);
      assert('%=', TokenCategory.operator);
      assert('<<=', TokenCategory.preproOrOperator);
      assert('>>=', TokenCategory.operator);
      assert('&=', TokenCategory.operator);
      assert('|=', TokenCategory.operator);
      assert('^=', TokenCategory.operator);
      assert('.', TokenCategory.operator);
      assert('->', TokenCategory.operator);
      assert('?', TokenCategory.operator);
      assert(':', TokenCategory.operator);
      assert('...', TokenCategory.operator);
    });
  });

  describe('Constants', () => {
    assert("'a'", TokenCategory.constant);
    assert('"string literal"', TokenCategory.constant);
    describe('int', () => {
      assert('123', TokenCategory.constant); // decimal
      assert('123u', TokenCategory.constant); // decimal unsigned
      assert('123U', TokenCategory.constant); // decimal unsigned
      assert('0123', TokenCategory.constant); // octal
      assert('0x12c', TokenCategory.constant); // hex
      assert('0x12C', TokenCategory.constant); // hex
    });
    describe('long', () => {
      assert('123l', TokenCategory.constant);
      assert('123lu', TokenCategory.constant); // unsigned
      assert('123lU', TokenCategory.constant); // unsigned
      assert('123L', TokenCategory.constant);
      assert('123Lu', TokenCategory.constant); // unsigned
      assert('123LU', TokenCategory.constant); // unsigned
      assert('0123l', TokenCategory.constant); // octal
      assert('0123lu', TokenCategory.constant); // octal unsigned
      assert('0123lU', TokenCategory.constant); // octal unsigned
      assert('0123L', TokenCategory.constant); // octal
      assert('0123Lu', TokenCategory.constant); // octal unsigned
      assert('0123LU', TokenCategory.constant); // octal unsigned
      assert('0x12clu', TokenCategory.constant); // hex
      assert('0x12clU', TokenCategory.constant); // hex unsigned
      assert('0X12Cu', TokenCategory.constant); // hex
      assert('0X12CU', TokenCategory.constant); // hex unsigned
    });
    describe('long long int', () => {
      assert('123ll', TokenCategory.constant);
      assert('123llu', TokenCategory.constant); // unsigned
      assert('123llU', TokenCategory.constant); // unsigned
      assert('123LL', TokenCategory.constant);
      assert('123LLu', TokenCategory.constant); // unsigned
      assert('123LLU', TokenCategory.constant); // unsigned
      assert('0123ll', TokenCategory.constant); // octal
      assert('0123llu', TokenCategory.constant); // octal unsigned
      assert('0123llU', TokenCategory.constant); // octal unsigned
      assert('0123LL', TokenCategory.constant); // octal unsigned
      assert('0123LLu', TokenCategory.constant); // octal unsigned
      assert('0123LLU', TokenCategory.constant); // octal unsigned
      assert('0x12cll', TokenCategory.constant); // hex
      assert('0x12cllu', TokenCategory.constant); // hex unsigned
      assert('0x12cllU', TokenCategory.constant); // hex unsigned
      assert('0x12CLL', TokenCategory.constant); // hex
      assert('0x12CLLu', TokenCategory.constant); // hex unsigned
      assert('0x12CLLU', TokenCategory.constant); // hex unsigned
    });
    describe('float', () => {
      assert('123.45', TokenCategory.constant);
      assert('123.45f', TokenCategory.constant);
      assert('123.45F', TokenCategory.constant);
    });
  });

  describe('Keywords', () => {
    describe('Common', () => {
      assert('auto', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('break', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('case', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('char', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('const', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('continue', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('default', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('do', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('double', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('else', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('enum', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('extern', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('float', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('for', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('goto', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('if', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('inline', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('int', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('long', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('register', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('restrict', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('return', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('short', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('signed', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('sizeof', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('static', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('struct', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('switch', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('typedef', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('union', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('unsigned', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('void', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('volatile', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('while', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
    });
    describe('Reserved & convenience macros', () => {
      assert('_Alignas', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('alignas', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('_Alignof', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('alignof', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('_Atomic', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('atomic', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('_Bool', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('bool', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('_Complex', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('complex', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('_Generic', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('generic', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('_Imaginary', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('imaginary', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('_Noreturn', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('noreturn', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('_Static_assert', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('static_assert', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('_Thread_local', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('thread_local', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
    });
  });

  describe('Other', () => {
    describe('Identifiers', () => {
      assert('myVar123', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('bool_var', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('func_name', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('_func_name', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('some_struct_t', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
    });

    describe('Labels', () => {
      assert('get_out:', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('exit:', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert('handle_error:', TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
    });

    describe('Comments', () => {
      assert('// Single line comment', TokenCategory.commentOrOperator);
      assert('/* Multiple line comment */', TokenCategory.commentOrOperator);
    });

    describe('Newline', () => {
      assert('\n', TokenCategory.newline);
    });
  });
});
