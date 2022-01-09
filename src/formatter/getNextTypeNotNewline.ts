import { tokenDecode } from '../lexer/tokenDecode';
import TokenType, {
  isTokenAssignmentOperator,
  isTokenPreprocessor,
} from '../lexer/TokenType';
import FormatCategory from './FormatCategory';

export default function nextTypeNotNewline(
  tokens: Uint32Array,
  index: number,
): TokenType | FormatCategory | null {
  for (let i = index + 1; i < tokens.length; ++i) {
    const type = tokenDecode(tokens[i])[1];
    if (type === TokenType.newline) {
      continue;
    }
    if (isTokenAssignmentOperator(type)) {
      return FormatCategory.assignment;
    }
    if (isTokenPreprocessor(type)) {
      return FormatCategory.prepro;
    }
    return type;
  }
  return null;
}
