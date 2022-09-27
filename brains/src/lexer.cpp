#include <stdexcept>
#include <string_view>
#include <unordered_map>

#include "lexer.hpp"
#include "util.hpp"

using namespace lexer;
using std::vector;

bool Token::operator==(Token const &other) const noexcept {
  bool const sameType = m_type == other.m_type;
  bool const samePos = m_pos == other.m_pos;
  bool const sameLen = m_len == other.m_len;
  bool const equal = sameType && samePos && sameLen;
  return equal;
}

bool Token::operator!=(Token const &other) const noexcept {
  return !(*this == other);
}

// Breaks text into lexical tokens. Resultant vector is guaranteed to not
// contain any INTERNAL_ token types, these are for lexer implementation only.
vector<Token> lexer::lex(char const *const text, size_t const textLen) {
  // TODO:
  // - add wide character/string literal support

  vector<Token> tokens{};

  // not very scientific, but from experimentation seems reasonable
  tokens.reserve(textLen / 3);

  // first pass, collection phase
  {
    size_t pos = 0;
    while (pos < textLen) {
      Token const tok = extract_token(text, textLen, pos);
      if (tok.m_type == TokenType::NIL)
        break;
      else {
        pos += tok.m_len;
        tokens.push_back(tok);
      }
    }
  }

  // second pass, compression phrase
  for (size_t i = 0; i < tokens.size();) {
    switch (tokens[i].m_type) {
      default: {
        ++i;
        break;
      }

      case TokenType::PREPRO_DIR_INCLUDE: {
        // #include  <  stdio.h >
        // ^^^^^^^^  ^  ^^^^^   ^
        // |         |  |       |
        // i     lChev  i+2  rChev
        // ------------------------
        // we want to delete tokens [i+2, last]
        // and set the i+1 token as an IMPLEMENTATION_DEFINED_HEADER

        auto const lChev = tokens.begin() + (i+1);

        auto rChev = tokens.begin() + (i+2);
        while (
          rChev < tokens.end() - 1 &&
          rChev->m_type != TokenType::OPER_REL_GREATERTHAN
        ) ++rChev;

        *lChev = {
          TokenType::IMPLEMENTATION_DEFINED_HEADER,
          lChev->m_pos, // pos
          rChev->m_pos - lChev->m_pos + 1, // len
        };

        tokens.erase(lChev + 1, rChev + 1);

        ++i;
      }

      // case TokenType::LITERAL_CHAR:
      // case TokenType::LITERAL_STR: {
      //   // check for wide literal
      // }
    }
  }

  return tokens;
}

Token lexer::extract_token(
  char const *const text,
  size_t const textLen,
  size_t &pos
) {
  // advance `pos` to beginning of next token:
  for (; pos < textLen && util::is_non_newline_whitespace(text[pos]); ++pos);

  char const *const firstChar = text + pos;
  TokenCategory const category = lexer::determine_token_category(*firstChar);
  size_t const len = lexer::determine_token_len(firstChar, category, textLen - pos);
  TokenType const type = lexer::determine_token_type(firstChar, category, len);

  return {
    type,
    static_cast<uint32_t>(pos),
    static_cast<uint32_t>(len),
  };
}

TokenCategory lexer::determine_token_category(char const firstChar) {
  switch (firstChar) {
    case '\n': return TokenCategory::NEWLINE;
    case '#':  return TokenCategory::PREPRO;
    case '.':  return TokenCategory::OPER_OR_LITERAL_OR_SPECIAL;
    case '/':  return TokenCategory::OPER_OR_COMMENT;
  }

  if (firstChar == '_' || util::is_alphabetic(firstChar))
    return TokenCategory::KEYWORD_OR_IDENTIFIER;

  if (firstChar == '"' || firstChar == '\'' || util::is_digit(firstChar))
    return TokenCategory::LITERAL;

  if (std::strchr("!%&*+-<=>^|~", firstChar))
    return TokenCategory::OPERATOR;

  if (std::strchr("(),:;?[\\]{}", firstChar))
    return TokenCategory::SPECIAL;

  return TokenCategory::NIL;
}

