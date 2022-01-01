import { tokenDecode } from '../lexer/tokenDecode';
import TokenType from '../lexer/TokenType';

export default function findClosingParen(
  tokens: Uint32Array,
  index: number,
): number {
  let count = 0;
  while (count >= 0) {
    const type = tokenDecode(tokens[index])[1];
    if (type === TokenType.specialParenthesisRight) {
      --count;
      if (count === 0) {
        return index;
      }
    } else if (type === TokenType.specialParenthesisLeft) {
      ++count;
    }
    ++index;
  }
  return index;
}
