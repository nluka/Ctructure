import { tokenDecode } from '../lexer/tokenDecode';
import TokenType from '../lexer/TokenType';
import FormatCategory from './FormatCategory';

export default function getNextTokenTypeNotNewLine(
  tokens: Uint32Array,
  index: number,
  endIndex: number,
): TokenType | FormatCategory | null {
  for (let i = index + 1; i < endIndex; ++i) {
    const type = tokenDecode(tokens[i])[1];
    if (type !== TokenType.newline) {
      if (type > 90 && type < 102) {
        return FormatCategory.assignment;
      } else if (type < 19) {
        return FormatCategory.prepro;
      }
      return type;
    }
  }
  return null;
}
