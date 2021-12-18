import { _determineTokenCategory, _TokenCategory } from "../lexer";

describe("_determineTokenCategory", () => {
  function assert(
    firstCharOfToken: string,
    expectedCategory: _TokenCategory,
    firstIndexOfToken = 0
  ) {
    test(`return ${expectedCategory} when firstCharOfToken=${firstCharOfToken}`, () => {
      expect(_determineTokenCategory(firstCharOfToken, firstIndexOfToken)).toBe(
        expectedCategory
      );
    });
  }

  describe('Special', () => {
    assert(',', _TokenCategory.special);
    // assert(".", _TokenCategory.special);
    assert(';', _TokenCategory.special);
    assert('[', _TokenCategory.special);
    assert(']', _TokenCategory.special);
    assert('(', _TokenCategory.special);
    assert(')', _TokenCategory.special);
    assert('{', _TokenCategory.special);
    assert('}', _TokenCategory.special);
  });

  describe('Preprocessor', () => {
    assert('#', _TokenCategory.prepro);
    assert('##', _TokenCategory.prepro);
    assert('#include', _TokenCategory.prepro);
    assert('<stdio.h>', _TokenCategory.preproOrOperator);
    assert('#define', _TokenCategory.prepro);
    assert('\\', _TokenCategory.preproOrOperator);
    assert('#undef', _TokenCategory.prepro);
    assert('#if', _TokenCategory.prepro);
    assert('#ifdef', _TokenCategory.prepro);
    assert('#ifndef', _TokenCategory.prepro);
    assert('#error', _TokenCategory.prepro);
    assert('__FILE__', _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
    assert('__LINE__', _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
    assert('__DATE__', _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
    assert('__TIME__', _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
    assert(
      '__TIMESTAMP__',
      _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
    );
    assert('#pragma', _TokenCategory.prepro);
  });

  describe('Operators', () => {
    describe('Unary', () => {
      assert('++', _TokenCategory.operator);
      assert('--', _TokenCategory.operator);
      assert('~', _TokenCategory.operator);
      assert('!', _TokenCategory.operator);
      assert('*', _TokenCategory.operator);
    });
    describe('Binary', () => {
      assert('+', _TokenCategory.operator);
      assert('-', _TokenCategory.operator);
      assert('/', _TokenCategory.operator);
      assert('*', _TokenCategory.operator);
      assert('%', _TokenCategory.operator);
      assert('==', _TokenCategory.operator);
      assert('!=', _TokenCategory.operator);
      assert('>', _TokenCategory.operator);
      assert('>=', _TokenCategory.operator);
      assert('<', _TokenCategory.preproOrOperator);
      assert('<=', _TokenCategory.preproOrOperator);
      assert('&&', _TokenCategory.operator);
      assert('||', _TokenCategory.operator);
      assert('&', _TokenCategory.operator);
      assert('|', _TokenCategory.operator);
      assert('^', _TokenCategory.operator);
      assert('<<', _TokenCategory.preproOrOperator);
      assert('>>', _TokenCategory.operator);
      assert('=', _TokenCategory.operator);
      assert('+=', _TokenCategory.operator);
      assert('-=', _TokenCategory.operator);
      assert('*=', _TokenCategory.operator);
      assert('/=', _TokenCategory.operator);
      assert('%=', _TokenCategory.operator);
      assert('<<=', _TokenCategory.preproOrOperator);
      assert('>>=', _TokenCategory.operator);
      assert('&=', _TokenCategory.operator);
      assert('|=', _TokenCategory.operator);
      assert('^=', _TokenCategory.operator);
      assert('.', _TokenCategory.operator);
      assert('->', _TokenCategory.operator);
      assert('?', _TokenCategory.operator);
      assert(':', _TokenCategory.operator);
    });
  });

  describe("Constants", () => {
    assert("'a'", _TokenCategory.constant);
    assert('"string literal"', _TokenCategory.constant);
    describe("int", () => {
      assert("123", _TokenCategory.constant); // decimal
      assert("123u", _TokenCategory.constant); // decimal unsigned
      assert("123U", _TokenCategory.constant); // decimal unsigned
      assert("0123", _TokenCategory.constant); // octal
      assert("0x12c", _TokenCategory.constant); // hex
      assert("0x12C", _TokenCategory.constant); // hex
    });
    describe("long", () => {
      assert("123l", _TokenCategory.constant);
      assert("123lu", _TokenCategory.constant); // unsigned
      assert("123lU", _TokenCategory.constant); // unsigned
      assert("123L", _TokenCategory.constant);
      assert("123Lu", _TokenCategory.constant); // unsigned
      assert("123LU", _TokenCategory.constant); // unsigned
      assert("0123l", _TokenCategory.constant); // octal
      assert("0123lu", _TokenCategory.constant); // octal unsigned
      assert("0123lU", _TokenCategory.constant); // octal unsigned
      assert("0123L", _TokenCategory.constant); // octal
      assert("0123Lu", _TokenCategory.constant); // octal unsigned
      assert("0123LU", _TokenCategory.constant); // octal unsigned
      assert("0x12clu", _TokenCategory.constant); // hex
      assert("0x12clU", _TokenCategory.constant); // hex unsigned
      assert("0X12Cu", _TokenCategory.constant); // hex
      assert("0X12CU", _TokenCategory.constant); // hex unsigned
    });
    describe("long long int", () => {
      assert("123ll", _TokenCategory.constant);
      assert("123llu", _TokenCategory.constant); // unsigned
      assert("123llU", _TokenCategory.constant); // unsigned
      assert("123LL", _TokenCategory.constant);
      assert("123LLu", _TokenCategory.constant); // unsigned
      assert("123LLU", _TokenCategory.constant); // unsigned
      assert("0123ll", _TokenCategory.constant); // octal
      assert("0123llu", _TokenCategory.constant); // octal unsigned
      assert("0123llU", _TokenCategory.constant); // octal unsigned
      assert("0123LL", _TokenCategory.constant); // octal unsigned
      assert("0123LLu", _TokenCategory.constant); // octal unsigned
      assert("0123LLU", _TokenCategory.constant); // octal unsigned
      assert("0x12cll", _TokenCategory.constant); // hex
      assert("0x12cllu", _TokenCategory.constant); // hex unsigned
      assert("0x12cllU", _TokenCategory.constant); // hex unsigned
      assert("0x12CLL", _TokenCategory.constant); // hex
      assert("0x12CLLu", _TokenCategory.constant); // hex unsigned
      assert("0x12CLLU", _TokenCategory.constant); // hex unsigned
    });
    describe("float", () => {
      assert("123.45", _TokenCategory.constant);
    });
  });

  describe("Keywords", () => {
    describe("common", () => {
      assert("auto", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("break", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("case", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("char", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("const", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert(
        "continue",
        _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel
      );
      assert("default", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("do", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("double", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("else", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("enum", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("extern", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("float", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("for", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("goto", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("if", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("inline", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("int", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("long", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert(
        "register",
        _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel
      );
      assert(
        "restrict",
        _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel
      );
      assert("return", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("short", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("signed", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("sizeof", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("static", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("struct", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("switch", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("typedef", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("union", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert(
        "unsigned",
        _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel
      );
      assert("void", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert(
        "volatile",
        _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel
      );
      assert("while", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
    });
    describe("reserved & convenience macros", () => {
      assert(
        "_Alignas",
        _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel
      );
      assert("alignas", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert(
        "_Alignof",
        _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel
      );
      assert("alignof", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("_Atomic", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("atomic", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("_Bool", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert("bool", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert(
        "_Complex",
        _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel
      );
      assert("complex", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert(
        "_Generic",
        _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel
      );
      assert("generic", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
      assert(
        "_Imaginary",
        _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel
      );
      assert(
        "imaginary",
        _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel
      );
      assert(
        "_Noreturn",
        _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel
      );
      assert(
        "noreturn",
        _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel
      );
      assert(
        "_Static_assert",
        _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel
      );
      assert(
        "static_assert",
        _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel
      );
      assert(
        "_Thread_local",
        _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel
      );
      assert(
        "thread_local",
        _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel
      );
    });
  });

  describe("Identifiers", () => {
    assert("myVar123", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
    assert("bool_var", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
    assert("func_name", _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel);
    assert(
      "_func_name",
      _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel
    );
    assert(
      "some_struct_t",
      _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel
    );
  });
});
