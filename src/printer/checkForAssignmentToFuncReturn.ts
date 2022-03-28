import TokenType from '../lexer/TokenType';

export default function checkForAssignmentToFuncReturn(
  tokTypes: Uint8Array,
  tokCount: number,
  index: number,
): boolean {
  for (let i = index; i < tokCount; ++i) {
    const tokenType = tokTypes[i];
    if (tokenType === TokenType.newline) {
      continue;
    }
    if (tokenType === TokenType.identifier) {
      index = ++i;
      break;
    }
    return false;
  }

  for (let i = index; i < tokCount; ++i) {
    const tokenType = tokTypes[i];
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
