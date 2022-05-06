import TokenType from '../lexer/TokenType';
import _nextNonNewlineTokenType from './nextNonNewlineTokenType';

export default function checkForAssignmentToFuncReturn(
  index: number,
  tokenCount: number,
  tokenTypes: Uint8Array,
): boolean {
  let i = index + 1;
  let pCount = 1;
  for (; i < tokenCount; ++i) {
    const tokenType = tokenTypes[i];
    if (tokenType === TokenType.newline) {
      continue;
    }
    if (tokenType === TokenType.identifier) {
      ++i;
      break;
    }
    return false;
  }

  for (; i < tokenCount; ++i) {
    const tokenType = tokenTypes[i];
    if (tokenType === TokenType.newline) {
      continue;
    }
    if (tokenType === TokenType.specialParenthesisOpening) {
      ++i;
      break;
    }
    return false;
  }

  for (; i < tokenCount; ++i) {
    const tokenType = tokenTypes[i];
    if (tokenType === TokenType.specialParenthesisClosing) {
      --pCount;
      if (pCount === 0) {
        if (
          _nextNonNewlineTokenType(tokenTypes, tokenCount, i) ===
          TokenType.specialSemicolon
        ) {
          return true;
        }
        return false;
      }
    } else if (tokenType === TokenType.specialParenthesisOpening) {
      ++pCount;
    }
  }

  return false;
}
