import TokenType, { isTokenKeywordTypeOrTypeQualifier } from '../lexer/TokenType';

const g = [
  TokenType.identifier,
  TokenType.ambiguousAsterisk,
  TokenType.operatorUnaryIndirectionOrDereference,
];

export default function checkForTypeInParen(index: number, tokenTypes: Uint8Array) {
  while (index >= 0 && tokenTypes[index] !== TokenType.specialParenthesisClosing) {
    // skip to previous closing paren
    --index;
  }

  for (let i = index - 1; i >= 0; --i) {
    if (tokenTypes[i] === TokenType.newline) {
      continue;
    }
    if (tokenTypes[i] === TokenType.specialParenthesisOpening) {
      return false;
    } else {
      break;
    }
  }

  let previousType: TokenType = tokenTypes[index];
  let i = index - 1;
  for (; i >= 0; --i) {
    if (tokenTypes[i] === TokenType.newline) {
      // skip newlines
      continue;
    }

    if (
      tokenTypes[i] === TokenType.ambiguousAsterisk ||
      tokenTypes[i] === TokenType.operatorUnaryIndirectionOrDereference
    ) {
      if (previousType === TokenType.specialParenthesisClosing) {
        break;
      }
      if (
        previousType !== TokenType.keywordConst &&
        previousType !== TokenType.ambiguousAsterisk &&
        previousType !== TokenType.operatorUnaryIndirectionOrDereference
      ) {
        return false;
      }
      break;
    }
    if (isTokenKeywordTypeOrTypeQualifier(tokenTypes[i])) {
      break;
    }
    if (tokenTypes[i] === TokenType.specialParenthesisClosing) {
      return false;
    }
    if (tokenTypes[i] === TokenType.specialParenthesisOpening) {
      break;
    }
    if (!g.includes(tokenTypes[i])) {
      return false;
    }

    previousType = tokenTypes[i];
  }

  for (; i >= 0; --i) {
    if (tokenTypes[i] !== TokenType.specialParenthesisOpening) {
      continue;
    }
    --i;
    for (; i >= 0; --i) {
      if (tokenTypes[i] === TokenType.newline) {
        continue;
      }
      if (tokenTypes[i] === TokenType.identifier || tokenTypes[i] === TokenType.keywordSizeof) {
        return false;
      }
      return true;
    }
  }

  return false;
}

// first token before ) can be * const or identifier/type
// if const, can be * or identifier
// if *, can be const or *
// if identifier, can be identifier
