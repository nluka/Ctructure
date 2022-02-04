import TokenType from '../lexer/TokenType';

export default function shart(tokenTypes: Uint8Array, index: number): boolean {
  for (let i = index; i < tokenTypes.length; ++i) {
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

  for (let i = index; i < tokenTypes.length; ++i) {
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
