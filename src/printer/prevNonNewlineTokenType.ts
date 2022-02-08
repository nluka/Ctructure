import TokenType from '../lexer/TokenType';

export default function getPrevNonNewlineTokenType(
  tokTypes: Uint8Array,
  tokCount: number,
  index: number,
): TokenType {
  for (let i = index - 1; i < tokCount; --i) {
    if (tokTypes[i] === TokenType.newline) {
      continue;
    }
    return tokTypes[i];
  }
  return TokenType.newline;
}
