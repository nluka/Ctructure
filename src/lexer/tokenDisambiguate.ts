import tokenDetermineLineAndNum from './tokenDetermineLineAndNum';
import TokenSet from './TokenSet';
import TokenType, {
  isTokenBinaryOperator,
  isTokenBinaryOperatorAssignment,
  isTokenBinaryOperatorMemberSelection,
  isTokenBinaryOperatorNonAssignment,
  isTokenKeyword,
  isTokenKeywordTypeOrTypeQualifier,
  isTokenKeywordTypeQualifier,
  isTokenSpecialNonClosing,
  isTokenTernaryOperatorComponent,
  isTokenUnaryOperator
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
  ] = tokSet.findFirstTypeMatchBehind(
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
  ] = tokSet.findFirstTypeMatchAhead(
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
      if (
        firstNonNewlineOrCommentTokBehindType ===
          TokenType.specialParenthesisClosing &&
        firstNonNewlineOrCommentTokAheadType === TokenType.identifier
      ) {
        const { lineNum, tokenNum } = tokenDetermineLineAndNum(
          fileContents,
          // the unsupported sequence of tokens starts from the closingParen,
          // hence `ambigTokIndex - 1`
          tokSet.getTokenStartPosition(ambigTokIndex - 1),
        );
        throw new Error(
          `unsupported syntax (US2) starting at token ${tokenNum} on line ${lineNum} - closingParen asterisk identifier (https://github.com/nluka/Ctructure#us2-closingparen-asterisk-identifier)`,
        );
      }

      return disambiguateAsterisk(
        tokSet,
        firstNonNewlineOrCommentTokBehindType,
        firstNonNewlineOrCommentTokBehindIndex,
        firstNonNewlineOrCommentTokAheadType,
        firstNonNewlineOrCommentTokAheadIndex,
        () => createErr(),
      );

    case TokenType.ambiguousAmpersand:
      if (
        firstNonNewlineOrCommentTokBehindType ===
          TokenType.specialParenthesisClosing &&
        firstNonNewlineOrCommentTokAheadType === TokenType.identifier
      ) {
        const { lineNum, tokenNum } = tokenDetermineLineAndNum(
          fileContents,
          // the unsupported sequence of tokens starts from the closingParen,
          // hence `ambigTokIndex - 1`
          tokSet.getTokenStartPosition(ambigTokIndex - 1),
        );
        throw new Error(
          `unsupported syntax (US3) starting at token ${tokenNum} on line ${lineNum} - closingParen ampersand identifier (https://github.com/nluka/Ctructure#us2-closingparen-asterisk-identifier)`,
        );
      }

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
  const [firstMatchBehindType] = tokSet.findFirstTypeMatchBehind(
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
  ambigType: TokenType,
  firstNonNewlineOrCommentTokTypeBehind: TokenType,
) {
  if (
    isTokenUnaryOperator(firstNonNewlineOrCommentTokTypeBehind) ||
    isTokenBinaryOperator(firstNonNewlineOrCommentTokTypeBehind) ||
    isTokenTernaryOperatorComponent(firstNonNewlineOrCommentTokTypeBehind) ||
    [
      TokenType.keywordCase,
      TokenType.keywordReturn,
      TokenType.specialComma,
      TokenType.specialParenthesisOpening,
      TokenType.specialBraceOpening,
      TokenType.specialBracketOpening,
    ].includes(firstNonNewlineOrCommentTokTypeBehind)
  ) {
    return ambigType === TokenType.ambiguousPlus
      ? TokenType.operatorUnaryPlus
      : TokenType.operatorUnaryMinus;
  }
  return ambigType === TokenType.ambiguousPlus
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
  // num|char tokens on left|right,
  // closing bracket on left,
  if (
    // left side
    [
      TokenType.constantNumber,
      TokenType.constantCharacter,
      TokenType.specialBracketClosing,
    ].includes(firstNonNewlineOrCommentTokBehindType) ||
    // right side
    [TokenType.constantNumber, TokenType.constantCharacter].includes(
      firstNonNewlineOrCommentTokAheadType,
    )
  ) {
    return TokenType.operatorBinaryArithmeticMultiplication;
  }

  if (
    firstNonNewlineOrCommentTokBehindType === TokenType.identifier &&
    firstNonNewlineOrCommentTokAheadType === TokenType.specialParenthesisOpening
  ) {
    return TokenType.operatorBinaryArithmeticMultiplication;
  }

  // other cases where immediate surroundings (1st layer)
  // determine what the asterisk is
  if (
    // left side
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
    // right side
    isTokenKeywordTypeQualifier(firstNonNewlineOrCommentTokAheadType) ||
    [TokenType.ambiguousAsterisk, TokenType.specialParenthesisClosing].includes(
      firstNonNewlineOrCommentTokAheadType,
    )
  ) {
    return TokenType.operatorUnaryIndirectionOrDereference;
  }

  // second layer right side
  const [secondNonNewlineOrCommentTokAheadType] =
    tokSet.findFirstTypeMatchAhead(
      firstNonNewlineOrCommentTokAheadIndex + 1,
      tokTypesNewlineAndComments,
      false,
    );
  if (secondNonNewlineOrCommentTokAheadType === -1) {
    throw createErr();
  }

  // (in|de)crementing or assigning to dereferenced ptr,
  // postfix (inc|dec)rementing derefernced ptr,
  // func with ptr return type,
  // ptr to array
  if (
    // right side
    isTokenBinaryOperatorAssignment(secondNonNewlineOrCommentTokAheadType) ||
    [
      TokenType.ambiguousIncrement,
      TokenType.ambiguousDecrement,
      TokenType.specialParenthesisOpening,
    ].includes(secondNonNewlineOrCommentTokAheadType)
  ) {
    return TokenType.operatorUnaryIndirectionOrDereference;
  }

  /*
    by this point, it cannot be dereferencing,
    it must be indirection or multiplication.
  */

  // second layer left side
  const [
    secondNonNewlineOrCommentTokBehindType,
    secondNonNewlineOrCommentTokBehindIndex,
  ] = tokSet.findFirstTypeMatchBehind(
    firstNonNewlineOrCommentTokBehindIndex - 1,
    tokTypesNewlineAndComments,
    false,
  );
  if (secondNonNewlineOrCommentTokBehindType === -1) {
    throw createErr();
  }

  // ptr to struct|union or type with qualifier|modifier
  if (
    isTokenKeywordTypeOrTypeQualifier(secondNonNewlineOrCommentTokBehindType) ||
    [
      TokenType.keywordTypedef,
      TokenType.keywordExtern,
      TokenType.keywordInline,
      TokenType.keywordRegister,
    ].includes(secondNonNewlineOrCommentTokBehindType) ||
    secondNonNewlineOrCommentTokBehindType === TokenType.preproDirective
  ) {
    return TokenType.operatorUnaryIndirectionOrDereference;
  }

  // assignment to mult expression,
  // mult inside compound expression,
  // comparison with mult expression
  if (
    // left side
    isTokenUnaryOperator(secondNonNewlineOrCommentTokBehindType) ||
    isTokenBinaryOperator(secondNonNewlineOrCommentTokBehindType) ||
    isTokenBinaryOperatorMemberSelection(
      secondNonNewlineOrCommentTokBehindType,
    ) ||
    // right side
    isTokenBinaryOperatorNonAssignment(secondNonNewlineOrCommentTokAheadType)
  ) {
    return TokenType.operatorBinaryArithmeticMultiplication;
  }

  if (
    secondNonNewlineOrCommentTokAheadType === TokenType.specialBracketOpening
  ) {
    return TokenType.operatorUnaryIndirectionOrDereference;
  }

  if (
    secondNonNewlineOrCommentTokBehindType ===
      TokenType.specialBracketOpening ||
    secondNonNewlineOrCommentTokAheadType === TokenType.specialBracketClosing
  ) {
    // mult inside offset operator
    return TokenType.operatorBinaryArithmeticMultiplication;
  }

  // (in|de)crementing dereferenced ptr
  // ptr inside struct|union|scope braces or right after scope ending
  if (
    [TokenType.ambiguousIncrement, TokenType.ambiguousDecrement].includes(
      secondNonNewlineOrCommentTokAheadType,
    ) ||
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

  if (
    firstNonNewlineOrCommentTokBehindType ===
      TokenType.specialParenthesisClosing &&
    firstNonNewlineOrCommentTokAheadType === TokenType.specialParenthesisOpening
  ) {
    /*
      here we don't bother disambiguating because it's much easier
      for the printer to do it, since it tracks context.
    */
    return TokenType.ambiguousAsterisk;
  }

  /*
    by this point immediate 2 layer surroundings must be ,ident*ident,
    so there are 3 possibilities:
      - ptr inside func signature
      - mult inside func-call
      - mult inside init-list
  */

  enum EnclosureType {
    unknown, // for when it cannot be determined (syntax error)
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
      const [firstMatchBehindType] = tokSet.findFirstTypeMatchBehind(
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
        tokSet.findFirstTypeMatchBehind(
          i - 1,
          tokTypesNewlineAndComments,
          false,
        );
      if (firstMatchBehindType === -1) {
        return EnclosureType.unknown;
      }
      const [secondMatchBehindType] = tokSet.findFirstTypeMatchBehind(
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
