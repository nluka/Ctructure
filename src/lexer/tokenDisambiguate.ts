import tokenDetermineLineAndNum from './tokenDetermineLineAndNum';
import TokenSet from './TokenSet';
import TokenType, {
  isTokenBinaryOperator,
  isTokenBinaryOperatorAssignment,
  isTokenBinaryOperatorNonAssignment,
  isTokenKeyword,
  isTokenKeywordTypeOrTypeQualifier,
  isTokenKeywordTypeQualifier,
  isTokenPostfixIncrOrDecrOperator,
  isTokenSpecialNonClosing,
  isTokenTernaryOperatorComponent,
  isTokenUnaryOperator,
} from './TokenType';
import tokenTypeToNameMap from './tokenTypeToNameMap';

const tokTypesNewlineAndComments: TokenType[] = [
  TokenType.newline,
  TokenType.commentSingleLine,
  TokenType.commentMultiLine,
];

/**
 * @param ambigTokIndex The index of the ambiguous token in `tokens`.
 * @param tokSet The set of tokens extracted from `fileContents`.
 * @param fileContents The contents of the file.
 * @returns The disambiguated type of the ambiguous token. Throws an error if
 * disambiguation is not possible (when syntax/semantics are wrong).
 */
export default function tokenDisambiguate(
  ambigTokIndex: number,
  tokSet: TokenSet,
  fileContents: string,
): TokenType {
  const currTokType = tokSet.getTokenType(ambigTokIndex);

  const createErr = () => {
    const { lineNum, tokenNum } = tokenDetermineLineAndNum(
      fileContents,
      tokSet.getTokenStartPosition(ambigTokIndex),
    );
    return new Error(
      `${tokenTypeToNameMap.get(
        tokSet.getTokenType(ambigTokIndex),
      )} at line ${lineNum} tokenNum ${tokenNum}`,
    );
  };

  if (currTokType === TokenType.ambiguousColon) {
    return disambiguateColon(ambigTokIndex, tokSet, () => createErr());
  }

  const [
    firstNonNewlineOrCommentTokBehindType,
    firstNonNewlineOrCommentTokBehindIndex,
  ] = TokenSet.findFirstTypeMatchBehind(
    tokSet,
    ambigTokIndex - 1,
    tokTypesNewlineAndComments,
    false,
  );

  if (firstNonNewlineOrCommentTokBehindType === -1) {
    throw createErr();
  }

  switch (currTokType) {
    case TokenType.ambiguousPlus:
    case TokenType.ambiguousMinus:
      return disambiguatePlusMinus(
        currTokType,
        firstNonNewlineOrCommentTokBehindType,
      );
  }

  const [
    firstNonNewlineOrCommentTokAheadType,
    firstNonNewlineOrCommentTokAheadIndex,
  ] = TokenSet.findFirstTypeMatchAhead(
    tokSet,
    ambigTokIndex + 1,
    tokTypesNewlineAndComments,
    false,
  );
  if (firstNonNewlineOrCommentTokAheadType === -1) {
    throw createErr();
  }

  switch (currTokType) {
    case TokenType.ambiguousIncrement:
    case TokenType.ambiguousDecrement:
      return disambiguateIncrementDecrement(
        currTokType,
        firstNonNewlineOrCommentTokBehindType,
        firstNonNewlineOrCommentTokAheadType,
        () => createErr(),
      );

    case TokenType.ambiguousAsterisk:
      return disambiguateAsterisk(
        tokSet,
        firstNonNewlineOrCommentTokBehindType,
        firstNonNewlineOrCommentTokBehindIndex,
        firstNonNewlineOrCommentTokAheadType,
        firstNonNewlineOrCommentTokAheadIndex,
        () => createErr(),
      );

    case TokenType.ambiguousAmpersand:
      return disambiguateAmpersand(
        firstNonNewlineOrCommentTokBehindType,
        firstNonNewlineOrCommentTokAheadType,
        createErr,
      );

    default:
      throw createErr();
  }
}

