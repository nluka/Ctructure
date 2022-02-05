import TokenType from '../lexer/TokenType';

export default function nextNonNewlineTokenType(
  tokenTypes: Uint8Array,
  tokenCount: number,
  index: number,
  tokensAhead?: number,
): TokenType {
  for (let i = index + 1; i < tokenCount; ++i) {
    if (
      tokenTypes[i] === TokenType.newline ||
      (tokensAhead !== undefined && --tokensAhead > 0)
    ) {
      continue;
    }
    return tokenTypes[i];
  }
  return TokenType.newline;
}
