import TokenType from '../lexer/TokenType';

export default function getPrevNonNewlineTokenType(
  typeArray: TokenType[],
  index: number,
): TokenType {
  for (let i = index - 1; i < typeArray.length; --i) {
    if (typeArray[i] === TokenType.newline) {
      continue;
    }
    return typeArray[i];
  }
  return TokenType.newline;
}
