import TokenCategory from './TokenCategory';
import tokenValueToTypeMap from './tokenValueToTypeMap';

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
  if (tokenFirstChar.match(/^[#\\]/)) {
    return TokenCategory.prepro;
  }
  if (tokenFirstChar.match(/^[<]/)) {
    return TokenCategory.preproOrOperator;
  }
  if (tokenFirstChar.match(/^\//)) {
    return TokenCategory.commentOrOperator;
  }
  if (tokenFirstChar.match(/^[a-zA-Z_]/)) {
    return TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel;
  }
  if (tokenFirstChar.match(/^[0-9'"]/)) {
    return TokenCategory.constant;
  }
  if (tokenFirstChar.match(/^[+\-~!*/%=>&|^.?:]/)) {
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
