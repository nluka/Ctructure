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
 * @param tokenFirstChar A string that begins with the first character of the token.
 * @param tokenStartIndex The starting index of the token.
 * @returns The category of the token - throws `TokenCategoryDeterminationError`
 * if category cannot be determined.
 */
export default function tokenDetermineCategory(
  tokenFirstChar: string,
  tokenStartIndex: number,
): TokenCategory {
  if (tokenFirstChar.match(preproRegex)) {
    return TokenCategory.prepro;
  }
  if (tokenFirstChar.match(preproOrOperatorRegex)) {
    return TokenCategory.preproOrOperator;
  }
  if (tokenFirstChar.match(commentOrOperatorRegex)) {
    return TokenCategory.commentOrOperator;
  }
  if (tokenFirstChar.match(preproMacroOrKeywordOrIdentifierOrLabelRegex)) {
    return TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel;
  }
  if (tokenFirstChar.match(constantRegex)) {
    return TokenCategory.constant;
  }
  if (tokenFirstChar.match(operatorRegex)) {
    return TokenCategory.operator;
  }
  if (tokenValueToTypeMap.get(tokenFirstChar) !== undefined) {
    return TokenCategory.special;
  }

  throw new TokenCategoryDeterminationError(tokenStartIndex, tokenFirstChar);
}

export class TokenCategoryDeterminationError {
  constructor(
    public readonly tokenStartIndex: number,
    public readonly tokenFirstChar: string,
  ) {}
}
