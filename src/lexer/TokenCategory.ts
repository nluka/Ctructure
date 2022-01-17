enum TokenCategory {
  newline,
  special,
  prepro,
  preproOrOperator,
  commentOrOperator,
  operator,
  constant,
  preproMacroOrKeywordOrIdentifierOrLabel,
}

export const tokenCategoryToStringMap = new Map<TokenCategory, string>([
  [TokenCategory.newline, 'newline'],
  [TokenCategory.special, 'special'],
  [TokenCategory.prepro, 'prepro'],
  [TokenCategory.preproOrOperator, 'preproOrOperator'],
  [TokenCategory.commentOrOperator, 'commentOrOperator'],
  [TokenCategory.operator, 'operator'],
  [TokenCategory.constant, 'constant'],
  [TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel, 'preproMacroOrKeywordOrIdentifierOrLabel'],
]);

export default TokenCategory;
