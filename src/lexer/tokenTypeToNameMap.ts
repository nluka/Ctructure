import TokenType from './TokenType';

// For better test outputs
const tokenTypeToNameMap = new Map<TokenType, string>([
  //#region Preprocessor
    [TokenType.preproDirective, 'preproDirective'],
    // Macros
      [TokenType.preproMacroFile, 'preproMacroFile'],
      [TokenType.preproMacroLine, 'preproMacroLine'],
      [TokenType.preproMacroDate, 'preproMacroDate'],
      [TokenType.preproMacroTime, 'preproMacroTime'],
      [TokenType.preproMacroTimestamp, 'preproMacroTimestamp'],
  //#endregion Preprocessor

  //#region Keywords
    // Types
      [TokenType.keywordBool, 'keywordBool'],
      [TokenType.keywordChar, 'keywordChar'],
      [TokenType.keywordDouble, 'keywordDouble'],
      [TokenType.keywordFloat, 'keywordFloat'],
      [TokenType.keywordInt, 'keywordInt'],
      [TokenType.keywordLong, 'keywordLong'],
      [TokenType.keywordShort, 'keywordShort'],
      [TokenType.keywordSigned, 'keywordSigned'],
      [TokenType.keywordStatic, 'keywordStatic'],
      [TokenType.keywordUnsigned, 'keywordUnsigned'],
      [TokenType.keywordVoid, 'keywordVoid'],
      // Qualifiers
        [TokenType.keywordAtomic, 'keywordAtomic'],
        [TokenType.keywordConst, 'keywordConst'],
        [TokenType.keywordRestrict, 'keywordRestrict'],
        [TokenType.keywordVolatile, 'keywordVolatile'],
    // Other
      [TokenType.keywordAlignas, 'keywordAlignas'],
      [TokenType.keywordAlignof, 'keywordAlignof'],
      [TokenType.keywordAuto, 'keywordAuto'],
      [TokenType.keywordBreak, 'keywordBreak'],
      [TokenType.keywordCase, 'keywordCase'],
      [TokenType.keywordComplex, 'keywordComplex'],
      [TokenType.keywordContinue, 'keywordContinue'],
      [TokenType.keywordDefault, 'keywordDefault'],
      [TokenType.keywordDo, 'keywordDo'],
      [TokenType.keywordElse, 'keywordElse'],
      [TokenType.keywordEnum, 'keywordEnum'],
      [TokenType.keywordExtern, 'keywordExtern'],
      [TokenType.keywordFor, 'keywordFor'],
      [TokenType.keywordGeneric, 'keywordGeneric'],
      [TokenType.keywordGoto, 'keywordGoto'],
      [TokenType.keywordIf, 'keywordIf'],
      [TokenType.keywordInline, 'keywordInline'],
      [TokenType.keywordImaginary, 'keywordImaginary'],
      [TokenType.keywordNoreturn, 'keywordNoreturn'],
      [TokenType.keywordRegister, 'keywordRegister'],
      [TokenType.keywordReturn, 'keywordReturn'],
      [TokenType.keywordSizeof, 'keywordSizeof'],
      [TokenType.keywordStaticassert, 'keywordStaticassert'],
      [TokenType.keywordStruct, 'keywordStruct'],
      [TokenType.keywordSwitch, 'keywordSwitch'],
      [TokenType.keywordThreadlocal, 'keywordThreadlocal'],
      [TokenType.keywordTypedef, 'keywordTypedef'],
      [TokenType.keywordUnion, 'keywordUnion'],
      [TokenType.keywordWhile, 'keywordWhile'],
  //#endregion Keywords

  //#region Constants
    [TokenType.constantNumber, 'constantNumber'],
    [TokenType.constantCharacter, 'constantCharacter'],
    [TokenType.constantString, 'constantString'],
  //#endregion Constants

  //#region Operators
    // Unary
      // Arithmetic
        [TokenType.operatorUnaryArithmeticIncrementPrefix, 'operatorUnaryArithmeticIncrementPrefix'],
        [TokenType.operatorUnaryArithmeticIncrementPostfix, 'operatorUnaryArithmeticIncrementPostfix'],
        [TokenType.operatorUnaryArithmeticDecrementPrefix, 'operatorUnaryArithmeticDecrementPrefix'],
        [TokenType.operatorUnaryArithmeticDecrementPostfix, 'operatorUnaryArithmeticDecrementPostfix'],
        [TokenType.operatorUnaryBitwiseOnesComplement, 'operatorUnaryBitwiseOnesComplement'],
      // Logical
        [TokenType.operatorUnaryLogicalNegation, 'operatorUnaryLogicalNegation'],
      // Other
        [TokenType.operatorUnaryPlus, 'operatorUnaryPlus'],
        [TokenType.operatorUnaryMinus, 'operatorUnaryMinus'],
        [TokenType.operatorUnaryAddressOf, 'operatorUnaryAddressOf'],
        [TokenType.operatorUnaryIndirectionOrDereference, 'operatorUnaryIndirectionOrDereference'],
    // Binary
      // Arithmetic
        [TokenType.operatorBinaryArithmeticAddition, 'operatorBinaryArithmeticAddition'],
        [TokenType.operatorBinaryArithmeticSubtraction, 'operatorBinaryArithmeticSubtraction'],
        [TokenType.operatorBinaryArithmeticMultiplication, 'operatorBinaryArithmeticMultiplication'],
        [TokenType.operatorBinaryArithmeticDivision, 'operatorBinaryArithmeticDivision'],
        [TokenType.operatorBinaryArithmeticModulo, 'operatorBinaryArithmeticModulo'],
      // Comparison
        [TokenType.operatorBinaryComparisonEqualTo, 'operatorBinaryComparisonEqualTo'],
        [TokenType.operatorBinaryComparisonNotEqualTo, 'operatorBinaryComparisonNotEqualTo'],
        [TokenType.operatorBinaryComparisonGreaterThan, 'operatorBinaryComparisonGreaterThan'],
        [TokenType.operatorBinaryComparisonGreaterThanOrEqualTo, 'operatorBinaryComparisonGreaterThanOrEqualTo'],
        [TokenType.operatorBinaryComparisonLessThan, 'operatorBinaryComparisonLessThan'],
        [TokenType.operatorBinaryComparisonLessThanOrEqualTo, 'operatorBinaryComparisonLessThanOrEqualTo'],
      // Logical
        [TokenType.operatorBinaryLogicalAnd, 'operatorBinaryLogicalAnd'],
        [TokenType.operatorBinaryLogicalOr, 'operatorBinaryLogicalOr'],
      // Bitwise
        [TokenType.operatorBinaryBitwiseAnd, 'operatorBinaryBitwiseAnd'],
        [TokenType.operatorBinaryBitwiseOr, 'operatorBinaryBitwiseOr'],
        [TokenType.operatorBinaryBitwiseXor, 'operatorBinaryBitwiseXor'],
        [TokenType.operatorBinaryBitwiseShiftLeft, 'operatorBinaryBitwiseShiftLeft'],
        [TokenType.operatorBinaryBitwiseShiftRight, 'operatorBinaryBitwiseShiftRight'],
      // Assignment
        [TokenType.operatorBinaryAssignmentDirect, 'operatorBinaryAssignmentDirect'],
        [TokenType.operatorBinaryAssignmentAddition, 'operatorBinaryAssignmentAddition'],
        [TokenType.operatorBinaryAssignmentSubtraction, 'operatorBinaryAssignmentSubtraction'],
        [TokenType.operatorBinaryAssignmentMultiplication, 'operatorBinaryAssignmentMultiplication'],
        [TokenType.operatorBinaryAssignmentDivision, 'operatorBinaryAssignmentDivision'],
        [TokenType.operatorBinaryAssignmentModulo, 'operatorBinaryAssignmentModulo'],
        [TokenType.operatorBinaryAssignmentBitwiseShiftLeft, 'operatorBinaryAssignmentBitwiseShiftLeft'],
        [TokenType.operatorBinaryAssignmentBitwiseShiftRight, 'operatorBinaryAssignmentBitwiseShiftRight'],
        [TokenType.operatorBinaryAssignmentBitwiseAnd, 'operatorBinaryAssignmentBitwiseAnd'],
        [TokenType.operatorBinaryAssignmentBitwiseOr, 'operatorBinaryAssignmentBitwiseOr'],
        [TokenType.operatorBinaryAssignmentBitwiseXor, 'operatorBinaryAssignmentBitwiseXor'],
      // Misc
        [TokenType.operatorMemberSelectionDirect, 'operatorMemberSelectionDirect'],
        [TokenType.operatorMemberSelectionIndirect, 'operatorMemberSelectionIndirect'],
    // Other
      [TokenType.operatorTernaryQuestion, 'operatorTernaryQuestion'],
      [TokenType.operatorTernaryColon, 'operatorTernaryColon'],
      [TokenType.operatorEllipses, 'operatorEllipses'],
  //#endregion Operators

  //#region Special
    [TokenType.specialComma, 'specialComma'],
    [TokenType.specialSemicolon, 'specialSemicolon'],
    [TokenType.specialColonSwitchOrLabelOrBitField, 'specialColonSwitchOrLabelOrBitField'],
    // Opening
      [TokenType.specialParenthesisOpening, 'specialParenthesisOpening'],
      [TokenType.specialBraceOpening, 'specialBraceOpening'],
      [TokenType.specialBracketOpening, 'specialBracketOpening'],
    // Closing
      [TokenType.specialParenthesisClosing, 'specialParenthesisClosing'],
      [TokenType.specialBraceClosing, 'specialBraceClosing'],
      [TokenType.specialBracketClosing, 'specialBracketClosing'],
  //#endregion Special

  //#region Other
    [TokenType.identifier, 'identifier'],
    [TokenType.commentDirectiveNoFormatSingleLine, 'commentNoFormatLine'],
    [TokenType.commentDirectiveNoFormatMultiLine, 'commentNoFormatBlock'],
    [TokenType.commentSingleLine, 'commentSingleline'],
    [TokenType.commentMultiLine, 'commentMultiline'],
    [TokenType.newline, 'newline'],
  //#endregion Other

  //#region Ambiguous
    [TokenType.ambiguousPlus, 'ambiguousPlus'],
    [TokenType.ambiguousMinus, 'ambiguousMinus'],
    [TokenType.ambiguousIncrement, 'ambiguousIncrement'],
    [TokenType.ambiguousDecrement, 'ambiguousDecrement'],
    [TokenType.ambiguousAsterisk, 'ambiguousAsterisk'],
    [TokenType.ambiguousAmpersand, 'ambiguousAmpersand'],
    [TokenType.ambiguousColon, 'ambiguousColon'],
  //#endregion Ambiguous
]);

export default tokenTypeToNameMap;
