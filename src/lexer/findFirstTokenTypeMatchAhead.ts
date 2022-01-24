import TokenArray from '../lexer/TokenArray';
import TokenType from '../lexer/TokenType';

/**
 * @param tokens The array of tokens to search.
 * @param firstSearchIndex The first index to search.
 * @param searchTokenTypes The types of tokens to match with `equality`.
 * @param equality The kind of equality to check for when comparing a token with
 * `searchTokenTypes`. If true, will find the first token whose type matches any one
 * of the types in `searchTokenTypes`. If false, will find the first token whose type
 * does not match any of the types in `searchTokenTypes`.
 * @returns The first token at or ahead of `firstSearchIndex` that matches one of or none of
 * `searchTokenTypes` depending on `equality`.
 */
export default function findFirstTokenTypeMatchAhead(
  tokens: TokenArray,
  firstSearchIndex: number,
  searchTokenTypes: TokenType[],
  equality: boolean,
): [number, TokenType] | null {
  if (!tokens.isIndexInBounds(firstSearchIndex)) {
    return null;
  }

  for (let i = firstSearchIndex; i < tokens.getCount(); ++i) {
    const [tokenStartIndex, tokenType] = tokens.getToken(i);
    if (searchTokenTypes.includes(tokenType) === equality) {
      return [tokenStartIndex, tokenType];
    }
  }
  return null;
}