function disambiguateColon(
  ambigTokIndex: number,
  tokSet: TokenSet,
  createErr: () => Error,
) {
  const [firstMatchBehindType] = TokenSet.findFirstTypeMatchBehind(
    tokSet,
    ambigTokIndex - 1,
    [
      TokenType.keywordCase,
      TokenType.keywordDefault,
      TokenType.operatorTernaryQuestion,
      TokenType.specialSemicolon,
      TokenType.specialBraceOpening,
    ],
    true,
  );

  if (firstMatchBehindType === -1) {
    throw createErr();
  }

  switch (firstMatchBehindType) {
    case TokenType.keywordCase:
    case TokenType.keywordDefault:
    case TokenType.specialBraceOpening:
    case TokenType.specialSemicolon:
      return TokenType.specialColonSwitchOrLabelOrBitField;
    case TokenType.operatorTernaryQuestion:
    default:
      return TokenType.operatorTernaryColon;
  }
}

function disambiguateIncrementDecrement(
  which: TokenType,
  firstNonNewlineOrCommentTokTypeBehind: TokenType,
  firstNonNewlineOrCommentTokTypeAhead: TokenType,
  createErr: () => Error,
) {
  if (
    [
      TokenType.identifier,
      TokenType.specialParenthesisOpening,
      TokenType.ambiguousAsterisk,
    ].includes(firstNonNewlineOrCommentTokTypeAhead)
  ) {
    return which === TokenType.ambiguousIncrement
      ? TokenType.operatorUnaryArithmeticIncrementPrefix
      : TokenType.operatorUnaryArithmeticDecrementPrefix;
  }

  if (
    [
      TokenType.identifier,
      TokenType.specialParenthesisClosing,
      TokenType.specialBracketClosing,
    ].includes(firstNonNewlineOrCommentTokTypeBehind)
  ) {
    return which === TokenType.ambiguousIncrement
      ? TokenType.operatorUnaryArithmeticIncrementPostfix
      : TokenType.operatorUnaryArithmeticDecrementPostfix;
  }

  throw createErr();
}

function disambiguatePlusMinus(
  which: TokenType,
  firstNonNewlineOrCommentTokTypeBehind: TokenType,
) {
  if (
    isTokenBinaryOperator(firstNonNewlineOrCommentTokTypeBehind) ||
    [
      TokenType.specialBracketOpening,
      TokenType.specialParenthesisOpening,
      TokenType.keywordReturn,
    ].includes(firstNonNewlineOrCommentTokTypeBehind)
  ) {
    return which === TokenType.ambiguousPlus
      ? TokenType.operatorUnaryPlus
      : TokenType.operatorUnaryMinus;
  }
  return which === TokenType.ambiguousPlus
    ? TokenType.operatorBinaryArithmeticAddition
    : TokenType.operatorBinaryArithmeticSubtraction;
}

