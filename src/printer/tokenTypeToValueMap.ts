import TokenType from '../lexer/TokenType';

const tokenTypeToValueMap = new Map<TokenType, string>([
  //#region Preprocessor
    [TokenType.preproHash, '#'],
      // Macros
      [TokenType.preproMacroFile, '__FILE__'],
      [TokenType.preproMacroLine, '__LINE__'],
      [TokenType.preproMacroDate, '__DATE__'],
      [TokenType.preproMacroTime, '__TIME__'],
      [TokenType.preproMacroTimestamp, '__TIMESTAMP__'],
  //#endregion Preprocessor

  //#region Keywords
    // Types
      [TokenType.keywordBool, 'bool'],
      [TokenType.keywordChar, 'char'],
      [TokenType.keywordDouble, 'double'],
      [TokenType.keywordFloat, 'float'],
      [TokenType.keywordInt, 'int'],
      [TokenType.keywordLong, 'long'],
      [TokenType.keywordShort, 'short'],
      [TokenType.keywordSigned, 'signed'],
      [TokenType.keywordStatic, 'static '],
      [TokenType.keywordUnsigned, 'unsigned '],
      [TokenType.keywordVoid, 'void'],
      // Qualifiers
        [TokenType.keywordAtomic, '_Atomic '],
        [TokenType.keywordConst, 'const '],
        [TokenType.keywordRestrict, 'restrict '],
        [TokenType.keywordVolatile, 'volatile '],
    // Other
      [TokenType.keywordAlignas, 'alignas '],
      [TokenType.keywordAlignof, 'alignof '],
      [TokenType.keywordAuto, 'auto '],
      [TokenType.keywordBreak, 'break'],
      [TokenType.keywordCase, 'case '],
      [TokenType.keywordComplex, 'complex '],
      [TokenType.keywordContinue, 'continue'],
      [TokenType.keywordDefault, 'default'],
      [TokenType.keywordDo, 'do'],
      [TokenType.keywordElse, 'else'],
      [TokenType.keywordEnum, 'enum '],
      [TokenType.keywordExtern, 'extern '],
      [TokenType.keywordFor, 'for '],
      [TokenType.keywordGeneric, 'generic '],
      [TokenType.keywordGoto, 'goto '],
      [TokenType.keywordIf, 'if '],
      [TokenType.keywordImaginary, 'imaginary'],
      [TokenType.keywordNoreturn, 'noreturn'],
      [TokenType.keywordRegister, 'register'],
      [TokenType.keywordReturn, 'return'],
      [TokenType.keywordSizeof, 'sizeof '],
      [TokenType.keywordStaticassert, 'static_assert'],
      [TokenType.keywordStruct, 'struct '],
      [TokenType.keywordSwitch, 'switch '],
      [TokenType.keywordThreadlocal, 'thread_local'],
      [TokenType.keywordTypedef, 'typedef '],
      [TokenType.keywordUnion, 'union '],
      [TokenType.keywordWhile, 'while '],
  //#endregion Keywords

  //#region Constants
    [TokenType.constantNumber, ''],
    [TokenType.constantCharacter, ''],
    [TokenType.constantString, ''],
  //#endregion Constants

  //#region Operators
    // Unary
      // Arithmetic
        [TokenType.operatorUnaryArithmeticIncrementPrefix, '++'],
        [TokenType.operatorUnaryArithmeticIncrementPostfix, '++'],
        [TokenType.operatorUnaryArithmeticDecrementPrefix, '--'],
        [TokenType.operatorUnaryArithmeticDecrementPostfix, '--'],
        [TokenType.operatorUnaryBitwiseOnesComplement, '~'],
      // Logical
        [TokenType.operatorUnaryLogicalNegation, '!'],
      // Other
        [TokenType.operatorUnaryPlus, '+'],
        [TokenType.operatorUnaryMinus, '-'],
        [TokenType.operatorUnaryAddressOf, '&'],
        [TokenType.operatorUnaryDereference, '*'],
    // Binary
      // Arithmetic
        [TokenType.operatorBinaryArithmeticAddition, ' + '],
        [TokenType.operatorBinaryArithmeticSubtraction, ' - '],
        [TokenType.operatorBinaryArithmeticDivision, ' / '],
        [TokenType.operatorBinaryArithmeticModulo, ' % '],
      // Comparison
        [TokenType.operatorBinaryComparisonEqualTo, ' == '],
        [TokenType.operatorBinaryComparisonNotEqualTo, ' != '],
        [TokenType.operatorBinaryComparisonGreaterThan, ' > '],
        [TokenType.operatorBinaryComparisonGreaterThanOrEqualTo, ' >= '],
        [TokenType.operatorBinaryComparisonLessThan, ' < '],
        [TokenType.operatorBinaryComparisonLessThanOrEqualTo, ' <= '],
        [TokenType.operatorBinaryLogicalAnd, ' &&'],
        [TokenType.operatorBinaryLogicalOr, ' ||'],
        [TokenType.operatorBinaryBitwiseAnd, ' & '],
        [TokenType.operatorBinaryBitwiseOr, ' | '],
        [TokenType.operatorBinaryBitwiseXor, ' ^ '],
        [TokenType.operatorBinaryBitwiseShiftLeft, ' << '],
        [TokenType.operatorBinaryBitwiseShiftRight, ' >> '],
      // Assignment
        [TokenType.operatorBinaryAssignmentDirect, ' = '],
        [TokenType.operatorBinaryAssignmentAddition, ' += '],
        [TokenType.operatorBinaryAssignmentSubtraction, ' -= '],
        [TokenType.operatorBinaryAssignmentMultiplication, ' *= '],
        [TokenType.operatorBinaryAssignmentDivision, ' /= '],
        [TokenType.operatorBinaryAssignmentModulo, ' %= '],
        [TokenType.operatorBinaryAssignmentBitwiseShiftLeft, ' <<= '],
        [TokenType.operatorBinaryAssignmentBitwiseShiftRight, ' >>= '],
        [TokenType.operatorBinaryAssignmentBitwiseAnd, ' &= '],
        [TokenType.operatorBinaryAssignmentBitwiseOr, ' |= '],
        [TokenType.operatorBinaryAssignmentBitwiseXor, ' ^= '],
      // Misc
        [TokenType.operatorBinaryMultiplicationOrIndirection, '*'],
    // Other
      [TokenType.operatorMemberSelectionDirect, '.'],
      [TokenType.operatorMemberSelectionIndirect, '->'],
      [TokenType.operatorTernaryQuestion, ' ? '],
      [TokenType.operatorTernaryColon, ' : '],
      [TokenType.operatorEllipses, '...'],
  //#endregion Operators

  //#region Special
    [TokenType.specialComma, ','],
    [TokenType.specialSemicolon, ';'],
    [TokenType.specialColonSwitchOrLabelOrBitField, ':'],
    [TokenType.speicalLineContinuation, ' \\'],
    // Opening
      [TokenType.specialParenthesisOpening, '('],
      [TokenType.specialBraceOpening, '{'],
      [TokenType.specialBracketOpening, '['],
    // Closing
      [TokenType.specialParenthesisClosing, ')'],
      [TokenType.specialBraceClosing, '}'],
      [TokenType.specialBracketClosing, ']'],
  //#endregion Special

  //#region Other
    [TokenType.identifier, ''],
    [TokenType.commentDirectiveNoFormatSingleLine, ''],
    [TokenType.commentDirectiveNoFormatMultiLine, ''],
    [TokenType.commentSingleLine, ''],
    [TokenType.commentMultiLine, ''],
    [TokenType.newline, ''],
  //#endregion Other

  //#region Ambiguous
    [TokenType.ambiguousPlus, ' + '],
    [TokenType.ambiguousMinus, ' - '],
    [TokenType.ambiguousIncrement, '++'],
    [TokenType.ambiguousDecrement, '--'],
    [TokenType.ambiguousAsterisk, '*'],
    [TokenType.ambiguousAmpersand, '&'],
  //#endregion Ambiguous
]);

export default tokenTypeToValueMap;
