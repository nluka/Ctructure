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
      operatorUnaryAddressOf,
      operatorUnaryDereference,
  // Binary
    // Arithmetic
      operatorBinaryArithmeticAddition,
      operatorBinaryArithmeticSubtraction,
      operatorBinaryArithmeticDivision,
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
    // Misc
      operatorBinaryMultiplicationOrIndirection,
  // Other
    operatorMemberSelectionDirect, // Dot (.) https://www.geeksforgeeks.org/dot-operator-in-c-c/
    operatorMemberSelectionIndirect, // Arrow (->) https://www.geeksforgeeks.org/arrow-operator-in-c-c-with-examples/
    operatorTernaryQuestion,
  //#endregion Operators

  //#region Special
    specialComma,
    specialSemicolon,
    // Opening
      specialParenthesisOpening,
      specialBraceOpening,
      specialBracketOpening,
    // Closing
      specialParenthesisClosing,
      specialBraceClosing,
      specialBracketClosing,
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
    ambiguousAsterisk, // (binary multiplication | indirection) ?
    ambiguousAmpersand, // (bitwise and | address of) ?
    ambiguousColon, // (switch case/default | ternary)
  //#endregion Ambiguous
}

export function isTokenPreprocessor(type: TokenType) {
  return type >= TokenType.preproDirectiveInclude &&
    type <= TokenType.preproLineContinuation;
}

export function isTokenTypeKeyword(type: TokenType) {
  return type >= TokenType.keywordBool &&
    type <= TokenType.keywordVoid;
}

export function isTokenTypeQualifierKeyword(type: TokenType) {
  return type >= TokenType.keywordAtomic &&
    type <= TokenType.keywordVolatile;
}

export function isTokenTypeOrTypeQualifierKeyword(type: TokenType) {
  return type >= TokenType.keywordBool &&
    type <= TokenType.keywordVolatile;
}

export function isTokenConstant(type: TokenType) {
  return type >= TokenType.constantNumber &&
    type <= TokenType.constantString;
}

export function isTokenBinaryOperator(type: TokenType) {
  return type >= TokenType.operatorBinaryArithmeticAddition &&
    type <= TokenType.operatorBinaryMultiplicationOrIndirection;
}

export function isTokenNonMultiplicationOrIndirectionBinaryOperator(type: TokenType) {
  return type >= TokenType.operatorBinaryArithmeticAddition &&
    type <= TokenType.operatorBinaryAssignmentBitwiseXor;
}

export function isTokenAssignmentOperator(type: TokenType) {
  return type >= TokenType.operatorBinaryAssignmentDirect &&
    type <= TokenType.operatorBinaryAssignmentBitwiseXor;
}

export function isTokenMemberSelectionOperator(type: TokenType) {
  return type >= TokenType.operatorMemberSelectionDirect &&
    type <= TokenType.operatorMemberSelectionIndirect;
}

export function isTokenTernaryOperatorComponent(type: TokenType) {
  return type === TokenType.operatorTernaryQuestion ||
    type === TokenType.ambiguousColon;
}

export function isTokenSpecial(type: TokenType) {
  return type >= TokenType.specialParenthesisOpening &&
    type <= TokenType.specialSemicolon;
}

export function isTokenSpecialNonClosing(type: TokenType) {
  return type >= TokenType.specialComma &&
    type <= TokenType.specialBracketOpening;
}

export function isTokenAmbiguous(type: TokenType) {
  return type >= TokenType.ambiguousPlus && type <= TokenType.ambiguousAmpersand;
}

export default TokenType;
