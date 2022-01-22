import TokenType from '../lexer/TokenType';

export default function getPrevNonNewlineTokenType(
  tokenTypes: Uint8Array,
  index: number,
): TokenType {
  for (let i = index - 1; i < tokenTypes.length; --i) {
    if (tokenTypes[i] === TokenType.newline) {
      continue;
    }
    return tokenTypes[i];
  }
  return TokenType.newline;
}