static
size_t find_numeric_literal_len(
  char const *const firstChar,
  size_t const numCharsRemaining
) {
  // interpreting numeric literals in C is bloody complicated,
  // luckily we don't have to do that so we can be pretty lax.
  // here are some useful references:
  // https://web.archive.org/web/20181230041359if_/http://www.open-std.org/jtc1/sc22/wg14/www/abq/c17_updated_proposed_fdis.pdf
  // https://www.educba.com/c-literals/

  // numeric literals start must with either:
  // - a dot (.) indicating a floating-point literal
  // - a digit (0-9) indicating a decimal|hex|octal|binary|floating-point literal
  if (!util::is_digit(*firstChar) && *firstChar != '.')
    // this is not a numeric literal!
    return 0;

  size_t pos = 1;
  #define CURRCHAR *(firstChar + pos)

  keep_going:
  while (
    pos < numCharsRemaining && (
      util::is_digit(CURRCHAR) ||
      util::is_alphabetic(CURRCHAR) ||
      std::strchr("'.", CURRCHAR)
    )
  ) ++pos;

  if (!std::strchr("+-", CURRCHAR))
    return pos;

  // might be scientific notation...
  char const prevChar = *(firstChar + pos - 1);
  if (std::tolower(prevChar) == 'e' && pos >= 3) {
    char const prevPrevChar = *(firstChar + pos - 2);
    if (std::tolower(prevPrevChar) != 'x') {
      // it is!
      ++pos;
      goto keep_going;
    }
  }

  // nope, it's not
  return pos;

  #undef CURRCHAR
}

