/**
 * The category of a token based solely on the first character.
 */
enum TokenCategory {
  newline,
  special,
  preproHash,
  commentOrOperator,
  operator,
  constant,
  preproMacroOrKeywordOrIdentifierOrLabel,
}

export default TokenCategory;

export const tokenCategoryToStringMap = new Map<TokenCategory, string>([
  [TokenCategory.newline, 'newline'],
  [TokenCategory.special, 'special'],
  [TokenCategory.preproHash, 'preproHash'],
  [TokenCategory.commentOrOperator, 'commentOrOperator'],
  [TokenCategory.operator, 'operator'],
  [TokenCategory.constant, 'constant'],
  [TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel, 'preproMacroOrKeywordOrIdentifierOrLabel'],
]);
