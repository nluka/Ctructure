import TokenCategory from '../TokenCategory';
import tokenDetermineType from '../tokenDetermineType';
import TokenType from '../TokenType';

describe('tokenDetermineType', () => {
  function assert(
    fileContents: string,
    startIndex: number,
    lastIndex: number,
    category: TokenCategory,
    expectedType: TokenType,
  ) {
    test(`return ${expectedType} when fileContents=${JSON.stringify(
      fileContents,
    )}, startIndex=${startIndex}, lastIndex=${lastIndex}, category=${category}`, () => {
      expect(
        tokenDetermineType(fileContents, startIndex, lastIndex, category),
      ).toBe(expectedType);
    });
  }

  describe('Preprocessor', () => {
    describe('Directives', () => {
      assert(
        '#include ',
        0,
        7,
        TokenCategory.prepro,
        TokenType.preproDirectiveInclude,
      );
      assert(
        ' #define PI 3.1',
        1,
        7,
        TokenCategory.prepro,
        TokenType.preproDirectiveDefine,
      );
      assert(
        '... \\\n',
        4,
        4,
        TokenCategory.prepro,
        TokenType.preproLineContinuation,
      );
      assert(
        '#undef PI',
        0,
        5,
        TokenCategory.prepro,
        TokenType.preproDirectiveUndef,
      );
      assert('#if 1', 0, 2, TokenCategory.prepro, TokenType.preproDirectiveIf);
      assert(
        '\n#ifdef PI',
        1,
        6,
        TokenCategory.prepro,
        TokenType.preproDirectiveIfdef,
      );
      assert(
        '#ifndef PI',
        0,
        6,
        TokenCategory.prepro,
        TokenType.preproDirectiveIfndef,
      );
      assert(
        '#error "message"',
        0,
        5,
        TokenCategory.prepro,
        TokenType.preproDirectiveError,
      );
      assert(
        '#pragma once',
        0,
        6,
        TokenCategory.prepro,
        TokenType.preproDirectivePragma,
      );
    });

    describe('Macros', () => {
      assert(
        '__FILE__',
        0,
        7,
        TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
        TokenType.preproMacroFile,
      );
      assert(
        '(__LINE__)',
        1,
        8,
        TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
        TokenType.preproMacroLine,
      );
      assert(
        '__DATE__\n',
        0,
        7,
        TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
        TokenType.preproMacroDate,
      );
      assert(
        'printf("%s", __TIME__);\n',
        13,
        20,
        TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
        TokenType.preproMacroTime,
      );
      assert(
        '\n__TIMESTAMP__',
        1,
        13,
        TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
        TokenType.preproMacroTimestamp,
      );
    });

    describe('Other', () => {
      assert(
        '<stdio.h>',
        0,
        8,
        TokenCategory.preproOrOperator,
        TokenType.preproStandardHeader,
      );
      assert('##', 0, 1, TokenCategory.prepro, TokenType.preproOperatorConcat);
    });
  });

  describe('Keywords', () => {
    assert(
      '_Alignas',
      0,
      7,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordAlignas,
    );
    assert(
      'alignas',
      0,
      6,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordAlignas,
    );
    assert(
      '_Alignof',
      0,
      7,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordAlignof,
    );
    assert(
      'alignof',
      0,
      6,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordAlignof,
    );
    assert(
      'auto',
      0,
      3,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordAuto,
    );
    assert(
      '_Atomic',
      0,
      6,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordAtomic,
    );
    assert(
      'atomic',
      0,
      5,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordAtomic,
    );
    assert(
      '_Bool',
      0,
      4,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordBool,
    );
    assert(
      'bool',
      0,
      3,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordBool,
    );
    assert(
      'break',
      0,
      4,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordBreak,
    );
    assert(
      'case',
      0,
      3,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordCase,
    );
    assert(
      'char',
      0,
      3,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordChar,
    );
    assert(
      '_Complex',
      0,
      7,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordComplex,
    );
    assert(
      'complex',
      0,
      6,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordComplex,
    );
    assert(
      'const',
      0,
      5,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordConst,
    );
    assert(
      'continue',
      0,
      7,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordContinue,
    );
    assert(
      'default',
      0,
      6,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordDefault,
    );
    assert(
      'do',
      0,
      1,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordDo,
    );
    assert(
      'double',
      0,
      5,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordDouble,
    );
    assert(
      'else',
      0,
      3,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordElse,
    );
    assert(
      'enum',
      0,
      3,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordEnum,
    );
    assert(
      'extern',
      0,
      5,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordExtern,
    );
    assert(
      'float',
      0,
      4,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordFloat,
    );
    assert(
      'for',
      0,
      2,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordFor,
    );
    assert(
      '_Generic',
      0,
      7,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordGeneric,
    );
    assert(
      'generic',
      0,
      6,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordGeneric,
    );
    assert(
      'goto',
      0,
      3,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordGoto,
    );
    assert(
      'if',
      0,
      1,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordIf,
    );
    assert(
      '_Imaginary',
      0,
      9,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordImaginary,
    );
    assert(
      'imaginary',
      0,
      8,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordImaginary,
    );
    assert(
      'int',
      0,
      2,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordInt,
    );
    assert(
      'long',
      0,
      3,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordLong,
    );
    assert(
      '_Noreturn',
      0,
      8,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordNoreturn,
    );
    assert(
      'noreturn',
      0,
      7,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordNoreturn,
    );
    assert(
      'register',
      0,
      7,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordRegister,
    );
    assert(
      'return',
      0,
      5,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordReturn,
    );
    assert(
      'short',
      0,
      4,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordShort,
    );
    assert(
      'signed',
      0,
      5,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordSigned,
    );
    assert(
      'sizeof',
      0,
      5,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordSizeof,
    );
    assert(
      'static',
      0,
      5,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordStatic,
    );
    assert(
      '_Static_assert',
      0,
      13,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordStaticassert,
    );
    assert(
      'static_assert',
      0,
      12,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordStaticassert,
    );
    assert(
      'struct',
      0,
      5,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordStruct,
    );
    assert(
      'switch',
      0,
      5,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordSwitch,
    );
    assert(
      '_Thread_local',
      0,
      13,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordThreadlocal,
    );
    assert(
      'thread_local',
      0,
      12,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordThreadlocal,
    );
    assert(
      'typedef',
      0,
      6,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordTypedef,
    );
    assert(
      'union',
      0,
      5,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordUnion,
    );
    assert(
      'unsigned',
      0,
      7,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordUnsigned,
    );
    assert(
      'void',
      0,
      3,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordVoid,
    );
    assert(
      'volatile',
      0,
      8,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordVolatile,
    );
    assert(
      'while',
      0,
      4,
      TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel,
      TokenType.keywordWhile,
    );
  });

  describe('Number', () => {
    describe('int', () => {
      assert('123', 0, 2, TokenCategory.constant, TokenType.constantNumber); // decimal
      assert('123u', 0, 3, TokenCategory.constant, TokenType.constantNumber); // decimal unsigned
      assert('123U', 0, 3, TokenCategory.constant, TokenType.constantNumber); // decimal unsigned
      assert('0123', 0, 3, TokenCategory.constant, TokenType.constantNumber); // octal
      assert('0x12c', 0, 4, TokenCategory.constant, TokenType.constantNumber); // hex
      assert('0x12C', 0, 4, TokenCategory.constant, TokenType.constantNumber); // hex
    });
    describe('long', () => {
      assert(' 123l ', 1, 4, TokenCategory.constant, TokenType.constantNumber);
      assert(
        ' 123lu\n',
        1,
        5,
        TokenCategory.constant,
        TokenType.constantNumber,
      ); // unsigned
      assert(
        ' [123lU]',
        2,
        6,
        TokenCategory.constant,
        TokenType.constantNumber,
      ); // unsigned
      assert(' 123L)', 1, 4, TokenCategory.constant, TokenType.constantNumber);
      assert(' 123Lu+', 1, 5, TokenCategory.constant, TokenType.constantNumber); // unsigned
      assert(' 123LU-', 1, 5, TokenCategory.constant, TokenType.constantNumber); // unsigned
      assert(' 0123l/', 1, 5, TokenCategory.constant, TokenType.constantNumber); // octal
      assert(
        ' 0123lu*',
        1,
        6,
        TokenCategory.constant,
        TokenType.constantNumber,
      ); // octal unsigned
      assert(
        ' 0123lU=',
        1,
        6,
        TokenCategory.constant,
        TokenType.constantNumber,
      ); // octal unsigned
      assert(' 0123L%', 1, 5, TokenCategory.constant, TokenType.constantNumber); // octal
      assert(
        ' 0123Lu<',
        1,
        6,
        TokenCategory.constant,
        TokenType.constantNumber,
      ); // octal unsigned
      assert(
        ' 0123LU>',
        1,
        6,
        TokenCategory.constant,
        TokenType.constantNumber,
      ); // octal unsigned
      assert(
        ' 0x12clu!',
        1,
        7,
        TokenCategory.constant,
        TokenType.constantNumber,
      ); // hex
      assert(
        ' 0x12clU|',
        1,
        7,
        TokenCategory.constant,
        TokenType.constantNumber,
      ); // hex unsigned
      assert(
        ' 0X12Cu?',
        1,
        6,
        TokenCategory.constant,
        TokenType.constantNumber,
      ); // hex
      assert(
        ' 0X12CU,',
        1,
        6,
        TokenCategory.constant,
        TokenType.constantNumber,
      ); // hex unsigned
    });
    describe('long long int', () => {
      assert('123ll;', 0, 4, TokenCategory.constant, TokenType.constantNumber);
      assert('123llu:', 0, 5, TokenCategory.constant, TokenType.constantNumber); // unsigned
      assert("123llU'", 0, 5, TokenCategory.constant, TokenType.constantNumber); // unsigned
      assert('123LL"', 0, 4, TokenCategory.constant, TokenType.constantNumber);
      assert('123LLu&', 0, 5, TokenCategory.constant, TokenType.constantNumber); // unsigned
      assert('123LLU^', 0, 5, TokenCategory.constant, TokenType.constantNumber); // unsigned
      assert('0123ll~', 0, 4, TokenCategory.constant, TokenType.constantNumber); // octal
      assert(
        '0123llu ',
        0,
        5,
        TokenCategory.constant,
        TokenType.constantNumber,
      ); // octal unsigned
      assert(
        '0123llU ',
        0,
        5,
        TokenCategory.constant,
        TokenType.constantNumber,
      ); // octal unsigned
      assert('0123LL ', 0, 4, TokenCategory.constant, TokenType.constantNumber); // octal unsigned
      assert(
        '0123LLu ',
        0,
        5,
        TokenCategory.constant,
        TokenType.constantNumber,
      ); // octal unsigned
      assert(
        '0123LLU ',
        0,
        5,
        TokenCategory.constant,
        TokenType.constantNumber,
      ); // octal unsigned
      assert(
        '0x12cll ',
        0,
        5,
        TokenCategory.constant,
        TokenType.constantNumber,
      ); // hex
      assert(
        '0x12cllu ',
        0,
        6,
        TokenCategory.constant,
        TokenType.constantNumber,
      ); // hex unsigned
      assert(
        '0x12cllU ',
        0,
        6,
        TokenCategory.constant,
        TokenType.constantNumber,
      ); // hex unsigned
      assert(
        '0x12CLL ',
        0,
        5,
        TokenCategory.constant,
        TokenType.constantNumber,
      ); // hex
      assert(
        '0x12CLLu ',
        0,
        6,
        TokenCategory.constant,
        TokenType.constantNumber,
      ); // hex unsigned
      assert(
        '0x12CLLU ',
        0,
        6,
        TokenCategory.constant,
        TokenType.constantNumber,
      ); // hex unsigned
    });
    describe('float', () => {
      assert('123.45,', 0, 5, TokenCategory.constant, TokenType.constantNumber);
      assert(
        ' 123.45f\n',
        1,
        7,
        TokenCategory.constant,
        TokenType.constantNumber,
      );
      assert(
        '> 123.45F)',
        2,
        8,
        TokenCategory.constant,
        TokenType.constantNumber,
      );
    });
  });

  describe('Operators', () => {
    //#region Arithmetic
    assert('++', 0, 1, TokenCategory.operator, TokenType.ambiguousIncrement);
    assert(' ++ ', 1, 2, TokenCategory.operator, TokenType.ambiguousIncrement);
    assert('++a', 0, 1, TokenCategory.operator, TokenType.ambiguousIncrement);
    assert('a++;', 1, 2, TokenCategory.operator, TokenType.ambiguousIncrement);
    assert(
      'a+++++b',
      1,
      2,
      TokenCategory.operator,
      TokenType.ambiguousIncrement,
    );
    assert(
      'a+++++b',
      3,
      4,
      TokenCategory.operator,
      TokenType.ambiguousIncrement,
    );
    assert('a+++++b', 5, 5, TokenCategory.operator, TokenType.ambiguousPlus);

    assert('--', 0, 1, TokenCategory.operator, TokenType.ambiguousDecrement);
    assert(' -- ', 1, 2, TokenCategory.operator, TokenType.ambiguousDecrement);
    assert('--a', 0, 1, TokenCategory.operator, TokenType.ambiguousDecrement);
    assert('a--;', 1, 2, TokenCategory.operator, TokenType.ambiguousDecrement);
    assert(
      'a-----b',
      1,
      2,
      TokenCategory.operator,
      TokenType.ambiguousDecrement,
    );
    assert(
      'a-----b',
      3,
      4,
      TokenCategory.operator,
      TokenType.ambiguousDecrement,
    );
    assert('a-----b', 5, 5, TokenCategory.operator, TokenType.ambiguousMinus);

    assert('a+b', 1, 1, TokenCategory.operator, TokenType.ambiguousPlus);
    assert('a+\nb', 1, 1, TokenCategory.operator, TokenType.ambiguousPlus);
    assert('a +b', 2, 2, TokenCategory.operator, TokenType.ambiguousPlus);
    assert('a +', 2, 2, TokenCategory.operator, TokenType.ambiguousPlus);

    assert('a-b', 1, 1, TokenCategory.operator, TokenType.ambiguousMinus);
    assert('a-\nb', 1, 1, TokenCategory.operator, TokenType.ambiguousMinus);
    assert('a -b', 2, 2, TokenCategory.operator, TokenType.ambiguousMinus);
    assert('a -', 2, 2, TokenCategory.operator, TokenType.ambiguousMinus);
    //#endregion Arithmetic

    //#region Logical
    assert(
      '!',
      0,
      0,
      TokenCategory.operator,
      TokenType.operatorUnaryLogicalNegation,
    );
    assert(
      '! ',
      0,
      0,
      TokenCategory.operator,
      TokenType.operatorUnaryLogicalNegation,
    );
    assert(
      '!!a',
      0,
      0,
      TokenCategory.operator,
      TokenType.operatorUnaryLogicalNegation,
    );
    assert(
      '!!a',
      1,
      1,
      TokenCategory.operator,
      TokenType.operatorUnaryLogicalNegation,
    );

    assert(
      '&&',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryLogicalAnd,
    );
    assert(
      '&& ',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryLogicalAnd,
    );
    assert(
      'a&&b',
      1,
      2,
      TokenCategory.operator,
      TokenType.operatorBinaryLogicalAnd,
    );
    assert(
      'a && 1',
      2,
      3,
      TokenCategory.operator,
      TokenType.operatorBinaryLogicalAnd,
    );

    assert(
      '||',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryLogicalOr,
    );
    assert(
      '|| ',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryLogicalOr,
    );
    assert(
      'a||b',
      1,
      2,
      TokenCategory.operator,
      TokenType.operatorBinaryLogicalOr,
    );
    assert(
      'a || 1',
      2,
      3,
      TokenCategory.operator,
      TokenType.operatorBinaryLogicalOr,
    );
    //#endregion Logical

    //#region Comparison
    assert(
      '==',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryComparisonEqualTo,
    );
    assert(
      '== ',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryComparisonEqualTo,
    );
    assert(
      '==b',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryComparisonEqualTo,
    );
    assert(
      '==1',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryComparisonEqualTo,
    );

    assert(
      '!=',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryComparisonNotEqualTo,
    );
    assert(
      '!= ',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryComparisonNotEqualTo,
    );
    assert(
      '!=b',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryComparisonNotEqualTo,
    );
    assert(
      '!=1',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryComparisonNotEqualTo,
    );

    assert(
      '>',
      0,
      0,
      TokenCategory.operator,
      TokenType.operatorBinaryComparisonGreaterThan,
    );
    assert(
      '> ',
      0,
      0,
      TokenCategory.operator,
      TokenType.operatorBinaryComparisonGreaterThan,
    );
    assert(
      '>b',
      0,
      0,
      TokenCategory.operator,
      TokenType.operatorBinaryComparisonGreaterThan,
    );
    assert(
      '>1',
      0,
      0,
      TokenCategory.operator,
      TokenType.operatorBinaryComparisonGreaterThan,
    );

    assert(
      '>=',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryComparisonGreaterThanOrEqualTo,
    );
    assert(
      '>= ',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryComparisonGreaterThanOrEqualTo,
    );
    assert(
      '>=b',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryComparisonGreaterThanOrEqualTo,
    );
    assert(
      '>=1',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryComparisonGreaterThanOrEqualTo,
    );
    //#endregion Comparison

    //#region Bitwise
    assert(
      '~a',
      0,
      0,
      TokenCategory.operator,
      TokenType.operatorUnaryBitwiseOnesComplement,
    );
    assert(
      '~ ',
      0,
      0,
      TokenCategory.operator,
      TokenType.operatorUnaryBitwiseOnesComplement,
    );
    assert(
      '~\n',
      0,
      0,
      TokenCategory.operator,
      TokenType.operatorUnaryBitwiseOnesComplement,
    );

    assert('a&b', 1, 1, TokenCategory.operator, TokenType.ambiguousAmpersand);
    assert('a&1', 1, 1, TokenCategory.operator, TokenType.ambiguousAmpersand);
    assert('a & b', 2, 2, TokenCategory.operator, TokenType.ambiguousAmpersand);
    assert(
      'a &\nb',
      2,
      2,
      TokenCategory.operator,
      TokenType.ambiguousAmpersand,
    );

    assert(
      'a|b',
      1,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryBitwiseOr,
    );
    assert(
      'a|1',
      1,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryBitwiseOr,
    );
    assert(
      'a | b',
      2,
      2,
      TokenCategory.operator,
      TokenType.operatorBinaryBitwiseOr,
    );
    assert(
      'a |\nb',
      2,
      2,
      TokenCategory.operator,
      TokenType.operatorBinaryBitwiseOr,
    );
    //#endregion Bitwise

    //#region Assignment
    assert(
      '=',
      0,
      0,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentDirect,
    );
    assert(
      '=b',
      0,
      0,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentDirect,
    );
    assert(
      '=1',
      0,
      0,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentDirect,
    );
    assert(
      '= ',
      0,
      0,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentDirect,
    );

    assert(
      '+=',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentAddition,
    );
    assert(
      '+=b',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentAddition,
    );
    assert(
      '+=1',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentAddition,
    );
    assert(
      '+= ',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentAddition,
    );

    assert(
      '-=',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentSubtraction,
    );
    assert(
      '-=b',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentSubtraction,
    );
    assert(
      '-=1',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentSubtraction,
    );
    assert(
      '-= ',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentSubtraction,
    );

    assert(
      '*=',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentMultiplication,
    );
    assert(
      '*=b',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentMultiplication,
    );
    assert(
      '*=1',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentMultiplication,
    );
    assert(
      '*= ',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentMultiplication,
    );

    assert(
      '%=',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentModulo,
    );
    assert(
      '%=b',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentModulo,
    );
    assert(
      '%=1',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentModulo,
    );
    assert(
      '%= ',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentModulo,
    );

    assert(
      '>>=',
      0,
      2,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentBitwiseShiftRight,
    );
    assert(
      '>>=b',
      0,
      2,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentBitwiseShiftRight,
    );
    assert(
      '>>=1',
      0,
      2,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentBitwiseShiftRight,
    );
    assert(
      '>>= ',
      0,
      2,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentBitwiseShiftRight,
    );

    assert(
      '&=',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentBitwiseAnd,
    );
    assert(
      '&=b',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentBitwiseAnd,
    );
    assert(
      '&=1',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentBitwiseAnd,
    );
    assert(
      '&= ',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentBitwiseAnd,
    );

    assert(
      '|=',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentBitwiseOr,
    );
    assert(
      '|=b',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentBitwiseOr,
    );
    assert(
      '|=1',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentBitwiseOr,
    );
    assert(
      '|= ',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentBitwiseOr,
    );

    assert(
      '^=',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentBitwiseXor,
    );
    assert(
      '^=b',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentBitwiseXor,
    );
    assert(
      '^=1',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentBitwiseXor,
    );
    assert(
      '^= ',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorBinaryAssignmentBitwiseXor,
    );
    //#endregion Assignment

    //#region Other
    assert('*', 0, 0, TokenCategory.operator, TokenType.ambiguousAsterisk);
    assert('**a', 0, 0, TokenCategory.operator, TokenType.ambiguousAsterisk);
    assert('**a', 1, 1, TokenCategory.operator, TokenType.ambiguousAsterisk);
    assert(
      'int *const',
      4,
      4,
      TokenCategory.operator,
      TokenType.ambiguousAsterisk,
    );
    assert(
      'int * const',
      4,
      4,
      TokenCategory.operator,
      TokenType.ambiguousAsterisk,
    );

    assert('&', 0, 0, TokenCategory.operator, TokenType.ambiguousAmpersand);
    assert('& ', 0, 0, TokenCategory.operator, TokenType.ambiguousAmpersand);
    assert('&a);', 0, 0, TokenCategory.operator, TokenType.ambiguousAmpersand);

    assert(
      '.',
      0,
      0,
      TokenCategory.operator,
      TokenType.operatorMemberSelectionDirect,
    );
    assert(
      'a.b',
      1,
      1,
      TokenCategory.operator,
      TokenType.operatorMemberSelectionDirect,
    );
    assert(
      'a. b',
      1,
      1,
      TokenCategory.operator,
      TokenType.operatorMemberSelectionDirect,
    );
    assert(
      'a.\nb',
      1,
      1,
      TokenCategory.operator,
      TokenType.operatorMemberSelectionDirect,
    );

    assert(
      '->',
      0,
      1,
      TokenCategory.operator,
      TokenType.operatorMemberSelectionIndirect,
    );
    assert(
      'a->b',
      1,
      2,
      TokenCategory.operator,
      TokenType.operatorMemberSelectionIndirect,
    );
    assert(
      'a-> b',
      1,
      2,
      TokenCategory.operator,
      TokenType.operatorMemberSelectionIndirect,
    );
    assert(
      'a->\nb',
      1,
      2,
      TokenCategory.operator,
      TokenType.operatorMemberSelectionIndirect,
    );

    assert(
      '?',
      0,
      0,
      TokenCategory.operator,
      TokenType.operatorTernaryQuestion,
    );
    assert(
      'a?b',
      1,
      1,
      TokenCategory.operator,
      TokenType.operatorTernaryQuestion,
    );
    assert(
      'a? b',
      1,
      1,
      TokenCategory.operator,
      TokenType.operatorTernaryQuestion,
    );
    assert(
      'a?\nb',
      1,
      1,
      TokenCategory.operator,
      TokenType.operatorTernaryQuestion,
    );

    assert(':', 0, 0, TokenCategory.operator, TokenType.operatorTernaryColon);
    assert(
      'a :b',
      2,
      2,
      TokenCategory.operator,
      TokenType.operatorTernaryColon,
    );
    assert(
      'a : b',
      2,
      2,
      TokenCategory.operator,
      TokenType.operatorTernaryColon,
    );
    assert(
      'a?b\n:c',
      4,
      4,
      TokenCategory.operator,
      TokenType.operatorTernaryColon,
    );
    //#endregion Other
  });
});
