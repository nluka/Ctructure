enum TokenType {
  //#region Preprocessor (https://www.tutorialspoint.com/cprogramming/c_preprocessors.htm)
  // Directives
    preproDirectiveInclude,
    preproDirectiveDefine,
    preproDirectiveUndef,
    preproDirectiveIfdef,
    preproDirectiveIfndef,
    preproDirectiveIf,
    preproDirectiveElse,
    preproDirectiveElif,
    preproDirectiveEndif,
    preproDirectiveError,
    preproDirectivePragma,
  // Macros
    preproMacroFile,
    preproMacroLine,
    preproMacroDate,
    preproMacroTime,
    preproMacroTimestamp,
  // Other
    preproStandardHeader, // e.g. <stdio.h>
    preproOperatorConcat,
    preproLineContinuation,
  //#endregion Preprocessor

  //#region Keywords (https://en.cppreference.com/w/c/keyword)
    // Types
      keywordBool,
      keywordChar,
      keywordDouble,
      keywordFloat,
      keywordInt,
      keywordLong,
      keywordShort,
      keywordSigned,
      keywordStatic,
      keywordUnsigned,
      keywordVoid,
      // Qualifiers
        keywordAtomic,
        keywordConst,
        keywordRestrict,
        keywordVolatile,
    // Other
      keywordAlignas,
      keywordAlignof,
      keywordAuto,
      keywordBreak,
      keywordCase,
      keywordComplex,
      keywordContinue,
      keywordDefault,
      keywordDo,
      keywordElse,
      keywordEnum,
      keywordExtern,
      keywordFor,
      keywordGeneric,
      keywordGoto,
      keywordIf,
      keywordImaginary,
      keywordNoreturn,
      keywordRegister,
      keywordReturn,
      keywordSizeof,
      keywordStaticassert,
      keywordStruct,
      keywordSwitch,
      keywordThreadlocal,
      keywordTypedef,
      keywordUnion,
      keywordWhile,
  //#endregion // Keywords

  //#region Constants
    constantNumber,
    constantCharacter,
    constantString,
  //#endregion Constants

  //#region Operators (https://en.wikipedia.org/wiki/Operators_in_C_and_C%2B%2B)
  // Unary
    // Arithmetic
      operatorUnaryArithmeticIncrementPrefix,
      operatorUnaryArithmeticIncrementPostfix,
      operatorUnaryArithmeticDecrementPrefix,
      operatorUnaryArithmeticDecrementPostfix,
      operatorUnaryBitwiseOnesComplement,
    // Logical
      operatorUnaryLogicalNegation,
    // Other
      operatorUnaryPlus,
      operatorUnaryMinus,
      operatorUnaryIndirection,
      operatorUnaryDereference,
      operatorUnaryAddressOf,
  // Binary
    // Arithmetic
      operatorBinaryArithmeticAddition,
      operatorBinaryArithmeticSubtraction,
      operatorBinaryArithmeticDivision,
      operatorBinaryArithmeticMultiplication,
      operatorBinaryArithmeticModulo,
    // Comparison
      operatorBinaryComparisonEqualTo,
      operatorBinaryComparisonNotEqualTo,
      operatorBinaryComparisonGreaterThan,
      operatorBinaryComparisonGreaterThanOrEqualTo,
      operatorBinaryComparisonLessThan,
      operatorBinaryComparisonLessThanOrEqualTo,
    // Logical
      operatorBinaryLogicalAnd,
      operatorBinaryLogicalOr,
    // Bitwise
      operatorBinaryBitwiseAnd,
      operatorBinaryBitwiseOr,
      operatorBinaryBitwiseXor,
      operatorBinaryBitwiseShiftLeft,
      operatorBinaryBitwiseShiftRight,
    // Assignment
      operatorBinaryAssignmentDirect,
      operatorBinaryAssignmentAddition,
      operatorBinaryAssignmentSubtraction,
      operatorBinaryAssignmentMultiplication,
      operatorBinaryAssignmentDivision,
      operatorBinaryAssignmentModulo,
      operatorBinaryAssignmentBitwiseShiftLeft,
      operatorBinaryAssignmentBitwiseShiftRight,
      operatorBinaryAssignmentBitwiseAnd,
      operatorBinaryAssignmentBitwiseOr,
      operatorBinaryAssignmentBitwiseXor,
  // Other
    operatorMemberSelectionDirect, // Dot (.) https://www.geeksforgeeks.org/dot-operator-in-c-c/
    operatorMemberSelectionIndirect, // Arrow (->) https://www.geeksforgeeks.org/arrow-operator-in-c-c-with-examples/
    operatorTernaryQuestion,
    operatorTernaryColon,
  //#endregion Operators

  //#region Special
    // Parenthesis ()
      specialParenthesisLeft,
      specialParenthesisRight,
    // Braces {}
      specialBraceLeft,
      specialBraceRight,
    // Brackets []
      specialBracketLeft,
      specialBracketRight,
    // Other
      specialComma,
      specialSemicolon,
  //#endregion Special

  //#region Other
    identifier,
    label,
    commentSingleline,
    commentMultiline,
    newline,
  //#endregion Other

  //#region Ambiguous
  /*
    These are for cases where 2 or more operators share the exact same symbol.
    During the inital tokenization, these overlapping operators are assigned
    one of the following types. They are disambiguated in a later pass.
  */
  ambiguousPlus, // (binary addition | unary plus) ?
  ambiguousMinus, // (binary subtraction | unary minus) ?
  ambiguousIncrement, // (prefix | postfix) ?
  ambiguousDecrement, // (prefix | postfix) ?
  ambiguousAsterisk, // (binary multiplication | indirection | dereference) ?
  ambiguousAmpersand, // (bitwise and | address of) ?
  //#endregion Ambiguous
}

export function isTokenAmbiguous(type: TokenType) {
  return type >= TokenType.ambiguousPlus && type <= TokenType.ambiguousAmpersand;
}

export function isTokenConstant(type: TokenType) {
  return type >= TokenType.constantNumber && type <= TokenType.constantString;
}

export function isTokenTypeKeyword(type: TokenType) {
  return type >= TokenType.keywordBool && type <= TokenType.keywordVoid;
}

export function isTokenTypeQualifierKeyword(type: TokenType) {
  return type >= TokenType.keywordAtomic && type <= TokenType.keywordVolatile;
}

export function isTokenTypeOrTypeQualifierKeyword(type: TokenType) {
  return type >= TokenType.keywordBool && type <= TokenType.keywordVolatile;
}

export default TokenType;
