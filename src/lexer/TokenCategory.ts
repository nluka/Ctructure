/**
 * The category of a token based solely on the first character.
 */
enum TokenCategory {
  newline,
  special,
  preproDirective,
  commentOrOperator,
  operator,
  constant,
  operatorOrConstant,
  preproMacroOrKeywordOrIdentifierOrLabel,
}
export default TokenCategory;

export const tokenCategoryToStringMap = new Map<TokenCategory, string>([
  [TokenCategory.newline, 'newline'],
  [TokenCategory.special, 'special'],
  [TokenCategory.preproDirective, 'preproDirective'],
  [TokenCategory.commentOrOperator, 'commentOrOperator'],
  [TokenCategory.operator, 'operator'],
  [TokenCategory.constant, 'constant'],
  [TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel, 'preproMacroOrKeywordOrIdentifierOrLabel'],
]);
