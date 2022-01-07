import { tokenDecode } from '../lexer/tokenDecode';
import TokenType from '../lexer/TokenType';
import FormatCategory from './FormatCategory';

export default function getNextTokenTypeNotNewLine(
  tokens: Uint32Array,
  index: number,
): TokenType | FormatCategory | null {
  for (let i = index + 1; i < tokens.length; ++i) {
    const type = tokenDecode(tokens[i])[1];
    if (type !== TokenType.newline) {
      if (
        type >= TokenType.operatorBinaryAssignmentDirect &&
        type <= TokenType.operatorBinaryAssignmentBitwiseXor
      ) {
        return FormatCategory.assignment;
      } else if (type <= TokenType.preproLineContinuation) {
        return FormatCategory.prepro;
      }
      return type;
    }
  }
  return null;
}
