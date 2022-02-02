import TokenType from '../lexer/TokenType';

export default function areThereCommas(
  tokenTypes: Uint8Array,
  index: number,
): boolean {
  let parenCount = 0;

  for (let i = index + 1; i < tokenTypes.length; ++i) {
    if (tokenTypes[i] === TokenType.specialParenthesisOpening) {
      ++parenCount;
    } else if (tokenTypes[i] === TokenType.specialParenthesisClosing) {
      --parenCount;
    } else if (parenCount === 0 && tokenTypes[i] === TokenType.specialComma) {
      return true;
    } else if (tokenTypes[i] === TokenType.specialSemicolon) {
      return false;
    }
  }
  return false;
}
