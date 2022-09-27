#ifndef CTRUCTURE_LEXER_HPP
#define CTRUCTURE_LEXER_HPP

#include <cstdint>
#include <vector>

namespace lexer {

// Fairly specific categorization of token based on its
// length and content
enum class TokenType : uint8_t {
  NIL = 0, // nothingness...

  // (https://www.tutorialspoint.com/cprogramming/c_preprocessors.htm)
  // preprocessor directives:
  PREPRO_DIR_INCLUDE, // #include
  PREPRO_DIR_DEFINE,  // #define
  PREPRO_DIR_UNDEF,   // #undef
  PREPRO_DIR_IFDEF,   // #ifdef
  PREPRO_DIR_IFNDEF,  // #ifndef
  PREPRO_DIR_IF,      // #if
  PREPRO_DIR_ELIF,    // #elif
  PREPRO_DIR_ELSE,    // #else
  PREPRO_DIR_ENDIF,   // #endif
  PREPRO_DIR_ERROR,   // #error
  PREPRO_DIR_PRAGMA,  // #pragma

  PREPRO_OPER_CONCAT, // ##

  // builtin preprocessor macros:
  // PREPRO_MACRO_FILE,
  // PREPRO_MACRO_LINE,
  // PREPRO_MACRO_DATE,
  // PREPRO_MACRO_TIME,
  // PREPRO_MACRO_TIMESTAMP,

  // (https://en.cppreference.com/w/c/keyword)
  // keywords:
  //  types:
  KEYWORD_BOOL,          // _Bool
  KEYWORD_CHAR,          // char
  KEYWORD_DOUBLE,        // double
  KEYWORD_ENUM,          // enum
  KEYWORD_FLOAT,         // float
  KEYWORD_INT,           // int
  KEYWORD_LONG,          // long
  KEYWORD_SHORT,         // short
  KEYWORD_SIGNED,        // signed
  KEYWORD_STATIC,        // static
  KEYWORD_STRUCT,        // struct
  KEYWORD_UNION,         // union
  KEYWORD_UNSIGNED,      // unsigned
  KEYWORD_VOID,          // void
  //  type-qualifiers:
  KEYWORD_ATOMIC,        // _Atomic
  KEYWORD_CONST,         // const
  KEYWORD_RESTRICT,      // restrict
  KEYWORD_VOLATILE,      // volatile
  //  rest:
  KEYWORD_ALIGNAS,       // _Alignas
  KEYWORD_ALIGNOF,       // _Alignof
  KEYWORD_AUTO,          // auto
  KEYWORD_BREAK,         // break
  KEYWORD_CASE,          // case
  KEYWORD_COMPLEX,       // _Complex
  KEYWORD_CONTINUE,      // continue
  KEYWORD_DEFAULT,       // default
  KEYWORD_DO,            // do
  KEYWORD_ELSE,          // else
  KEYWORD_EXTERN,        // extern
  KEYWORD_FOR,           // for
  KEYWORD_GENERIC,       // _Generic
  KEYWORD_GOTO,          // goto
  KEYWORD_IF,            // if
  KEYWORD_INLINE,        // inline
  KEYWORD_IMAGINARY,     // _Imaginary
  KEYWORD_NORETURN,      // _Noreturn
  KEYWORD_REGISTER,      // register
  KEYWORD_RETURN,        // return
  KEYWORD_SIZEOF,        // sizeof
  KEYWORD_STATICASSERT,  // _Static_assert
  KEYWORD_SWITCH,        // switch
  KEYWORD_THREADLOCAL,   // _Thread_local
  KEYWORD_TYPEDEF,       // typedef
  KEYWORD_WHILE,         // while

  // literals:
  LITERAL_NUM,  // e.g. 123 1.23f -1 10ull
  LITERAL_CHAR, // e.g. 'C'
  LITERAL_STR,  // e.g. "abcd"

