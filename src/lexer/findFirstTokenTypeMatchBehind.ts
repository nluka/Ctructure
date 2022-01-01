import TokenArray from '../lexer/TokenArray';
import TokenType from '../lexer/TokenType';

export default function findFirstTokenTypeMatchBehind(
  tokens: TokenArray,
  firstSearchIndex: number,
  searchTokenTypes: TokenType[],
  equality: boolean,
): [number, TokenType] | null {
  if (firstSearchIndex >= tokens.getCount()) {
    return null;
  }

  for (let i = firstSearchIndex; i > 0; --i) {
    const [tokenStartIndex, tokenType] = tokens.getTokenDecoded(i);
    for (const searchType of searchTokenTypes) {
      if ((tokenType === searchType) === equality) {
        return [tokenStartIndex, tokenType];
      }
    }
  }
  return null;
}
