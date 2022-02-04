import TokenCategory, { tokenCategoryToStringMap } from '../TokenCategory';
import tokenDetermineType from '../tokenDetermineType';
import TokenType from '../TokenType';
import tokenTypeToNameMap from '../tokenTypeToNameMap';

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

describe('tokenDetermineType', () => {
  function assert(
    category: TokenCategory,
    expectedType: TokenType,
    fileContents: string,
  ) {
    test(`${tokenTypeToNameMap.get(expectedType)} when fileContents=${JSON.stringify(
      fileContents,
    )}, category=${tokenCategoryToStringMap.get(category)}`, () => {
      expect(
        tokenDetermineType(fileContents, 0, fileContents.length - 1, category),
      ).toBe(expectedType);
    });
  }

  describe('Preprocessor', () => {
    describe('Hash', () => {
      assert(preproHash, TokenType.preproHash, '#include <stdio.h>');
      assert(preproHash, TokenType.preproHash, '# define A \\\n 1');
    });
    describe('Macros', () => {
      assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.preproMacroFile,      '__FILE__');
      assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.preproMacroLine,      '__LINE__');
      assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.preproMacroDate,      '__DATE__');
      assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.preproMacroTime,      '__TIME__');
      assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.preproMacroTimestamp, '__TIMESTAMP__');
    });
  });

  describe('Keywords', () => {
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordAlignas,       '_Alignas');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordAlignof,       '_Alignof');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordAuto,          'auto');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordAtomic,        '_Atomic');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordBool,          '_Bool');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordBreak,         'break');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordCase,          'case');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordChar,          'char');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordComplex,       '_Complex');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordConst,         'const');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordContinue,      'continue');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordDefault,       'default');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordDo,            'do');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordDouble,        'double');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordElse,          'else');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordEnum,          'enum');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordExtern,        'extern');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordFloat,         'float');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordFor,           'for');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordGeneric,       '_Generic');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordGoto,          'goto');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordIf,            'if');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordImaginary,     '_Imaginary');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordInt,           'int');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordLong,          'long');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordNoreturn,      '_Noreturn');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordRegister,      'register');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordReturn,        'return');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordShort,         'short');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordSigned,        'signed');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordSizeof,        'sizeof');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordStatic,        'static');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordStaticassert,  '_Static_assert');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordStruct,        'struct');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordSwitch,        'switch');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordThreadlocal,   '_Thread_local');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordTypedef,       'typedef');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordUnion,         'union');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordUnsigned,      'unsigned');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordVoid,          'void');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordVolatile,      'volatile');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordWhile,         'while');
  });

  describe('Constants', () => {
    describe('Character', () => {
      assert(constant, TokenType.constantCharacter, `' `);
      assert(constant, TokenType.constantCharacter, `' '`);
      assert(constant, TokenType.constantCharacter, `'A'`);
      assert(constant, TokenType.constantCharacter, `'1'`);
      assert(constant, TokenType.constantCharacter, `'\\''`);
      assert(constant, TokenType.constantCharacter, `'\\t'`);
      assert(constant, TokenType.constantCharacter, `'\\n'`);
      assert(constant, TokenType.constantCharacter, `'\\r'`);
    });
    describe('String', () => {
      assert(constant, TokenType.constantString, `""`);
      assert(constant, TokenType.constantString, `" "`);
      assert(constant, TokenType.constantString, `"\\""`);
      assert(constant, TokenType.constantString, `"\\t"`);
      assert(constant, TokenType.constantString, `"\\n"`);
      assert(constant, TokenType.constantString, `"\\r"`);
      assert(constant, TokenType.constantString, `"ABC"`);
      assert(constant, TokenType.constantString, `"123"`);
    });
    describe('Number', () => {
      describe('int', () => {
        assert(constant, TokenType.constantNumber, '123'  ); // decimal
        assert(constant, TokenType.constantNumber, '123u' ); // decimal unsigned
        assert(constant, TokenType.constantNumber, '123U' ); // decimal unsigned
        assert(constant, TokenType.constantNumber, '0123' ); // octal
        assert(constant, TokenType.constantNumber, '0x12c'); // hex
        assert(constant, TokenType.constantNumber, '0X12c'); // hex
        assert(constant, TokenType.constantNumber, '0x12C'); // hex
        assert(constant, TokenType.constantNumber, '0X12C'); // hex
      });
      describe('long', () => {
        assert(constant, TokenType.constantNumber, '123l'   );
        assert(constant, TokenType.constantNumber, '123L'   );
        assert(constant, TokenType.constantNumber, '123lu'  ); // unsigned
        assert(constant, TokenType.constantNumber, "123lU"  ); // unsigned
        assert(constant, TokenType.constantNumber, '123Lu'  ); // unsigned
        assert(constant, TokenType.constantNumber, '123LU'  ); // unsigned
        assert(constant, TokenType.constantNumber, '0123l'  ); // octal
        assert(constant, TokenType.constantNumber, '0123lu' ); // octal unsigned
        assert(constant, TokenType.constantNumber, '0123lU' ); // octal unsigned
        assert(constant, TokenType.constantNumber, '0123L'  ); // octal unsigned
        assert(constant, TokenType.constantNumber, '0123Lu' ); // octal unsigned
        assert(constant, TokenType.constantNumber, '0123LU' ); // octal unsigned
        assert(constant, TokenType.constantNumber, '0x12cl' ); // hex
        assert(constant, TokenType.constantNumber, '0X12CL' ); // hex
        assert(constant, TokenType.constantNumber, '0x12clu'); // hex unsigned
        assert(constant, TokenType.constantNumber, '0x12clU'); // hex unsigned
        assert(constant, TokenType.constantNumber, '0X12CLu'); // hex unsigned
        assert(constant, TokenType.constantNumber, '0X12CLU'); // hex unsigned
      });
      describe('long long', () => {
        assert(constant, TokenType.constantNumber, '123ll'   );
        assert(constant, TokenType.constantNumber, '123lL'   );
        assert(constant, TokenType.constantNumber, '123LL'   );
        assert(constant, TokenType.constantNumber, '123llu'  ); // unsigned
        assert(constant, TokenType.constantNumber, "123llU"  ); // unsigned
        assert(constant, TokenType.constantNumber, '123LLu'  ); // unsigned
        assert(constant, TokenType.constantNumber, '123LLU'  ); // unsigned
        assert(constant, TokenType.constantNumber, '0123ll'  ); // octal
        assert(constant, TokenType.constantNumber, '0123llu' ); // octal unsigned
        assert(constant, TokenType.constantNumber, '0123llU' ); // octal unsigned
        assert(constant, TokenType.constantNumber, '0123LL'  ); // octal unsigned
        assert(constant, TokenType.constantNumber, '0123LLu' ); // octal unsigned
        assert(constant, TokenType.constantNumber, '0123LLU' ); // octal unsigned
        assert(constant, TokenType.constantNumber, '0x12cll' ); // hex
        assert(constant, TokenType.constantNumber, '0X12CLL' ); // hex
        assert(constant, TokenType.constantNumber, '0x12cllu'); // hex unsigned
        assert(constant, TokenType.constantNumber, '0x12cllU'); // hex unsigned
        assert(constant, TokenType.constantNumber, '0X12CLLu'); // hex unsigned
        assert(constant, TokenType.constantNumber, '0X12CLLU'); // hex unsigned
      });
      describe('long long unsigned', () => {
        assert(constant, TokenType.constantNumber, '123ll'   );
        assert(constant, TokenType.constantNumber, '123LL'   );
        assert(constant, TokenType.constantNumber, '123llu'  ); // unsigned
        assert(constant, TokenType.constantNumber, '123llU'  ); // unsigned
        assert(constant, TokenType.constantNumber, '123LLu'  ); // unsigned
        assert(constant, TokenType.constantNumber, '123LLU'  ); // unsigned
        assert(constant, TokenType.constantNumber, '0123ll'  ); // octal
        assert(constant, TokenType.constantNumber, '0123ll'  ); // octal unsigned
        assert(constant, TokenType.constantNumber, '0123llU' ); // octal unsigned
        assert(constant, TokenType.constantNumber, '0123LL'  ); // octal unsigned
        assert(constant, TokenType.constantNumber, '0123LLu' ); // octal unsigned
        assert(constant, TokenType.constantNumber, '0123LLU' ); // octal unsigned
        assert(constant, TokenType.constantNumber, '0x12cll' ); // hex
        assert(constant, TokenType.constantNumber, '0X12CLL' ); // hex
        assert(constant, TokenType.constantNumber, '0x12cllu'); // hex unsigned
        assert(constant, TokenType.constantNumber, '0x12cllU'); // hex unsigned
        assert(constant, TokenType.constantNumber, '0X12CLLu'); // hex unsigned
        assert(constant, TokenType.constantNumber, '0X12CLLU'); // hex unsigned
      });
      describe('float', () => {
        assert(constant, TokenType.constantNumber, '123.45 ');
        assert(constant, TokenType.constantNumber, '123.45f');
        assert(constant, TokenType.constantNumber, '123.45F');
      });
    });
  });

  describe('Operators', () => {
    describe('Binary', () => {
      describe('Arithmetic', () => {
        assert(commentOrOperator, TokenType.operatorBinaryArithmeticDivision, '/');
      });
      describe('Logical', () => {
        assert(operator, TokenType.operatorUnaryLogicalNegation,  '!');
        assert(operator, TokenType.operatorBinaryLogicalAnd,      '&&');
        assert(operator, TokenType.operatorBinaryLogicalOr,       '||');
      });
      describe('Comparison', () => {
        assert(operator, TokenType.operatorBinaryComparisonEqualTo,               '==');
        assert(operator, TokenType.operatorBinaryComparisonNotEqualTo,            '!=');
        assert(operator, TokenType.operatorBinaryComparisonGreaterThan,           '>');
        assert(operator, TokenType.operatorBinaryComparisonGreaterThanOrEqualTo,  '>=');
        assert(operator, TokenType.operatorBinaryComparisonLessThan,              '<');
        assert(operator, TokenType.operatorBinaryComparisonLessThanOrEqualTo,     '<=');
      });
      describe('Bitwise', () => {
        assert(operator, TokenType.operatorUnaryBitwiseOnesComplement,  '~');
        assert(operator, TokenType.operatorBinaryBitwiseOr,             '|');
      });
      describe('Assignment', () => {
        assert(operator, TokenType.operatorBinaryAssignmentDirect,            '=');
        assert(operator, TokenType.operatorBinaryAssignmentAddition,          '+=');
        assert(operator, TokenType.operatorBinaryAssignmentSubtraction,       '-=');
        assert(operator, TokenType.operatorBinaryAssignmentMultiplication,    '*=');
        assert(operator, TokenType.operatorBinaryAssignmentModulo,            '%=');
        assert(operator, TokenType.operatorBinaryAssignmentBitwiseShiftLeft,  '<<=');
        assert(operator, TokenType.operatorBinaryAssignmentBitwiseShiftRight, '>>=');
        assert(operator, TokenType.operatorBinaryAssignmentBitwiseAnd,        '&=');
        assert(operator, TokenType.operatorBinaryAssignmentBitwiseOr,         '|=');
        assert(operator, TokenType.operatorBinaryAssignmentBitwiseXor,        '^=');
      });
    });
    describe('Other', () => {
      assert(operator, TokenType.operatorMemberSelectionDirect,   '.');
      assert(operator, TokenType.operatorMemberSelectionIndirect, '->');
      assert(operator, TokenType.operatorTernaryQuestion,         '?');
      assert(operator, TokenType.operatorEllipses,                '...');
    });
  });

  describe('Special', () => {
    assert(special, TokenType.specialComma,               ',');
    assert(special, TokenType.specialSemicolon,           ';');
    assert(special, TokenType.specialParenthesisOpening,  '(');
    assert(special, TokenType.specialBraceOpening,        '{');
    assert(special, TokenType.specialBracketOpening,      '[');
    assert(special, TokenType.specialParenthesisClosing,  ')');
    assert(special, TokenType.specialBraceClosing,        '}');
    assert(special, TokenType.specialBracketClosing,      ']');
  });

  describe('Special', () => {
    assert(special, TokenType.specialComma,             ',');
    assert(special, TokenType.specialSemicolon,         ';');
    assert(special, TokenType.speicalLineContinuation,  '\\');
    {
      // Opening
      assert(special, TokenType.specialParenthesisOpening,  '(');
      assert(special, TokenType.specialBraceOpening,        '{');
      assert(special, TokenType.specialBracketOpening,      '[');
    }
    {
      // Closing
      assert(special, TokenType.specialParenthesisClosing,  ')');
      assert(special, TokenType.specialBraceClosing,        '}');
      assert(special, TokenType.specialBracketClosing,      ']');
    }
  });

  describe('Other', () => {
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordInt,       'int');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordAlignas,   '_Alignas');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.keywordRestrict,  'restrict');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.identifier,       'indentifer');
    assert(preproMacroOrKeywordOrIdentifierOrLabel, TokenType.identifier,       'Indentifer');
  });

  describe('Ambiguous', () => {
    assert(operator, TokenType.ambiguousIncrement,  '++');
    assert(operator, TokenType.ambiguousDecrement,  '--');
    assert(operator, TokenType.ambiguousPlus,       '+');
    assert(operator, TokenType.ambiguousMinus,      '-');
    assert(operator, TokenType.ambiguousAsterisk,   '*');
    assert(operator, TokenType.ambiguousAmpersand,  '&');
    assert(operator, TokenType.ambiguousColon,      ':');
  });
});
