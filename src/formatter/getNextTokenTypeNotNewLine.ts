import { tokenDecode } from '../lexer/tokenDecode';
import TokenType from '../lexer/TokenType';
import FormatType from './FormatCategory';

export default function findNextTokenTypeNotNewLine(
  tokens: Uint32Array,
  index: number,
  endIndex: number,
): TokenType | FormatType | null {
  for (let i = index + 1; i < endIndex; ++i) {
    const type = tokenDecode(tokens[i])[1];
    if (type !== TokenType.newline) {
      if (type > 90 && type < 102) {
        return FormatType.assignment;
      } else if (type < 19) {
        return FormatType.prepro;
      }
      return type;
    }
  }
  return null;
}
