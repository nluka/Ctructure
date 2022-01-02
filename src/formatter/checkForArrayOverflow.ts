import { tokenDecode } from '../lexer/tokenDecode';
import TokenType from '../lexer/TokenType';

export default function checkForArrayOverflow(
  tokens: Uint32Array,
  index: number,
  startLineIndex: number,
): [boolean, number] {
  let parenCount = 0;
  for (let i = index; i < tokens.length; ++i) {
    const decodedToken = tokenDecode(tokens[i]);
    if (decodedToken[1] === TokenType.specialBraceClosing) {
      --parenCount;
      if (decodedToken[0] - startLineIndex > 80) {
        return [true, i];
      } else if (parenCount === 0) {
        return [false, i];
      }
    } else if (decodedToken[1] === TokenType.specialBraceOpening) {
      ++parenCount;
    }
  }
  return [false, 0];
}
