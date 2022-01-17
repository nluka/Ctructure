import tokenDecode from '../lexer/tokenDecode';
import TokenType from '../lexer/TokenType';

export default function areThereCommas(
  tokens: Uint32Array,
  index: number,
): boolean {
  let parenCount = 0;
  for (let i = index + 1; i < tokens.length; ++i) {
    const type = tokenDecode(tokens[i])[1];
    if (type === TokenType.specialParenthesisOpening) {
      ++parenCount;
    } else if (type === TokenType.specialParenthesisClosing) {
      --parenCount;
    } else if (parenCount === 0 && type === TokenType.specialComma) {
      return true;
    } else if (type === TokenType.specialSemicolon) {
      return false;
    }
  }
  return false;
}