function disambiguateAsterisk(
  tokSet: TokenSet,
  firstNonNewlineOrCommentTokBehindType: TokenType,
  firstNonNewlineOrCommentTokBehindIndex: number,
  firstNonNewlineOrCommentTokAheadType: TokenType,
  firstNonNewlineOrCommentTokAheadIndex: number,
  createErr: () => Error,
) {
  // Mult with number|character operands or offset as left operand
  if (
    [
      TokenType.constantNumber,
      TokenType.constantCharacter,
      TokenType.specialBracketClosing,
    ].includes(firstNonNewlineOrCommentTokBehindType) ||
    [TokenType.constantNumber, TokenType.constantCharacter].includes(
      firstNonNewlineOrCommentTokAheadType,
    )
  ) {
    return TokenType.operatorBinaryArithmeticMultiplication;
  }

  // Other cases where immediate surroundings (1st layer)
  // determine what the asterisk is (mult|deref|indir)
  if (
    // Left side
    isTokenKeyword(firstNonNewlineOrCommentTokBehindType) ||
    isTokenKeywordTypeQualifier(firstNonNewlineOrCommentTokBehindType) ||
    isTokenUnaryOperator(firstNonNewlineOrCommentTokBehindType) ||
    isTokenBinaryOperator(firstNonNewlineOrCommentTokBehindType) ||
    isTokenSpecialNonClosing(firstNonNewlineOrCommentTokBehindType) ||
    isTokenTernaryOperatorComponent(firstNonNewlineOrCommentTokBehindType) ||
    [
      TokenType.specialBraceClosing,
      TokenType.keywordSizeof,
      TokenType.keywordReturn,
      TokenType.keywordTypedef,
      TokenType.keywordInline,
      TokenType.keywordStatic,
    ].includes(firstNonNewlineOrCommentTokBehindType) ||
    // Right side
    isTokenKeywordTypeQualifier(firstNonNewlineOrCommentTokAheadType) ||
    firstNonNewlineOrCommentTokAheadType === TokenType.ambiguousAsterisk
  ) {
    return TokenType.operatorUnaryIndirectionOrDereference;
  }

  // Second layer right side
  const [
    secondNonNewlineOrCommentTokAheadType,
    // secondNonNewlineOrCommentTokenAheadIndex,
  ] = TokenSet.findFirstTypeMatchAhead(
    tokSet,
    firstNonNewlineOrCommentTokAheadIndex + 1,
    tokTypesNewlineAndComments,
    false,
  );
  if (secondNonNewlineOrCommentTokAheadType === -1) {
    throw createErr();
  }

  // Assigning to dereferenced ptr value,
  // postfix (inc|dec)rementing derefernced ptr,
  // func with ptr return type
  // ptr to array
  if (
    isTokenBinaryOperatorAssignment(secondNonNewlineOrCommentTokAheadType) ||
    isTokenPostfixIncrOrDecrOperator(secondNonNewlineOrCommentTokAheadType) ||
    [
      TokenType.specialParenthesisOpening,
      TokenType.specialBracketOpening,
    ].includes(secondNonNewlineOrCommentTokAheadType)
  ) {
    return TokenType.operatorUnaryIndirectionOrDereference;
  }

  /*
    By this point, it cannot be dereferencing,
    it must be indirection or multiplication.
  */

  // Second layer left side
  const [
    secondNonNewlineOrCommentTokBehindType,
    secondNonNewlineOrCommentTokBehindIndex,
  ] = TokenSet.findFirstTypeMatchBehind(
    tokSet,
    firstNonNewlineOrCommentTokBehindIndex - 1,
    tokTypesNewlineAndComments,
    false,
  );
  if (secondNonNewlineOrCommentTokBehindType === -1) {
    throw createErr();
  }

  // Pointer to struct|union or type with qualifier|modifier
  if (
    isTokenKeywordTypeOrTypeQualifier(secondNonNewlineOrCommentTokBehindType) ||
    [
      TokenType.keywordTypedef,
      TokenType.keywordExtern,
      TokenType.keywordInline,
      TokenType.keywordRegister,
    ].includes(secondNonNewlineOrCommentTokBehindType) ||
    secondNonNewlineOrCommentTokBehindType === TokenType.preproHash
  ) {
    return TokenType.operatorUnaryIndirectionOrDereference;
  }

  // Assignment to mult expression,
  // mult inside compound expression,
  // comparison with mult expression
  if (
    // Left side
    isTokenUnaryOperator(secondNonNewlineOrCommentTokBehindType) ||
    isTokenBinaryOperator(secondNonNewlineOrCommentTokBehindType) ||
    // Right side
    isTokenBinaryOperatorNonAssignment(secondNonNewlineOrCommentTokAheadType)
  ) {
    return TokenType.operatorBinaryArithmeticMultiplication;
  }

  // Mult inside offset operator
  if (
    secondNonNewlineOrCommentTokBehindType ===
      TokenType.specialBracketOpening ||
    secondNonNewlineOrCommentTokAheadType === TokenType.specialBracketClosing
  ) {
    return TokenType.operatorBinaryArithmeticMultiplication;
  }

  // Pointer inside struct|union|scope braces or right after scope ending
  if (
    ([TokenType.specialSemicolon, TokenType.specialBraceClosing].includes(
      secondNonNewlineOrCommentTokBehindType,
    ) &&
      [TokenType.specialSemicolon, TokenType.specialComma].includes(
        secondNonNewlineOrCommentTokAheadType,
      )) ||
    (secondNonNewlineOrCommentTokBehindType === TokenType.specialBraceOpening &&
      [TokenType.specialSemicolon, TokenType.specialComma].includes(
        secondNonNewlineOrCommentTokAheadType,
      ))
  ) {
    return TokenType.operatorUnaryIndirectionOrDereference;
  }

  /*
    By this point immediate 2 layer surroundings must be ,ident*ident,
    so there are 3 possibilities:
      - pointer inside func signature
      - mult inside func-call
      - mult inside init-list
  */

  enum EnclosureType {
    unknown, // For when it cannot be determined (syntax error)
    functionSignature,
    functionCall,
    initializerList,
  }

  const enclosureType = (function determineEnclosureType() {
    let foundParenOpening = false;
    let foundBraceOpening = false;

    let i = secondNonNewlineOrCommentTokBehindIndex;
    for (; i >= 2; --i) {
      const tokType = tokSet.getTokenType(i);
      if (tokType === TokenType.specialParenthesisOpening) {
        foundParenOpening = true;
        break;
      }
      if (tokType === TokenType.specialBraceOpening) {
        foundBraceOpening = true;
        break;
      }
    }

    if (foundBraceOpening) {
      const [firstMatchBehindType] = TokenSet.findFirstTypeMatchBehind(
        tokSet,
        i - 1,
        tokTypesNewlineAndComments,
        false,
      );
      return firstMatchBehindType === TokenType.operatorBinaryAssignmentDirect
        ? EnclosureType.initializerList
        : EnclosureType.unknown;
    }

    if (foundParenOpening) {
      const [firstMatchBehindType, firstMatchBehindIndex] =
        TokenSet.findFirstTypeMatchBehind(
          tokSet,
          i - 1,
          tokTypesNewlineAndComments,
          false,
        );
      if (firstMatchBehindType === -1) {
        return EnclosureType.unknown;
      }
      const [secondMatchBehindType] = TokenSet.findFirstTypeMatchBehind(
        tokSet,
        firstMatchBehindIndex - 1,
        tokTypesNewlineAndComments,
        false,
      );
      if (secondMatchBehindType === -1) {
        return EnclosureType.unknown;
      }
      return isTokenKeywordTypeOrTypeQualifier(secondMatchBehindType) ||
        secondMatchBehindType === TokenType.identifier
        ? EnclosureType.functionSignature
        : EnclosureType.functionCall;
    }

    return EnclosureType.unknown;
  })();

  switch (enclosureType) {
    case EnclosureType.functionSignature:
      return TokenType.operatorUnaryIndirectionOrDereference;
    case EnclosureType.functionCall:
    case EnclosureType.initializerList:
      return TokenType.operatorBinaryArithmeticMultiplication;
    case EnclosureType.unknown:
      throw createErr();
  }
}

function disambiguateAmpersand(
  firstNonNewlineOrCommentTokTypeBehind: TokenType,
  firstNonNewlineOrCommentTokTypeAfter: TokenType,
  createErr: () => Error,
) {
  if (
    [
      TokenType.constantNumber,
      TokenType.constantCharacter,
      TokenType.identifier,
      TokenType.specialParenthesisClosing,
      TokenType.specialBracketClosing,
    ].includes(firstNonNewlineOrCommentTokTypeBehind) ||
    [TokenType.constantNumber, TokenType.constantCharacter].includes(
      firstNonNewlineOrCommentTokTypeAfter,
    )
  ) {
    return TokenType.operatorBinaryBitwiseAnd;
  }

  if (
    [
      TokenType.identifier,
      TokenType.constantString,
      TokenType.specialParenthesisOpening,
    ].includes(firstNonNewlineOrCommentTokTypeAfter)
  ) {
    return TokenType.operatorUnaryAddressOf;
  }

  throw createErr();
}
