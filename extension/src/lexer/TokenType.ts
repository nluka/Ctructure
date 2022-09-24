enum TokenType {
  //#region Preprocessor (https://www.tutorialspoint.com/cprogramming/c_preprocessors.htm)
    preproDirective,
    // Macros
      preproMacroFile,
      preproMacroLine,
      preproMacroDate,
      preproMacroTime,
      preproMacroTimestamp,
  //#endregion Preprocessor

  //#region Keywords (https://en.cppreference.com/w/c/keyword)
    // Types
      keywordBool,
      keywordChar,
      keywordDouble,
      keywordEnum,
      keywordFloat,
      keywordInt,
      keywordLong,
      keywordShort,
      keywordSigned,
      keywordStatic,
      keywordStruct,
      keywordUnion,
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
      keywordExtern,
      keywordFor,
      keywordGeneric,
      keywordGoto,
      keywordIf,
      keywordInline,
      keywordImaginary,
      keywordNoreturn,
      keywordRegister,
      keywordReturn,
      keywordSizeof,
      keywordStaticassert,
      keywordSwitch,
      keywordThreadlocal,
      keywordTypedef,
      keywordWhile,
  //#endregion Keywords

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
        operatorUnaryIndirectionOrDereference,
    // Binary
      // Arithmetic
        operatorBinaryArithmeticAddition,
        operatorBinaryArithmeticSubtraction,
        operatorBinaryArithmeticMultiplication,
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
        operatorMemberSelectionDirect, // Dot (.)
        operatorMemberSelectionIndirect, // Arrow (->)
        // operatorBinaryMultiplicationOrIndirection,
    // Other
      operatorTernaryQuestion,
      operatorTernaryColon,
      operatorEllipses,
  //#endregion Operators

  //#region Special
    specialComma,
    specialSemicolon,
    specialColonSwitchOrLabelOrBitField,
    speicalLineContinuation,
    // Opening
      specialParenthesisOpening,  // (
      specialBraceOpening,        // {
      specialBracketOpening,      // [
    // Closing
      specialParenthesisClosing,  // )
      specialBraceClosing,        // }
      specialBracketClosing,      // ]
  //#endregion Special

  //#region Other
    identifier,
    commentDirectiveNoFormatSingleLine,
    commentDirectiveNoFormatMultiLine,
    commentSingleLine,
    commentMultiLine,
    newline,
  //#endregion Other

  //#region Ambiguous
    /*
      These are for cases where 2 or more operators share the exact same symbol.
      During the inital tokenization, these overlapping operators are assigned
      one of the following types. They are disambiguated in a later pass.
    */
    ambiguousPlus, // (binary addition | unary plus aka integer promotion) ?
    ambiguousMinus, // (binary subtraction | unary minus) ?
    ambiguousIncrement, // (prefix | postfix) ?
    ambiguousDecrement, // (prefix | postfix) ?
    ambiguousAsterisk, // (binary multiplication | indirection) ?
    ambiguousAmpersand, // (bitwise and | address of) ?
    ambiguousColon, // (switch case/default | ternary | label | bit field) ?
  //#endregion Ambiguous
} export default TokenType;

export function isTokenKeyword(type: TokenType) {
  return type >= TokenType.keywordBool &&
    type <= TokenType.keywordVoid;
}
export function isTokenKeywordTypeQualifier(type: TokenType) {
  return type >= TokenType.keywordAtomic &&
    type <= TokenType.keywordVolatile;
}
export function isTokenKeywordTypeOrTypeQualifier(type: TokenType) {
  return type >= TokenType.keywordBool &&
    type <= TokenType.keywordVolatile;
}

export function isTokenConstant(type: TokenType) {
  return type >= TokenType.constantNumber &&
    type <= TokenType.constantString;
}

export function isTokenUnaryOperator(type: TokenType) {
  return type >= TokenType.operatorUnaryArithmeticIncrementPrefix &&
    type <= TokenType.operatorUnaryIndirectionOrDereference;
}
export function isTokenPostfixIncrOrDecrOperator(type: TokenType) {
  return type === TokenType.operatorUnaryArithmeticIncrementPostfix ||
    type <= TokenType.operatorUnaryArithmeticDecrementPostfix;
}

export function isTokenBinaryOperator(type: TokenType) {
  return type >= TokenType.operatorBinaryArithmeticAddition &&
    type <= TokenType.operatorMemberSelectionIndirect;
}
export function isTokenBinaryOperatorAssignment(type: TokenType) {
  return type >= TokenType.operatorBinaryAssignmentDirect &&
    type <= TokenType.operatorBinaryAssignmentBitwiseXor;
}
export function isTokenBinaryOperatorArithmetic(type: TokenType) {
  return type >= TokenType.operatorBinaryArithmeticAddition &&
    type <= TokenType.operatorMemberSelectionIndirect;
}
export function isTokenBinaryOperatorNonAssignment(type: TokenType) {
  return type >= TokenType.operatorBinaryArithmeticAddition &&
    type <= TokenType.operatorBinaryBitwiseShiftRight;
}
export function isTokenBinaryOperatorMemberSelection(type: TokenType) {
  return type >= TokenType.operatorMemberSelectionDirect &&
    type <= TokenType.operatorMemberSelectionIndirect;
}
// export function isTokenBinaryNonMultiplicationOrIndirectionOperator(type: TokenType) {
//   return type >= TokenType.operatorBinaryArithmeticAddition &&
//     type <= TokenType.operatorBinaryAssignmentBitwiseXor;
// }

export function isTokenTernaryOperatorComponent(type: TokenType) {
  return type === TokenType.operatorTernaryQuestion ||
    type === TokenType.operatorTernaryColon;
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
  return type >= TokenType.ambiguousPlus;
}
