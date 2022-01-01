import { tokenDecode } from '../lexer/tokenDecode';
import TokenType from '../lexer/TokenType';

export default function checkArrayOverflow(
  tokens: Uint32Array,
  index: number,
  startLineIndex: number,
): boolean {
  let parenCount = 1;
  for (let i = index + 1; i < tokens.length; ++i) {
    const decodedToken = tokenDecode(tokens[i]);
    if (decodedToken[1] === TokenType.specialBraceRight) {
      --parenCount;
      if (decodedToken[0] - startLineIndex > 80) {
        return true;
      } else if (parenCount === 0) {
        return false;
      }
    } else if (decodedToken[1] === TokenType.specialBraceLeft) {
      ++parenCount;
    }
  }
  return false;
}
