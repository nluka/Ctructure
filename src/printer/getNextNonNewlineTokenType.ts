import tokenDecode from '../lexer/tokenDecode';
import TokenType, {
  isTokenAssignmentOperator,
  isTokenPreprocessor,
  isTokenTypeOrTypeQualifierKeyword,
} from '../lexer/TokenType';
import PrinterCategory from './PrinterCategory';

export default function getNextNonNewlineTokenType(
  tokens: Uint32Array,
  index: number,
  tokensAhead?: number,
): TokenType | PrinterCategory | null {
  for (let i = index + 1; i < tokens.length; ++i) {
    const type = tokenDecode(tokens[i])[1];
    if (type === TokenType.newline) {
      continue;
    } else if (tokensAhead && --tokensAhead > 0) {
      continue;
    }
    if (isTokenAssignmentOperator(type)) {
      return PrinterCategory.assignment;
    }
    if (isTokenPreprocessor(type)) {
      return PrinterCategory.prepro;
    }
    if (
      isTokenTypeOrTypeQualifierKeyword(type) ||
      type === TokenType.identifier
    ) {
      return PrinterCategory.typeOrIdentifier;
    }
    return type;
  }
  return null;
}
