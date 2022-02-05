import TokenType from '../lexer/TokenType';

export default function checkForAssignmentToFunction(
  tokenTypes: Uint8Array,
  tokenCount: number,
  index: number,
): boolean {
  for (let i = index; i < tokenCount; ++i) {
    const tokenType = tokenTypes[i];
    if (tokenType === TokenType.newline) {
      continue;
    }
    if (tokenType === TokenType.identifier) {
      index = ++i;
      break;
    }
    return false;
  }

  for (let i = index; i < tokenCount; ++i) {
    const tokenType = tokenTypes[i];
    if (tokenType === TokenType.newline) {
      continue;
    }
    if (tokenType === TokenType.specialParenthesisOpening) {
      return true;
    }
    return false;
  }
  return false;
}
