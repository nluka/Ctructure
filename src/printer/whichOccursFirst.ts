import TokenType from '../lexer/TokenType';

export default function whichOccursFirst(
  tokenTypes: Uint8Array,
  index: number,
  tokenTypeOne: TokenType,
  tokenTypeTwo: TokenType,
): TokenType {
  for (let i = index; i < tokenTypes.length; ++i) {
    if (tokenTypes[i] === tokenTypeOne) {
      return tokenTypeOne;
    }
    if (tokenTypes[i] === tokenTypeTwo) {
      return tokenTypeTwo;
    }
  }
  return tokenTypeTwo;
}
