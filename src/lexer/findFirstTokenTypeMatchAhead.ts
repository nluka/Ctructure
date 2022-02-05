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
 * @returns The first token type and its index in `tokens` at or ahead of `firstSearchIndex`
 * that matches one of or none of `searchTokenTypes` depending on `equality`.
 */
export default function findFirstTokenTypeMatchAhead(
  tokens: TokenArray,
  firstSearchIndex: number,
  searchTokenTypes: TokenType[],
  equality: boolean,
): [TokenType, number] | [-1, -1] {
  if (!tokens.isIndexInBounds(firstSearchIndex)) {
    return [-1, -1];
  }

  for (let i = firstSearchIndex; i < tokens.getCount(); ++i) {
    const tokenType = tokens.getTokenType(i);
    if (searchTokenTypes.includes(tokenType) === equality) {
      return [tokenType, i];
    }
  }
  return [-1, -1];
}
