import TokenCategory from './TokenCategory';
import tokenValueToTypeMap from './tokenValueToTypeMap';

const preproRegex = /^[#\\]/,
  preproOrOperatorRegex = /^[<]/,
  commentOrOperatorRegex = /^\//,
  preproMacroOrKeywordOrIdentifierOrLabelRegex = /^[a-zA-Z_]/,
  constantRegex = /^[0-9'"]/,
  operatorRegex = /^[+\-~!*/%=>&|^.?:]/;

/**
 * Determines the category of a token based on its first character.
 * @param tokenStart A string that begins with the first character of the token.
 * @param tokenStartIndex The starting index of the token.
 * @returns The category of the token - throws `TokenCategoryDeterminationError`
 * if category cannot be determined.
 */
export default function tokenDetermineCategory(
  tokenStart: string,
  tokenStartIndex: number,
): TokenCategory {
  if (tokenStart.charAt(0) === '\n') {
    return TokenCategory.newline;
  }
  if (tokenStart.match(preproRegex)) {
    return TokenCategory.prepro;
  }
  if (tokenStart.match(preproOrOperatorRegex)) {
    return TokenCategory.preproOrOperator;
  }
  if (tokenStart.match(commentOrOperatorRegex)) {
    return TokenCategory.commentOrOperator;
  }
  if (tokenStart.match(preproMacroOrKeywordOrIdentifierOrLabelRegex)) {
    return TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel;
  }
  if (tokenStart.match(constantRegex)) {
    return TokenCategory.constant;
  }
  if (tokenStart.match(operatorRegex)) {
    return TokenCategory.operator;
  }
  if (tokenValueToTypeMap.get(tokenStart) !== undefined) {
    return TokenCategory.special;
  }

  throw new TokenCategoryDeterminationError(tokenStartIndex, tokenStart);
}

export class TokenCategoryDeterminationError {
  constructor(
    public readonly tokenStartIndex: number,
    public readonly tokenFirstChar: string,
  ) {}
}
