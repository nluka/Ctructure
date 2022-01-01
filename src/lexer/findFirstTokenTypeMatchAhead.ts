import TokenArray from '../lexer/TokenArray';
import TokenType from '../lexer/TokenType';

export default function findFirstTokenTypeMatchAhead(
  tokens: TokenArray,
  firstSearchIndex: number,
  searchTokenTypes: TokenType[],
  equality: boolean,
): [number, TokenType] | null {
  tokens.checkIndexBounds(firstSearchIndex);

  for (let i = firstSearchIndex; i < tokens.getCount(); ++i) {
    const [tokenStartIndex, tokenType] = tokens.getTokenDecoded(i);
    if (searchTokenTypes.includes(tokenType) === equality) {
      return [tokenStartIndex, tokenType];
    }
  }
  return null;
}
