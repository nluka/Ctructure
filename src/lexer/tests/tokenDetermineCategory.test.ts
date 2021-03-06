import TokenCategory, { tokenCategoryToStringMap } from '../TokenCategory';
import tokenDetermineCategory from '../tokenDetermineCategory';

const [
  newline,
  special,
  preproDirective,
  commentOrOperator,
  operator,
  constant,
  operatorOrConstant,
  preproMacroOrKeywordOrIdentifierOrLabel,
] = [
  TokenCategory.newline,
  TokenCategory.special,
  TokenCategory.preproDirective,
  TokenCategory.commentOrOperator,
  TokenCategory.operator,
  TokenCategory.constant,
  TokenCategory.operatorOrConstant,
  TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
];

describe('tokenDetermineCategory', () => {
  function assert(
    expectedCategory: TokenCategory,
    fileContents: string,
    tokStartPos = 0,
  ) {
    test(`${tokenCategoryToStringMap.get(expectedCategory)} when firstChar=${JSON.stringify(fileContents.charAt(tokStartPos))}`, () => {
      expect(tokenDetermineCategory(fileContents, tokStartPos)).toBe(
        expectedCategory,
      );
    });
  }

  describe('newline', () => {
    assert(newline, '\n');
  });

  describe('special', () => {
    assert(special, ',');
    assert(special, ';');
    assert(special, '\\');
    {
      // Opening
      assert(special, '(');
      assert(special, '{');
      assert(special, '[');
    }
    {
      // Closing
      assert(special, ')');
      assert(special, '}');
      assert(special, ']');
    }
  });

  describe('preproDirective', () => {
    assert(preproDirective, '#');
  });

  describe('commentOrOperator', () => {
    assert(commentOrOperator, '/');
    assert(commentOrOperator, '/=');
  });

  describe('operator', () => {
    describe('Unary', () => {
      assert(operator, '++');
      assert(operator, '--');
      assert(operator, '~');
      assert(operator, '!');
      assert(operator, '*');
    });
    describe('Binary', () => {
      assert(operator, '+');
      assert(operator, '-');
      assert(operator, '%');
      assert(operator, '==');
      assert(operator, '!=');
      assert(operator, '>');
      assert(operator, '>=');
      assert(operator, '<');
      assert(operator, '<=');
      assert(operator, '&&');
      assert(operator, '||');
      assert(operator, '&');
      assert(operator, '|');
      assert(operator, '^');
      assert(operator, '<<');
      assert(operator, '>>');
      assert(operator, '=');
      assert(operator, '+=');
      assert(operator, '-=');
      assert(operator, '*=');
      assert(operator, '%=');
      assert(operator, '<<=');
      assert(operator, '>>=');
      assert(operator, '&=');
      assert(operator, '|=');
      assert(operator, '^=');
    });
    describe('Other', () => {
      assert(operator, '*');
      assert(operator, '->');
      assert(operator, '?');
      assert(operator, ':');
    });
  });

  describe('constants', () => {
    assert(constant, `'`);
    assert(constant, `"`);
    assert(constant, '123');
  });

  describe('operatorOrConstant', () => {
    assert(operatorOrConstant, `.`);
    assert(operatorOrConstant, `...`);
    assert(operatorOrConstant, `.123`);
  });

  describe('preproMacroOrKeywordOrIdentifierOrLabel', () => {
    assert(preproMacroOrKeywordOrIdentifierOrLabel, 'a');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, 'A');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, '_');
  });
});
