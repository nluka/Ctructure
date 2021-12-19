import TokenCategory from './TokenCategory';
import { tokenSpecialValueToTypeMap } from './tokenMaps';

/**
 * Determines the category of a token based on its first character.
 * @param tokenFirstChar A string whose first char is the first char of the token.
 * @param tokenStartIndex The starting index of the token.
 * @returns The category of the token - throws `TokenCategoryDeterminationError`
 * if category cannot be determined.
 */
export default function tokenDetermineCategory(
  tokenFirstChar: string,
  tokenStartIndex: number,
): TokenCategory {
  if (tokenFirstChar.match(/^#/)) {
    return TokenCategory.prepro;
  }
  if (tokenFirstChar.match(/^[<\\]/)) {
    return TokenCategory.preproOrOperator;
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
  if (tokenSpecialValueToTypeMap.get(tokenFirstChar) !== undefined) {
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