  // (https://en.wikipedia.org/wiki/Operators_in_C_and_C%2B%2B)
  // operators:
  OPER_PLUS,                 // +
  OPER_PLUSPLUS,             // ++
  OPER_MINUS,                // -
  OPER_MINUSMINUS,           // --
  OPER_DIV,                  // /
  OPER_MOD,                  // %
  //  assignment:
  OPER_ASSIGN,               // =
  OPER_ASSIGN_ADD,           // +=
  OPER_ASSIGN_SUB,           // -=
  OPER_ASSIGN_MULT,          // *=
  OPER_ASSIGN_DIV,           // /=
  OPER_ASSIGN_MOD,           // %=
  OPER_ASSIGN_BITSHIFTLEFT,  // <<=
  OPER_ASSIGN_BITSHIFTRIGHT, // >>=
  OPER_ASSIGN_BITAND,        // &=
  OPER_ASSIGN_BITOR,         // |=
  OPER_ASSIGN_BITXOR,        // ^=
  //  relational:
  OPER_REL_EQ,               // ==
  OPER_REL_NOTEQ,            // !=
  OPER_REL_LESSTHAN,         // >
  OPER_REL_LESSTHANEQ,       // <=
  OPER_REL_GREATERTHAN,      // >
  OPER_REL_GREATERTHANEQ,    // >=
  //  logical:
  OPER_LOGIC_AND,            // &&
  OPER_LOGIC_OR,             // ||
  OPER_LOGIC_NOT,            // !
  //  bitwise:
  OPER_BITWISE_NOT,          // ~
  OPER_BITWISE_OR,           // |
  OPER_BITWISE_XOR,          // ^
  OPER_BITWISE_SHIFTLEFT,    // <<
  OPER_BITWISE_SHIFTRIGHT,   // >>
  //  member selection:
  OPER_DOT,                  // .
  OPER_ARROW,                // ->
  //  ambiguous:
  OPER_AMPERSAND,            // &
  OPER_STAR,                 // *

  // special symbols:
  /*
    <
    has multiple meanings:
    - implementation defined header, i.e. <stdio.h>
    - less than relational operator
  */
  SPECIAL_PAREN_OPEN,    // (
  SPECIAL_PAREN_CLOSE,   // )
  SPECIAL_BRACE_OPEN,    // {
  SPECIAL_BRACE_CLOSE,   // }
  SPECIAL_BRACKET_OPEN,  // [
  SPECIAL_BRACKET_CLOSE, // ]
  SPECIAL_QUESTION,      // ?
  SPECIAL_COLON,         // :
  SPECIAL_ELLIPSES,      // ...
  SPECIAL_COMMA,         // ,
  SPECIAL_SEMICOLON,     // ;
  SPECIAL_LINE_CONT,     // \

  // other:
  IMPLEMENTATION_DEFINED_HEADER,
  IDENTIFIER,
  COMMENT_SINGLELINE, // //
  COMMENT_MULTILINE,  // /*
  NEWLINE,            // \n
};

// A broad categorization of token based exclusively on its first character
enum class TokenCategory {
  NIL = 0, // nothingness...

  NEWLINE, // \n

  PREPRO, // could be any of PREPRO_

  /*
    could be:
    - OPER_DOT
    - LITERAL_NUM
    - SPECIAL_ELLIPSES
  */
  OPER_OR_LITERAL_OR_SPECIAL,

  /*
    could be:
    - OPER_DIV
    - OPER_ASSIGN_DIV
    - COMMENT_SINGLELINE
    - COMMENT_MULTILINE
  */
  OPER_OR_COMMENT,

  KEYWORD_OR_IDENTIFIER, // could be any of KEYWORD_ or IDENTIFIER

  LITERAL, // could be any of LITERAL_

  OPERATOR, // could be any of OPER_ except DOT, DIV, DIVEQ

  SPECIAL, // could be any of SPECIAL_
};

struct Token {
  TokenType m_type;
  uint32_t m_pos, m_len;

  bool operator==(Token const &other) const noexcept;
  bool operator!=(Token const &other) const noexcept;
};

std::vector<Token> lex(char const *text, size_t textLen);

Token extract_token(char const *text, size_t textLen, size_t &pos);

TokenCategory determine_token_category(char const firstChar);

size_t determine_token_len(
  char const *firstChar,
  TokenCategory,
  size_t remainingChars
);

TokenType determine_token_type(
  char const *firstChar,
  TokenCategory,
  size_t len
);

} // namespace lexer

#endif // CTRUCTURE_LEXER_HPP
