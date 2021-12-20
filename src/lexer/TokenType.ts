enum TokenType {
  //#region Preprocessor (https://www.cprogramming.com/reference/preprocessor/)
  // Directives
    preproDirectiveInclude,
    preproDirectiveDefine,
    preproDirectiveContinuation,
    preproDirectiveUndef,
    preproDirectiveIf,
    preproDirectiveIfdef,
    preproDirectiveIfndef,
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
  //#endregion Preprocessor

  //#region Keywords (https://en.cppreference.com/w/c/keyword)
  keywordAlignas,
  keywordAlignof,
  keywordAuto,
  keywordAtomic,
  keywordBool,
  keywordBreak,
  keywordCase,
  keywordChar,
  keywordComplex,
  keywordConst,
  keywordContinue,
  keywordDefault,
  keywordDo,
  keywordDouble,
  keywordElse,
  keywordEnum,
  keywordExtern,
  keywordFloat,
  keywordFor,
  keywordGeneric,
  keywordGoto,
  keywordIf,
  keywordImaginary,
  keywordInt,
  keywordLong,
  keywordNoreturn,
  keywordRegister,
  keywordReturn,
  keywordShort,
  keywordSigned,
  keywordSizeof,
  keywordStatic,
  keywordStaticassert,
  keywordStruct,
  keywordSwitch,
  keywordThreadlocal,
  keywordTypedef,
  keywordUnion,
  keywordUnsigned,
  keywordVoid,
  keywordVolatile,
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
      operatorUnaryOnesComplement,
    // Logical
      operatorUnaryLogicalNegation,
    // Other
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
  //#endregion Other

  //#region Ambiguous
  /*
    These are for cases where 2 or more operators share the exact same symbol.
    During the inital tokenization, these overlapping operators are assigned
    one of the following types.
    They are disambiguated in a later pass.
  */
  ambiguousPlus, // (binary addition | unary plus) ?
  ambiguousMinus, // (binary subtraction | unary minus) ?
  ambiguousIncrement, // (prefix | postfix) ?
  ambiguousDecrement, // (prefix | postfix) ?
  ambiguousAsterisk, // (binary multiplication | indirection | dereference) ?
  ambiguousAmpersand, // (bitwise and | address of) ?
  //#endregion Ambiguous
}

export default TokenType;
