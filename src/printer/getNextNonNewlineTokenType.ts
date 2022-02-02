import TokenType from '../lexer/TokenType';

export default function getNextNonNewlineTokenType(
  tokenTypes: Uint8Array,
  index: number,
  tokensAhead?: number,
): TokenType {
  for (let i = index + 1; i < tokenTypes.length; ++i) {
    if (
      tokenTypes[i] === TokenType.newline ||
      (tokensAhead !== undefined && --tokensAhead >= 0)
    ) {
      continue;
    }
    return tokenTypes[i];
  }
  return TokenType.newline;
}
