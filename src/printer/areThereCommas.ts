import TokenType from '../lexer/TokenType';

export default function areThereCommas(
  typeArray: TokenType[],
  index: number,
): boolean {
  let parenCount = 0;
  for (let i = index + 1; i < typeArray.length; ++i) {
    if (typeArray[i] === TokenType.specialParenthesisOpening) {
      ++parenCount;
    } else if (typeArray[i] === TokenType.specialParenthesisClosing) {
      --parenCount;
    } else if (parenCount === 0 && typeArray[i] === TokenType.specialComma) {
      return true;
    } else if (typeArray[i] === TokenType.specialSemicolon) {
      return false;
    }
  }
  return false;
}
