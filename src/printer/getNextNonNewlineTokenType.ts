import tokenDecode from '../lexer/tokenDecode';
import TokenType, {
  isTokenAssignmentOperator,
  isTokenConstant,
  isTokenPreprocessor,
  isTokenTypeKeyword,
  isTokenTypeQualifierKeyword,
} from '../lexer/TokenType';
import PrinterCategory from './PrinterCategory';

export default function getNextNonNewlineTokenType(
  tokens: TokenType[],
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
      isTokenTypeKeyword(type) ||
      type === TokenType.identifier ||
      isTokenConstant(type)
    ) {
      return PrinterCategory.typeOrIdentifier;
    }
    if (isTokenTypeQualifierKeyword(type)) {
      return PrinterCategory.typeQualifier;
    }
    return type;
  }
  return null;
}
export function getNextNonNewlineTokenTypeRaw(
  typeArray: TokenType[],
  index: number,
  tokensAhead?: number,
): TokenType {
  for (let i = index + 1; i < typeArray.length; ++i) {
    if (typeArray[i] === TokenType.newline) {
      continue;
    } else if (tokensAhead !== undefined && --tokensAhead > 0) {
      continue;
    }
    return typeArray[i];
  }
  return TokenType.newline;
}