size_t lexer::determine_token_len(
  char const *const firstChar,
  TokenCategory const category,
  size_t const numCharsRemaining
) {
  if (numCharsRemaining == 0)
    return 0;

  switch (category) {
    case TokenCategory::NEWLINE:
    case TokenCategory::SPECIAL:
      return 1;

    case TokenCategory::PREPRO: {
      if (numCharsRemaining == 1)
        return 1;

      {
        char const secondChar = *(firstChar + 1);
        if (secondChar == '#')
          return 2; // ##
      }

      char const *lastChar = firstChar + 1;

      // advance `lastChar` to first non whitespace character
      while (
        static_cast<size_t>(lastChar - firstChar) <= numCharsRemaining &&
        util::is_non_newline_whitespace(*lastChar)
      ) ++lastChar;

      if (!util::is_alphabetic(*lastChar)) {
        return 0; // error
      }

      // advance `lastChar` to first non-alphabetic character
      while (
        static_cast<size_t>(lastChar - firstChar) <= numCharsRemaining &&
        util::is_alphabetic(*lastChar)
      ) ++lastChar;

      return lastChar - firstChar;
    }

    case TokenCategory::OPER_OR_LITERAL_OR_SPECIAL: {
      if (numCharsRemaining == 1)
        return 1; // member selection operator

      if (
        numCharsRemaining >= 3 &&
        (*firstChar == '.') &&
        (*(firstChar + 1) == '.') &&
        (*(firstChar + 2) == '.')
      ) return 3; // ellipses

      // must be a floating-point literal then...

      char const *lastChar = firstChar + 1;

      // advance `lastChar` to first non-digit character
      while (
        static_cast<size_t>(lastChar - firstChar) <= numCharsRemaining &&
        util::is_digit(*lastChar)
      ) ++lastChar;

      if (*lastChar == 'f' || *lastChar == 'F')
        return lastChar - firstChar + 1;
      else
        return lastChar - firstChar;
    }

    case TokenCategory::OPER_OR_COMMENT: {
      if (numCharsRemaining == 1)
        return 1;

      char const secondChar = *(firstChar + 1);
      switch (secondChar) {
        case '=':
          return 2;
        case '/': {
          char const *firstUnescapedNewline = firstChar + 2; // start at 3rd character
          while (true) {
            firstUnescapedNewline = std::strchr(firstUnescapedNewline, '\n');
            if (firstUnescapedNewline == nullptr)
              // couldn't find a newline, comment extends to end of file
              return numCharsRemaining;
            else if (*(firstUnescapedNewline - 1) != '\\')
              // found an unescaped newline
              return firstUnescapedNewline - firstChar;
            else
              // found a newline, but it's escaped
              ++firstUnescapedNewline;
          }
        }
        case '*': {
          std::string_view const content(firstChar);
          size_t const endSequencePos = content.find("*/");
          if (endSequencePos == std::string_view::npos)
            return numCharsRemaining;
          else
            return endSequencePos + 2;
        }
        default:
          return 1;
      }
    }

    case TokenCategory::KEYWORD_OR_IDENTIFIER: {
      for (size_t pos = 1; pos <= numCharsRemaining; ++pos) {
        char const c = *(firstChar + pos);
        if (!util::is_alphabetic(c) && !util::is_digit(c) && c != '_')
          return pos;
      }
      return numCharsRemaining;
    }

    case TokenCategory::OPERATOR: {
      if (numCharsRemaining == 1 || *firstChar == '~') {
        return 1;
      }

      char const secondChar = *(firstChar + 1);

      switch (*firstChar) {
        case '+': {
          if (std::strchr("+=", secondChar))
            return 2;
          else
            return 1;
        }

        case '-': {
          if (std::strchr("-=>", secondChar))
            return 2;
          else
            return 1;
        }

        case '*':
        case '%':
        case '=':
        case '!':
        case '^':
          return secondChar == '=' ? 2 : 1;

        case '<':
        case '>': {
          if (secondChar == '=') {
            // >= <=
            return 2;
          } else if (secondChar == *firstChar) {
            // >> <<
            if (numCharsRemaining == 2)
              return 2;
            else {
              char const thirdChar = *(firstChar + 2);
              if (thirdChar == '=')
                // >>= <<=
                return 3;
              else
                return 2;
            }
          } else {
            return 1;
          }
        }

        case '&':
        case '|': {
          if (secondChar == *firstChar || secondChar == '=')
            // && &= || |=
            return 2;
          else
            return 1;
        }
      }

      return 0;
    }

    case TokenCategory::LITERAL: {
      if (numCharsRemaining == 1) {
        return 1;
      } else if (*firstChar == '\'' || *firstChar == '"') {
        // string or character literal
        size_t const closingCharPos = util::find_unescaped(
          firstChar, *firstChar, '\\', 1
        );
        if (closingCharPos == std::string::npos)
          // string/character literal is unclosed, we don't care
          return numCharsRemaining;
        else
          return closingCharPos + 1;
      } else {
        return find_numeric_literal_len(firstChar, numCharsRemaining);
      }
    }

    default:
      return 0;
  }
}

