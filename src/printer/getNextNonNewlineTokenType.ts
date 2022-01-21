import tokenDecode from '../lexer/tokenDecode';
import TokenType, {
  isTokenAssignmentOperator,
  isTokenConstant,
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
    } else if (tokensAhead !== undefined && --tokensAhead > 0) {
      continue;
    }
    if (isTokenAssignmentOperator(type)) {
      return PrinterCategory.assignment;
    }
    if (type === TokenType.preproLineContinuation) {
      return type;
    }
    if (isTokenPreprocessor(type)) {
      return PrinterCategory.prepro;
    }
    if (
      isTokenTypeOrTypeQualifierKeyword(type) ||
      type === TokenType.identifier ||
      isTokenConstant(type)
    ) {
      return PrinterCategory.typeOrIdentifier;
    }
    return type;
  }
  return null;
}
