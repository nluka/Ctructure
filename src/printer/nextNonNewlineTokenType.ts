import TokenType from '../lexer/TokenType';

export default function nextNonNewlineTokenType(
  tokTypes: Uint8Array,
  tokCount: number,
  index: number,
  toksAhead?: number,
): TokenType {
  for (let i = index + 1; i < tokCount; ++i) {
    if (
      tokTypes[i] === TokenType.newline ||
      (toksAhead !== undefined && --toksAhead > 0)
    ) {
      continue;
    }
    return tokTypes[i];
  }
  return TokenType.newline;
}
