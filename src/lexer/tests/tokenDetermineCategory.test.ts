import TokenCategory, { tokenCategoryToStringMap } from '../TokenCategory';
import tokenDetermineCategory from '../tokenDetermineCategory';

const [
  newline,
  special,
  preproHash,
  commentOrOperator,
  operator,
  constant,
  preproMacroOrKeywordOrIdentifierOrLabel,
] = [
  TokenCategory.newline,
  TokenCategory.special,
  TokenCategory.preproHash,
  TokenCategory.commentOrOperator,
  TokenCategory.operator,
  TokenCategory.constant,
  TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
];

describe('tokenDetermineCategory', () => {
  function assert(
    expectedCategory: TokenCategory,
    fileContents: string,
    tokenStartIndex = 0,
  ) {
    test(`${tokenCategoryToStringMap.get(expectedCategory)} when firstChar=${JSON.stringify(fileContents.charAt(tokenStartIndex))}`, () => {
      expect(tokenDetermineCategory(fileContents, tokenStartIndex)).toBe(
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

  describe('preproHash', () => {
    assert(preproHash, '#');
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
      assert(operator, '.');
      assert(operator, '->');
      assert(operator, '?');
      assert(operator, ':');
      assert(operator, '...');
    });
  });

  describe('constants', () => {
    assert(constant, `'`);
    assert(constant, `"`);
    assert(constant, '123');
  });

  describe('preproMacroOrKeywordOrIdentifierOrLabel', () => {
    assert(preproMacroOrKeywordOrIdentifierOrLabel, 'a');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, 'A');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, '_');
  });
});
