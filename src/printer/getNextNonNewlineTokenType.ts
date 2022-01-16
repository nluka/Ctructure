import { tokenDecode } from '../lexer/tokenDecode';
import TokenType, {
  isTokenAssignmentOperator,
  isTokenPreprocessor,
} from '../lexer/TokenType';
import PrinterCategory from './FormatCategory';

export default function getNextNonNewlineTokenType(
  tokens: Uint32Array,
  index: number,
): TokenType | PrinterCategory | null {
  for (let i = index + 1; i < tokens.length; ++i) {
    const type = tokenDecode(tokens[i])[1];
    if (type === TokenType.newline) {
      continue;
    }
    if (isTokenAssignmentOperator(type)) {
      return PrinterCategory.assignment;
    }
    if (isTokenPreprocessor(type)) {
      return PrinterCategory.prepro;
    }
    return type;
  }
  return null;
}
