#include <sstream>
#include <unordered_map>

#include "lexer.hpp"
#include "format.hpp"
#include "test.hpp"
#include "util.hpp"

int main() {
  test::set_verbose_mode(false);
  test::set_indentation("  ");
  test::use_stdout(true);

  using
    lexer::TokenCategory,
    lexer::TokenType,
    std::fstream,
    std::string,
    std::stringstream,
    std::vector;

  auto const exitIfAnyAssertionsFailedThusFar = []() {
    int const assertionsFailedThusFar =
      static_cast<int>(test::assertions_failed());
    if (assertionsFailedThusFar > 0)
      std::exit(assertionsFailedThusFar);
  };

  {
    SETUP_SUITE_USING(lexer::determine_token_category)

    auto const testCase = [&s](
      char const *const input,
      TokenCategory const expected
    ) {
      string const name = std::to_string(static_cast<uint8_t>(*input));
      s.assert(
        (string("ASCII ") + name).c_str(),
        lexer::determine_token_category(*input) == expected
      );
    };

    testCase("\n", TokenCategory::NEWLINE);
    testCase("#", TokenCategory::PREPRO);
    testCase(".", TokenCategory::OPER_OR_LITERAL_OR_SPECIAL);
    testCase("/", TokenCategory::OPER_OR_COMMENT);

    auto const groupTest = [&testCase](
      char const *chars,
      TokenCategory const expected
    ) {
      while (*chars != '\0') {
        char const input[] { *chars, '\0' };
        testCase(input, expected);
        ++chars;
      }
    };

    groupTest(
      "abcdefghijklmnopqrstuvwxyz"
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      "_",
      TokenCategory::KEYWORD_OR_IDENTIFIER
    );

    groupTest("0123456789\"'", TokenCategory::LITERAL);
    groupTest("!%&*+-<=>^|~", TokenCategory::OPERATOR);
    groupTest("(),:;?[\\]{}", TokenCategory::SPECIAL);
    groupTest(" \t\r@`", TokenCategory::NIL);
  } // lexer::token_determine_category

  exitIfAnyAssertionsFailedThusFar();

  {
    SETUP_SUITE_USING(lexer::determine_token_len)

    auto const testCase = [&s](
      TokenCategory const category,
      size_t const expected,
      char const *const input
    ) {
      size_t const result = lexer::determine_token_len(
        input, category, std::strlen(input)
      );

      stringstream ss{};
      ss << '"' << input << "\" = " << expected << " (got " << result << ')';
      string name = ss.str();
      util::escape_escape_sequences(name);

      s.assert(name.c_str(), result == expected);
    };

    testCase(TokenCategory::NEWLINE, 1, "\n");
    testCase(TokenCategory::NEWLINE, 1, "\n ");
    testCase(TokenCategory::NEWLINE, 1, "\n\n");

    testCase(TokenCategory::PREPRO, 7, "#define");
    testCase(TokenCategory::PREPRO, 7, "#define ");
    testCase(TokenCategory::PREPRO, 8, "# define\t");
    testCase(TokenCategory::PREPRO, 8, "#\tdefine\t");
    testCase(TokenCategory::PREPRO, 2, "##\t");
    testCase(TokenCategory::PREPRO, 2, "###");

    testCase(TokenCategory::OPER_OR_LITERAL_OR_SPECIAL, 1, ".");
    testCase(TokenCategory::OPER_OR_LITERAL_OR_SPECIAL, 1, ".a");
    testCase(TokenCategory::OPER_OR_LITERAL_OR_SPECIAL, 3, ".0f+");
    testCase(TokenCategory::OPER_OR_LITERAL_OR_SPECIAL, 4, ".123 ");
    testCase(TokenCategory::OPER_OR_LITERAL_OR_SPECIAL, 3, "...\n");

    testCase(TokenCategory::OPER_OR_COMMENT, 1, "/");
    testCase(TokenCategory::OPER_OR_COMMENT, 1, "/ ");
    testCase(TokenCategory::OPER_OR_COMMENT, 1, "/\n");
    testCase(TokenCategory::OPER_OR_COMMENT, 1, "/A");
    testCase(TokenCategory::OPER_OR_COMMENT, 1, "/1");
    testCase(TokenCategory::OPER_OR_COMMENT, 1, "/,");
    testCase(TokenCategory::OPER_OR_COMMENT, 1, "/+");
    testCase(TokenCategory::OPER_OR_COMMENT, 2, "/=");
    testCase(TokenCategory::OPER_OR_COMMENT, 2, "/= ");
    testCase(TokenCategory::OPER_OR_COMMENT, 2, "/=\n");
    testCase(TokenCategory::OPER_OR_COMMENT, 2, "/=A");
    testCase(TokenCategory::OPER_OR_COMMENT, 2, "/=1");
    testCase(TokenCategory::OPER_OR_COMMENT, 2, "/=,");
    testCase(TokenCategory::OPER_OR_COMMENT, 2, "/=+");
    testCase(TokenCategory::OPER_OR_COMMENT, 3, "// ");
    testCase(TokenCategory::OPER_OR_COMMENT, 3, "// \n");
    testCase(TokenCategory::OPER_OR_COMMENT, 10, "//\tcomment\n");
    testCase(TokenCategory::OPER_OR_COMMENT, 23, "// comment \\\n continued");
    testCase(TokenCategory::OPER_OR_COMMENT, 5, "/* */ ");
    testCase(TokenCategory::OPER_OR_COMMENT, 13, "/* comment */");
    testCase(TokenCategory::OPER_OR_COMMENT, 5, "/***/");
    testCase(TokenCategory::OPER_OR_COMMENT, 3, "/* ");

    // keywords:
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 4, "auto");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 5, "break");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 4, "case");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 4, "char");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 5, "const");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 8, "continue");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 7, "default");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 2, "do");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 6, "double");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 4, "else");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 4, "enum");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 6, "extern");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 5, "float");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 3, "for");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 4, "goto");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 2, "if");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 6, "inline");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 3, "int");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 4, "long");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 8, "register");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 8, "restrict");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 6, "return");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 5, "short");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 6, "signed");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 6, "sizeof");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 6, "static");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 6, "struct");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 6, "switch");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 7, "typedef");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 5, "union");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 8, "unsigned");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 4, "void");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 8, "volatile");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 5, "while");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 8, "_Alignas");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 8, "_Alignof");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 7, "_Atomic");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 5, "_Bool");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 8, "_Complex");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 8, "_Generic");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 10, "_Imaginary");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 9, "_Noreturn");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 14, "_Static_assert");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 13, "_Thread_local");

    // identifiers:
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 1, "a ");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 1, "_\t");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 2, "_1\n");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 4, "_Var;");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 9, "some_func(");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 8, "Employee");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 4, "num1=");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 6, "Num123+");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 7, "_Num123");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 10, "pascalCase*");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 15, "SCREAMING_SNAKE##");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 5, "name_");
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, 8, "__FUNC__");

    // char literals:
    testCase(TokenCategory::LITERAL, 1, "'"); // unclosed, that's ok for us
    testCase(TokenCategory::LITERAL, 2, "' "); // unclosed, that's ok for us
    testCase(TokenCategory::LITERAL, 3, "' '");
    testCase(TokenCategory::LITERAL, 3, "'a'");
    testCase(TokenCategory::LITERAL, 3, "'1'");
    testCase(TokenCategory::LITERAL, 4, "'\\''");
    testCase(TokenCategory::LITERAL, 4, "'\\t' ");
    testCase(TokenCategory::LITERAL, 4, "'\\n' \n");
    testCase(TokenCategory::LITERAL, 4, "'\\r' +");
    testCase(TokenCategory::LITERAL, 5, "'123' a");
    // string literals:
    testCase(TokenCategory::LITERAL, 1, "\""); // unclosed, that's ok for us
    testCase(TokenCategory::LITERAL, 2, "\" "); // unclosed, that's ok for us
    testCase(TokenCategory::LITERAL, 2, "\"\"");
    testCase(TokenCategory::LITERAL, 3, "\"a\"");
    testCase(TokenCategory::LITERAL, 8, "\"abc123\"");
    testCase(TokenCategory::LITERAL, 4, "\"\\t\" ");
    testCase(TokenCategory::LITERAL, 4, "\"\\n\" \n");
    testCase(TokenCategory::LITERAL, 4, "\"\\r\" +");
    testCase(TokenCategory::LITERAL, 4, "\"a1\" a");
    // numeric literals:
    testCase(TokenCategory::LITERAL, 1, "0");
    testCase(TokenCategory::LITERAL, 1, "0;");
    testCase(TokenCategory::LITERAL, 1, "0 ");
    testCase(TokenCategory::LITERAL, 1, "0+");
    testCase(TokenCategory::LITERAL, 2, "0u");
    testCase(TokenCategory::LITERAL, 4, "0Ull");
    testCase(TokenCategory::LITERAL, 4, "0Ull+");
    testCase(TokenCategory::LITERAL, 4, "0Ull;");
    testCase(TokenCategory::LITERAL, 4, "0123\t");    // octal
    testCase(TokenCategory::LITERAL, 8, "0xabc123,"); // hex
    // interesting case, could be mistaken for float in exponential form:
    testCase(TokenCategory::LITERAL, 3, "0xE-");      // hex
    testCase(TokenCategory::LITERAL, 3, "0b0\t");     // binary
    testCase(TokenCategory::LITERAL, 6, "0b0101)");   // binary
    testCase(TokenCategory::LITERAL, 8, "1.23e-3f");  // float
    testCase(TokenCategory::LITERAL, 7, "1.23e+3\t"); // double
    testCase(TokenCategory::LITERAL, 6, ".0e-3f+");   // float
    testCase(TokenCategory::LITERAL, 5, ".0e-3-");    // double
    testCase(TokenCategory::LITERAL, 5, ".0e-3)");    // double
    // these are technically invalid numeric literals, but we lex them anyway:
    testCase(TokenCategory::LITERAL, 4, "0abc");
    testCase(TokenCategory::LITERAL, 8, ".0e-3.2f");
    testCase(TokenCategory::LITERAL, 4, "0Xgh");
    testCase(TokenCategory::LITERAL, 7, "0.1.2.3-");

    auto const operatorTests = [&s](string const op) {
      s.assert(
        op.c_str(),
        determine_token_len(
          op.c_str(),
          TokenCategory::OPERATOR,
          op.length()
        )
      );
      string const spaceAfter = op + ' ';
      s.assert(
        spaceAfter.c_str(),
        determine_token_len(
          spaceAfter.c_str(),
          TokenCategory::OPERATOR,
          op.length() + 1
        )
      );
      string const newlineAfter = op + '\n';
      s.assert(
        newlineAfter.c_str(),
        determine_token_len(newlineAfter.c_str(), TokenCategory::OPERATOR, op.length() + 1)
      );
      string const alphbeticCharAfter = op + 'a';
      s.assert(
        alphbeticCharAfter.c_str(),
        determine_token_len(alphbeticCharAfter.c_str(), TokenCategory::OPERATOR, op.length() + 1)
      );
      string const digitAfter = op + '1';
      s.assert(
        digitAfter.c_str(),
        determine_token_len(digitAfter.c_str(), TokenCategory::OPERATOR, op.length() + 1)
      );
      string const commaAfter = op + ',';
      s.assert(
        commaAfter.c_str(),
        determine_token_len(commaAfter.c_str(), TokenCategory::OPERATOR, op.length() + 1)
      );
      string const firstCharRepeated = op + op.at(0);
      s.assert(
        firstCharRepeated.c_str(),
        determine_token_len(firstCharRepeated.c_str(), TokenCategory::OPERATOR, op.length() + 1)
      );
    };

    operatorTests("+");
    operatorTests("++");
    operatorTests("+=");
    operatorTests("-");
    operatorTests("-+");
    operatorTests("-=");
    operatorTests("*=");
    operatorTests("%");
    operatorTests("%=");
    // logical:
    operatorTests("==");
    operatorTests("!=");
    operatorTests("<");
    operatorTests("<=");
    operatorTests(">");
    operatorTests(">=");
    operatorTests("&&");
    operatorTests("||");
    operatorTests("!");
    // bitwise:
    operatorTests("~");
    operatorTests("&=");
    operatorTests("|");
    operatorTests("|=");
    operatorTests("^");
    operatorTests("^=");
    operatorTests("<<");
    operatorTests("<<=");
    operatorTests(">>");
    operatorTests(">>=");
    // member selection:
    operatorTests("->");
    // ambiguous:
    operatorTests("&");
    operatorTests("*");

    testCase(TokenCategory::SPECIAL, 1, "(");
    testCase(TokenCategory::SPECIAL, 1, ") ");
    testCase(TokenCategory::SPECIAL, 1, "{\n");
    testCase(TokenCategory::SPECIAL, 1, "}\t");
    testCase(TokenCategory::SPECIAL, 1, "[0");
    testCase(TokenCategory::SPECIAL, 1, "];");
    testCase(TokenCategory::SPECIAL, 1, "?");
    testCase(TokenCategory::SPECIAL, 1, ":");
    testCase(TokenCategory::SPECIAL, 1, ",");
    testCase(TokenCategory::SPECIAL, 1, ";");
    testCase(TokenCategory::SPECIAL, 1, "\\");
  } // lexer::token_determine_len

  exitIfAnyAssertionsFailedThusFar();

  {
    SETUP_SUITE_USING(lexer::determine_token_type)

    auto const testCase = [&s](
      TokenCategory const category,
      char const *const firstChar,
      TokenType const expected
    ) {
      size_t const len = std::strlen(firstChar);
      TokenType const result = lexer::determine_token_type(
        firstChar, category, len
      );

      #define TOKEN_NAME(type) #type
      stringstream ss{};
      ss << '"' << firstChar << "\" = "
         << std::to_string(static_cast<uint8_t>(expected))
         << " (got " << std::to_string(static_cast<uint8_t>(result)) << ')';
      string name = ss.str();
      util::escape_escape_sequences(name);

      s.assert(name.c_str(), result == expected);
    };

    testCase(TokenCategory::NIL, "", TokenType::NIL);

    testCase(TokenCategory::NEWLINE, "\n", TokenType::NEWLINE);

    testCase(TokenCategory::PREPRO, "#include", TokenType::PREPRO_DIR_INCLUDE);
    testCase(TokenCategory::PREPRO, "# define", TokenType::PREPRO_DIR_DEFINE);
    testCase(TokenCategory::PREPRO, "#\tundef", TokenType::PREPRO_DIR_UNDEF);
    testCase(TokenCategory::PREPRO, "#  ifdef", TokenType::PREPRO_DIR_IFDEF);
    testCase(TokenCategory::PREPRO, "#ifndef", TokenType::PREPRO_DIR_IFNDEF);
    testCase(TokenCategory::PREPRO, "#if", TokenType::PREPRO_DIR_IF);
    testCase(TokenCategory::PREPRO, "#elif", TokenType::PREPRO_DIR_ELIF);
    testCase(TokenCategory::PREPRO, "#else", TokenType::PREPRO_DIR_ELSE);
    testCase(TokenCategory::PREPRO, "#endif", TokenType::PREPRO_DIR_ENDIF);
    testCase(TokenCategory::PREPRO, "#error", TokenType::PREPRO_DIR_ERROR);
    testCase(TokenCategory::PREPRO, "#pragma", TokenType::PREPRO_DIR_PRAGMA);
    testCase(TokenCategory::PREPRO, "##", TokenType::PREPRO_OPER_CONCAT);

    testCase(TokenCategory::OPER_OR_LITERAL_OR_SPECIAL, ".", TokenType::OPER_DOT);
    testCase(TokenCategory::OPER_OR_LITERAL_OR_SPECIAL, ".123", TokenType::LITERAL_NUM);
    testCase(TokenCategory::OPER_OR_LITERAL_OR_SPECIAL, ".0", TokenType::LITERAL_NUM);
    testCase(TokenCategory::OPER_OR_LITERAL_OR_SPECIAL, "...", TokenType::SPECIAL_ELLIPSES);

    testCase(TokenCategory::OPER_OR_COMMENT, "/", TokenType::OPER_DIV);
    testCase(TokenCategory::OPER_OR_COMMENT, "/=", TokenType::OPER_ASSIGN_DIV);
    testCase(TokenCategory::OPER_OR_COMMENT, "// comment", TokenType::COMMENT_SINGLELINE);
    testCase(TokenCategory::OPER_OR_COMMENT, "/*comment*/", TokenType::COMMENT_MULTILINE);

    // keywords:
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "auto", TokenType::KEYWORD_AUTO);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "break", TokenType::KEYWORD_BREAK);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "case", TokenType::KEYWORD_CASE);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "char", TokenType::KEYWORD_CHAR);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "const", TokenType::KEYWORD_CONST);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "continue", TokenType::KEYWORD_CONTINUE);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "default", TokenType::KEYWORD_DEFAULT);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "do", TokenType::KEYWORD_DO);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "double", TokenType::KEYWORD_DOUBLE);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "else", TokenType::KEYWORD_ELSE);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "enum", TokenType::KEYWORD_ENUM);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "extern", TokenType::KEYWORD_EXTERN);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "float", TokenType::KEYWORD_FLOAT);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "for", TokenType::KEYWORD_FOR);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "goto", TokenType::KEYWORD_GOTO);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "if", TokenType::KEYWORD_IF);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "inline", TokenType::KEYWORD_INLINE);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "int", TokenType::KEYWORD_INT);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "long", TokenType::KEYWORD_LONG);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "register", TokenType::KEYWORD_REGISTER);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "restrict", TokenType::KEYWORD_RESTRICT);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "return", TokenType::KEYWORD_RETURN);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "short", TokenType::KEYWORD_SHORT);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "signed", TokenType::KEYWORD_SIGNED);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "sizeof", TokenType::KEYWORD_SIZEOF);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "static", TokenType::KEYWORD_STATIC);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "struct", TokenType::KEYWORD_STRUCT);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "switch", TokenType::KEYWORD_SWITCH);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "typedef", TokenType::KEYWORD_TYPEDEF);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "union", TokenType::KEYWORD_UNION);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "unsigned", TokenType::KEYWORD_UNSIGNED);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "void", TokenType::KEYWORD_VOID);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "volatile", TokenType::KEYWORD_VOLATILE);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "while", TokenType::KEYWORD_WHILE);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "_Alignas", TokenType::KEYWORD_ALIGNAS);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "_Alignof", TokenType::KEYWORD_ALIGNOF);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "_Atomic", TokenType::KEYWORD_ATOMIC);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "_Bool", TokenType::KEYWORD_BOOL);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "_Complex", TokenType::KEYWORD_COMPLEX);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "_Generic", TokenType::KEYWORD_GENERIC);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "_Imaginary", TokenType::KEYWORD_IMAGINARY);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "_Noreturn", TokenType::KEYWORD_NORETURN);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "_Static_assert", TokenType::KEYWORD_STATICASSERT);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "_Thread_local", TokenType::KEYWORD_THREADLOCAL);
    // identifiers:
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "a ", TokenType::IDENTIFIER);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "_\t", TokenType::IDENTIFIER);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "_1\n", TokenType::IDENTIFIER);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "_Var;", TokenType::IDENTIFIER);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "some_func(", TokenType::IDENTIFIER);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "Employee", TokenType::IDENTIFIER);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "num1=", TokenType::IDENTIFIER);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "Num123+", TokenType::IDENTIFIER);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "_Num123", TokenType::IDENTIFIER);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "pascalCase*", TokenType::IDENTIFIER);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "SCREAMING_SNAKE##", TokenType::IDENTIFIER);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "name_", TokenType::IDENTIFIER);
    testCase(TokenCategory::KEYWORD_OR_IDENTIFIER, "__FUNC__", TokenType::IDENTIFIER);

    testCase(TokenCategory::LITERAL, "'a'", TokenType::LITERAL_CHAR);
    testCase(TokenCategory::LITERAL, "\"a\"", TokenType::LITERAL_STR);
    testCase(TokenCategory::LITERAL, "0", TokenType::LITERAL_NUM);
    testCase(TokenCategory::LITERAL, "123llu", TokenType::LITERAL_NUM);
    testCase(TokenCategory::LITERAL, "0x123", TokenType::LITERAL_NUM);
    testCase(TokenCategory::LITERAL, "0123", TokenType::LITERAL_NUM);
    testCase(TokenCategory::LITERAL, "0b0101", TokenType::LITERAL_NUM);
    testCase(TokenCategory::LITERAL, "1.23", TokenType::LITERAL_NUM);
    testCase(TokenCategory::LITERAL, "0.0e-2f", TokenType::LITERAL_NUM);

    testCase(TokenCategory::OPERATOR, "+", TokenType::OPER_PLUS);
    testCase(TokenCategory::OPERATOR, "++", TokenType::OPER_PLUSPLUS);
    testCase(TokenCategory::OPERATOR, "-", TokenType::OPER_MINUS);
    testCase(TokenCategory::OPERATOR, "--", TokenType::OPER_MINUSMINUS);
    testCase(TokenCategory::OPERATOR, "%", TokenType::OPER_MOD);
    testCase(TokenCategory::OPERATOR, "=", TokenType::OPER_ASSIGN);
    testCase(TokenCategory::OPERATOR, "+=", TokenType::OPER_ASSIGN_ADD);
    testCase(TokenCategory::OPERATOR, "-=", TokenType::OPER_ASSIGN_SUB);
    testCase(TokenCategory::OPERATOR, "*=", TokenType::OPER_ASSIGN_MULT);
    testCase(TokenCategory::OPERATOR, "%=", TokenType::OPER_ASSIGN_MOD);
    testCase(TokenCategory::OPERATOR, "==", TokenType::OPER_REL_EQ);
    testCase(TokenCategory::OPERATOR, "!=", TokenType::OPER_REL_NOTEQ);
    testCase(TokenCategory::OPERATOR, "<", TokenType::OPER_REL_LESSTHAN);
    testCase(TokenCategory::OPERATOR, "<=", TokenType::OPER_REL_LESSTHANEQ);
    testCase(TokenCategory::OPERATOR, ">", TokenType::OPER_REL_GREATERTHAN);
    testCase(TokenCategory::OPERATOR, ">=", TokenType::OPER_REL_GREATERTHANEQ);
    testCase(TokenCategory::OPERATOR, "&&", TokenType::OPER_LOGIC_AND);
    testCase(TokenCategory::OPERATOR, "||", TokenType::OPER_LOGIC_OR);
    testCase(TokenCategory::OPERATOR, "!", TokenType::OPER_LOGIC_NOT);
    testCase(TokenCategory::OPERATOR, "~", TokenType::OPER_BITWISE_NOT);
    testCase(TokenCategory::OPERATOR, "&=", TokenType::OPER_ASSIGN_BITAND);
    testCase(TokenCategory::OPERATOR, "|", TokenType::OPER_BITWISE_OR);
    testCase(TokenCategory::OPERATOR, "|=", TokenType::OPER_ASSIGN_BITOR);
    testCase(TokenCategory::OPERATOR, "^", TokenType::OPER_BITWISE_XOR);
    testCase(TokenCategory::OPERATOR, "^=", TokenType::OPER_ASSIGN_BITXOR);
    testCase(TokenCategory::OPERATOR, "<<", TokenType::OPER_BITWISE_SHIFTLEFT);
    testCase(TokenCategory::OPERATOR, "<<=", TokenType::OPER_ASSIGN_BITSHIFTLEFT);
    testCase(TokenCategory::OPERATOR, ">>", TokenType::OPER_BITWISE_SHIFTRIGHT);
    testCase(TokenCategory::OPERATOR, ">>=", TokenType::OPER_ASSIGN_BITSHIFTRIGHT);
    testCase(TokenCategory::OPERATOR, "->", TokenType::OPER_ARROW);
    testCase(TokenCategory::OPERATOR, "&", TokenType::OPER_AMPERSAND);
    testCase(TokenCategory::OPERATOR, "*", TokenType::OPER_STAR);

    testCase(TokenCategory::SPECIAL, "(", TokenType::SPECIAL_PAREN_OPEN);
    testCase(TokenCategory::SPECIAL, ")", TokenType::SPECIAL_PAREN_CLOSE);
    testCase(TokenCategory::SPECIAL, "{", TokenType::SPECIAL_BRACE_OPEN);
    testCase(TokenCategory::SPECIAL, "}", TokenType::SPECIAL_BRACE_CLOSE);
    testCase(TokenCategory::SPECIAL, "[", TokenType::SPECIAL_BRACKET_OPEN);
    testCase(TokenCategory::SPECIAL, "]", TokenType::SPECIAL_BRACKET_CLOSE);
    testCase(TokenCategory::SPECIAL, "?", TokenType::SPECIAL_QUESTION);
    testCase(TokenCategory::SPECIAL, ":", TokenType::SPECIAL_COLON);
    testCase(TokenCategory::SPECIAL, "...", TokenType::SPECIAL_ELLIPSES);
    testCase(TokenCategory::SPECIAL, ",", TokenType::SPECIAL_COMMA);
    testCase(TokenCategory::SPECIAL, ";", TokenType::SPECIAL_SEMICOLON);
    testCase(TokenCategory::SPECIAL, "\\", TokenType::SPECIAL_LINE_CONT);

  } // lexer::determine_token_type

  exitIfAnyAssertionsFailedThusFar();

  {
    SETUP_SUITE_USING(lexer::lex)
    using lexer::Token;

    auto const testCase = [&s](
      char const *const name,
      vector<Token> const &expected
    ) {
      string const text = util::extract_txt_file_contents(name);
      vector<lexer::Token> const result = lex(text.c_str(), text.length());

      s.assert(
        name,
        result.size() == expected.size() &&
          [&result, &expected]() {
            for (size_t i = 0; i < result.size(); ++i) {
              bool const same = result[i] == expected[i];
              if (!same)
                return false;
            }
            return true;
          }()
      );
    };

    {
      vector<lexer::Token> const expected {
        // type, pos, len
        { TokenType::KEYWORD_INT, 1-1, 3 },
        { TokenType::IDENTIFIER, 5-1, 4 },
        { TokenType::SPECIAL_PAREN_OPEN, 9-1, 1 },
        { TokenType::KEYWORD_INT, 10-1, 3 },
        { TokenType::IDENTIFIER, 14-1, 4 },
        { TokenType::SPECIAL_COMMA, 18-1, 1 },
        { TokenType::KEYWORD_CHAR, 20-1, 4 },
        { TokenType::KEYWORD_CONST, 25-1, 5 },
        { TokenType::OPER_STAR, 31-1, 1 },
        { TokenType::OPER_STAR, 32-1, 1 },
        { TokenType::IDENTIFIER, 33-1, 4 },
        { TokenType::SPECIAL_PAREN_CLOSE, 37-1, 1 },
        { TokenType::SPECIAL_BRACE_OPEN, 38-1, 1 },
        { TokenType::KEYWORD_RETURN, 39-1, 6 },
        { TokenType::LITERAL_NUM, 46-1, 1 },
        { TokenType::SPECIAL_SEMICOLON, 47-1, 1 },
        { TokenType::SPECIAL_BRACE_CLOSE, 48-1, 1 },
        { TokenType::NEWLINE, 49-1, 1 },
      };
      testCase("basic/tiny_main.c", expected);
    }
    {
      vector<lexer::Token> const expected {
        // type, pos, len
        { TokenType::PREPRO_DIR_INCLUDE, 1-1, 8 },
        { TokenType::IMPLEMENTATION_DEFINED_HEADER, 10-1, 9 },
        { TokenType::NEWLINE, 19-1, 1 },

        { TokenType::COMMENT_SINGLELINE, 20-1, 22 },
        { TokenType::NEWLINE, 42-1, 1 },

        { TokenType::PREPRO_DIR_DEFINE, 43-1, 8 },
        { TokenType::IDENTIFIER, 52-1, 2 },
        { TokenType::LITERAL_NUM, 55-1, 4 },
        { TokenType::NEWLINE, 59-1, 1 },
      };
      testCase("basic/tiny_preprocessor.c", expected);
    }
    {
      vector<lexer::Token> const expected {
        // type,                         pos, len
        { TokenType::KEYWORD_CHAR,       1-1, 4 },
        { TokenType::IDENTIFIER,         6-1, 1 },
        { TokenType::OPER_ASSIGN,        7-1, 1 },
        { TokenType::LITERAL_CHAR,       8-1, 3 },
        { TokenType::SPECIAL_SEMICOLON, 11-1, 1 },

        { TokenType::KEYWORD_CHAR,      12-1, 4 },
        { TokenType::IDENTIFIER,        17-1, 1 },
        { TokenType::OPER_ASSIGN,       18-1, 1 },
        { TokenType::LITERAL_CHAR,      19-1, 4 },
        { TokenType::SPECIAL_SEMICOLON, 23-1, 1 },

        { TokenType::KEYWORD_CHAR,      24-1, 4 },
        { TokenType::IDENTIFIER,        29-1, 1 },
        { TokenType::OPER_ASSIGN,       30-1, 1 },
        { TokenType::LITERAL_CHAR,      31-1, 4 },
        { TokenType::SPECIAL_SEMICOLON, 35-1, 1 },

        { TokenType::KEYWORD_CHAR,      36-1, 4 },
        { TokenType::IDENTIFIER,        41-1, 1 },
        { TokenType::OPER_ASSIGN,       42-1, 1 },
        { TokenType::LITERAL_CHAR,      43-1, 4 },
        { TokenType::SPECIAL_SEMICOLON, 47-1, 1 },

        { TokenType::NEWLINE, 48-1, 1 },
      };
      testCase("basic/tiny_charliterals.c", expected);
    }
    {
      vector<lexer::Token> const expected {
        // type,                         pos, len
        { TokenType::KEYWORD_CHAR,       1-1, 4 },
        { TokenType::OPER_STAR,          6-1, 1 },
        { TokenType::IDENTIFIER,         7-1, 1 },
        { TokenType::OPER_ASSIGN,        8-1, 1 },
        { TokenType::LITERAL_STR,        9-1, 2 },
        { TokenType::SPECIAL_SEMICOLON, 11-1, 1 },
        { TokenType::NEWLINE,           12-1, 1 },

        { TokenType::KEYWORD_CHAR,      13-1, 4 },
        { TokenType::OPER_STAR,         18-1, 1 },
        { TokenType::IDENTIFIER,        19-1, 1 },
        { TokenType::OPER_ASSIGN,       20-1, 1 },
        { TokenType::LITERAL_STR,       21-1, 4 },
        { TokenType::SPECIAL_SEMICOLON, 25-1, 1 },
        { TokenType::NEWLINE,           26-1, 1 },

        { TokenType::KEYWORD_CHAR,      27-1, 4 },
        { TokenType::OPER_STAR,         32-1, 1 },
        { TokenType::IDENTIFIER,        33-1, 1 },
        { TokenType::OPER_ASSIGN,       34-1, 1 },
        { TokenType::LITERAL_STR,       35-1, 5 },
        { TokenType::SPECIAL_SEMICOLON, 40-1, 1 },
        { TokenType::NEWLINE,           41-1, 1 },

        { TokenType::KEYWORD_CHAR,      42-1, 4 },
        { TokenType::OPER_STAR,         47-1, 1 },
        { TokenType::IDENTIFIER,        48-1, 1 },
        { TokenType::OPER_ASSIGN,       49-1, 1 },
        { TokenType::LITERAL_STR,       50-1, 6 },
        { TokenType::SPECIAL_SEMICOLON, 56-1, 1 },
        { TokenType::NEWLINE,           57-1, 1 },
      };
      testCase("basic/tiny_stringliterals.c", expected);
    }

  } // lexer::lex

  exitIfAnyAssertionsFailedThusFar();

  test::evaluate_suites();
  return static_cast<int>(test::assertions_failed());
}