TokenType lexer::determine_token_type(
  char const *const firstChar,
  TokenCategory const category,
  size_t const len
) {
  static std::unordered_map<std::string, TokenType> const s_preproDirectives {
    { "include", TokenType::PREPRO_DIR_INCLUDE },
    { "define", TokenType::PREPRO_DIR_DEFINE },
    { "undef", TokenType::PREPRO_DIR_UNDEF },
    { "ifdef", TokenType::PREPRO_DIR_IFDEF },
    { "ifndef", TokenType::PREPRO_DIR_IFNDEF },
    { "if", TokenType::PREPRO_DIR_IF },
    { "elif", TokenType::PREPRO_DIR_ELIF },
    { "else", TokenType::PREPRO_DIR_ELSE },
    { "endif", TokenType::PREPRO_DIR_ENDIF },
    { "error", TokenType::PREPRO_DIR_ERROR },
    { "pragma", TokenType::PREPRO_DIR_PRAGMA },
  };
  static std::unordered_map<std::string, TokenType> const
  s_keywordsOperatorsSpecialSymbols {
    { "auto", TokenType::KEYWORD_AUTO },
    { "break", TokenType::KEYWORD_BREAK },
    { "case", TokenType::KEYWORD_CASE },
    { "char", TokenType::KEYWORD_CHAR },
    { "const", TokenType::KEYWORD_CONST },
    { "continue", TokenType::KEYWORD_CONTINUE },
    { "default", TokenType::KEYWORD_DEFAULT },
    { "do", TokenType::KEYWORD_DO },
    { "double", TokenType::KEYWORD_DOUBLE },
    { "else", TokenType::KEYWORD_ELSE },
    { "enum", TokenType::KEYWORD_ENUM },
    { "extern", TokenType::KEYWORD_EXTERN },
    { "float", TokenType::KEYWORD_FLOAT },
    { "for", TokenType::KEYWORD_FOR },
    { "goto", TokenType::KEYWORD_GOTO },
    { "if", TokenType::KEYWORD_IF },
    { "inline", TokenType::KEYWORD_INLINE },
    { "int", TokenType::KEYWORD_INT },
    { "long", TokenType::KEYWORD_LONG },
    { "register", TokenType::KEYWORD_REGISTER },
    { "restrict", TokenType::KEYWORD_RESTRICT },
    { "return", TokenType::KEYWORD_RETURN },
    { "short", TokenType::KEYWORD_SHORT },
    { "signed", TokenType::KEYWORD_SIGNED },
    { "sizeof", TokenType::KEYWORD_SIZEOF },
    { "static", TokenType::KEYWORD_STATIC },
    { "struct", TokenType::KEYWORD_STRUCT },
    { "switch", TokenType::KEYWORD_SWITCH },
    { "typedef", TokenType::KEYWORD_TYPEDEF },
    { "union", TokenType::KEYWORD_UNION },
    { "unsigned", TokenType::KEYWORD_UNSIGNED },
    { "void", TokenType::KEYWORD_VOID },
    { "volatile", TokenType::KEYWORD_VOLATILE },
    { "while", TokenType::KEYWORD_WHILE },
    { "_Alignas", TokenType::KEYWORD_ALIGNAS },
    { "_Alignof", TokenType::KEYWORD_ALIGNOF },
    { "_Atomic", TokenType::KEYWORD_ATOMIC },
    { "_Bool", TokenType::KEYWORD_BOOL },
    { "_Complex", TokenType::KEYWORD_COMPLEX },
    { "_Generic", TokenType::KEYWORD_GENERIC },
    { "_Imaginary", TokenType::KEYWORD_IMAGINARY },
    { "_Noreturn", TokenType::KEYWORD_NORETURN },
    { "_Static_assert", TokenType::KEYWORD_STATICASSERT },
    { "_Thread_local", TokenType::KEYWORD_THREADLOCAL },
    { "+", TokenType::OPER_PLUS },
    { "++", TokenType::OPER_PLUSPLUS },
    { "-", TokenType::OPER_MINUS },
    { "--", TokenType::OPER_MINUSMINUS },
    { "%", TokenType::OPER_MOD },
    { "+=", TokenType::OPER_ASSIGN_ADD },
    { "-=", TokenType::OPER_ASSIGN_SUB },
    { "*=", TokenType::OPER_ASSIGN_MULT },
    { "%=", TokenType::OPER_ASSIGN_MOD },
    { "==", TokenType::OPER_REL_EQ },
    { "!=", TokenType::OPER_REL_NOTEQ },
    { "<", TokenType::OPER_REL_LESSTHAN },
    { "<=", TokenType::OPER_REL_LESSTHANEQ },
    { ">", TokenType::OPER_REL_GREATERTHAN },
    { ">=", TokenType::OPER_REL_GREATERTHANEQ },
    { "&&", TokenType::OPER_LOGIC_AND },
    { "||", TokenType::OPER_LOGIC_OR },
    { "!", TokenType::OPER_LOGIC_NOT },
    { "~", TokenType::OPER_BITWISE_NOT },
    { "&=", TokenType::OPER_ASSIGN_BITAND },
    { "|", TokenType::OPER_BITWISE_OR },
    { "|=", TokenType::OPER_ASSIGN_BITOR },
    { "^", TokenType::OPER_BITWISE_XOR },
    { "^=", TokenType::OPER_ASSIGN_BITXOR },
    { "<<", TokenType::OPER_BITWISE_SHIFTLEFT },
    { "<<=", TokenType::OPER_ASSIGN_BITSHIFTLEFT },
    { ">>", TokenType::OPER_BITWISE_SHIFTRIGHT },
    { ">>=", TokenType::OPER_ASSIGN_BITSHIFTRIGHT },
    { "->", TokenType::OPER_ARROW },
    { "&", TokenType::OPER_AMPERSAND },
    { "*", TokenType::OPER_STAR },
    { "(", TokenType::SPECIAL_PAREN_OPEN },
    { ")", TokenType::SPECIAL_PAREN_CLOSE },
    { "{", TokenType::SPECIAL_BRACE_OPEN },
    { "}", TokenType::SPECIAL_BRACE_CLOSE },
    { "[", TokenType::SPECIAL_BRACKET_OPEN },
    { "]", TokenType::SPECIAL_BRACKET_CLOSE },
    { "?", TokenType::SPECIAL_QUESTION },
    { ":", TokenType::SPECIAL_COLON },
    { "...", TokenType::SPECIAL_ELLIPSES },
    { ",", TokenType::SPECIAL_COMMA },
    { ";", TokenType::SPECIAL_SEMICOLON },
    { "\\", TokenType::SPECIAL_LINE_CONT },
  };

  switch (category) {
    default:
    case TokenCategory::NIL:
      return TokenType::NIL;

    case TokenCategory::NEWLINE:
      return TokenType::NEWLINE;

    case TokenCategory::OPER_OR_LITERAL_OR_SPECIAL: {
      if (len == 1)
        return TokenType::OPER_DOT;
      if (len == 3 && std::strcmp(firstChar, "...") == 0)
        return TokenType::SPECIAL_ELLIPSES;
      return TokenType::LITERAL_NUM;
    }

    case TokenCategory::OPER_OR_COMMENT: {
      if (len == 1)
        return TokenType::OPER_DIV;

      char const secondChar = *(firstChar + 1);
      switch (secondChar) {
        case '=':
          return TokenType::OPER_ASSIGN_DIV;
        case '/':
          return TokenType::COMMENT_SINGLELINE;
        case '*':
          return TokenType::COMMENT_MULTILINE;
        default:
          return TokenType::NIL;
      }
    }

    case TokenCategory::LITERAL: {
      switch (*firstChar) {
        case '"': return TokenType::LITERAL_STR;
        case '\'': return TokenType::LITERAL_CHAR;
        default: return TokenType::LITERAL_NUM;
      }
    }

    case TokenCategory::PREPRO: {
      if (len == 2)
        return TokenType::PREPRO_OPER_CONCAT;

      // directives can have whitespace between the # and the letters:
      // #   define
      //  ^^^
      //  we must account for this

      char const *firstAlphabeticChar = firstChar + 1;
      while (!util::is_alphabetic(*firstAlphabeticChar))
        ++firstAlphabeticChar;

      // #   define
      // ^   ^
      // |   |
      // |   firstAlphabeticChar
      // firstChar

      std::string const token( // content is "define"
        firstAlphabeticChar,
        len - (firstAlphabeticChar - firstChar)
      );

      auto const type = s_preproDirectives.find(token);
      if (type == s_preproDirectives.end())
        return TokenType::NIL;
      else
        return type->second;
    }

    case TokenCategory::KEYWORD_OR_IDENTIFIER:
    case TokenCategory::OPERATOR:
    case TokenCategory::SPECIAL: {
      std::string const token(firstChar, len);
      auto const type = s_keywordsOperatorsSpecialSymbols.find(token);
      if (type == s_keywordsOperatorsSpecialSymbols.end())
        return TokenType::IDENTIFIER;
      else
        return type->second;
    }
  }
}
