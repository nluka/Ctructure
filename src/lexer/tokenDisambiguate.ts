import findFirstTokenTypeMatchAhead from './findFirstTokenTypeMatchAhead';
import findFirstTokenTypeMatchBehind from './findFirstTokenTypeMatchBehind';
import TokenArray from './TokenArray';
import tokenDetermineLineAndPos from './tokenDetermineLineAndPos';
import TokenType, {
  isTokenBinaryOperator,
  isTokenNonMultiplicationOrIndirectionBinaryOperator,
  isTokenSpecialNonClosing,
  isTokenTypeQualifierKeyword,
  isTokenUnaryOperator,
} from './TokenType';
import tokenTypeToNameMap from './tokenTypeToNameMap';

const tokenTypesNewlineAndComments: TokenType[] = [
  TokenType.newline,
  TokenType.commentSingleLine,
  TokenType.commentMultiLine,
];

/**
 *
 * @param currTokenIndex The index of the ambiguous token in `tokens`.
 * @param tokens The array of tokens extracted from `fileContents`.
 * @param fileContents The contents of the file.
 * @returns The disambiguated type of the ambiguous token. May throw an error if
 * disambiguation is not possible (when syntax or semantics are wrong).
 */
export default function tokenDisambiguate(
  currTokenIndex: number,
  tokens: TokenArray,
  fileContents: string,
): TokenType {
  const currTokenType = tokens.getTokenType(currTokenIndex);

  if (currTokenType === TokenType.ambiguousColon) {
    return disambiguateColon(currTokenIndex, tokens, () => createErr());
  }

  const createErr = () => {
    const { lineNum, tokenNum } = tokenDetermineLineAndPos(
      fileContents,
      tokens.getTokenStartIndex(currTokenIndex),
    );
    return new Error(
      `unable to diambiguate ${tokenTypeToNameMap.get(
        tokens.getTokenType(currTokenIndex),
      )} at line ${lineNum} tokenNum ${tokenNum}`,
    );
  };

  const [
    firstNonNewlineOrCommentTokenBehindType,
    firstNonNewlineOrCommentTokenBehindIndex,
  ] = findFirstTokenTypeMatchBehind(
    tokens,
    currTokenIndex - 1,
    tokenTypesNewlineAndComments,
    false,
  );

  if (firstNonNewlineOrCommentTokenBehindType === -1) {
    throw createErr();
  }

  switch (currTokenType) {
    case TokenType.ambiguousPlus:
    case TokenType.ambiguousMinus:
      return disambiguatePlusMinus(
        currTokenType,
        firstNonNewlineOrCommentTokenBehindType,
      );
  }

  const [
    firstNonNewlineOrCommentTokenAheadType,
    firstNonNewlineOrCommentTokenAheadIndex,
  ] = findFirstTokenTypeMatchAhead(
    tokens,
    currTokenIndex + 1,
    tokenTypesNewlineAndComments,
    false,
  );
  if (firstNonNewlineOrCommentTokenAheadType === -1) {
    throw createErr();
  }

  switch (currTokenType) {
    case TokenType.ambiguousIncrement:
    case TokenType.ambiguousDecrement:
      return disambiguateIncrementDecrement(
        currTokenType,
        firstNonNewlineOrCommentTokenBehindType,
        firstNonNewlineOrCommentTokenAheadType,
        () => createErr(),
      );

    case TokenType.ambiguousAsterisk:
      return disambiguateAsterisk(
        currTokenIndex,
        tokens,
        firstNonNewlineOrCommentTokenBehindType,
        firstNonNewlineOrCommentTokenBehindIndex,
        firstNonNewlineOrCommentTokenAheadType,
        firstNonNewlineOrCommentTokenAheadIndex,
        () => createErr(),
      );

    case TokenType.ambiguousAmpersand:
      return disambiguateAmpersand(
        firstNonNewlineOrCommentTokenBehindType,
        firstNonNewlineOrCommentTokenAheadType,
        createErr,
      );

    default:
      throw createErr();
  }
}

function disambiguateColon(
  currTokenIndex: number,
  tokens: TokenArray,
  createErr: () => Error,
) {
  const [firstMatchBehindType] = findFirstTokenTypeMatchBehind(
    tokens,
    currTokenIndex - 1,
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
  firstNonNewlineOrCommentTokenTypeBehind: TokenType,
  firstNonNewlineOrCommentTokenTypeAhead: TokenType,
  createErr: () => Error,
) {
  if (
    [
      TokenType.identifier,
      TokenType.specialParenthesisOpening,
      TokenType.ambiguousAsterisk,
    ].includes(firstNonNewlineOrCommentTokenTypeAhead)
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
    ].includes(firstNonNewlineOrCommentTokenTypeBehind)
  ) {
    return which === TokenType.ambiguousIncrement
      ? TokenType.operatorUnaryArithmeticIncrementPostfix
      : TokenType.operatorUnaryArithmeticDecrementPostfix;
  }

  throw createErr();
}

function disambiguatePlusMinus(
  which: TokenType,
  firstNonNewlineOrCommentTokenTypeBehind: TokenType,
) {
  if (
    isTokenBinaryOperator(firstNonNewlineOrCommentTokenTypeBehind) ||
    [
      TokenType.specialBracketOpening,
      TokenType.specialParenthesisOpening,
      TokenType.keywordReturn,
    ].includes(firstNonNewlineOrCommentTokenTypeBehind)
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
  currTokenIndex: number,
  tokens: TokenArray,
  firstNonNewlineOrCommentTokenBehindType: TokenType,
  firstNonNewlineOrCommentTokenBehindIndex: number,
  firstNonNewlineOrCommentTokenAheadType: TokenType,
  firstNonNewlineOrCommentTokenAheadIndex: number,
  createErr: () => Error,
) {
  if (
    // for indirection with type qualifiers
    isTokenTypeQualifierKeyword(firstNonNewlineOrCommentTokenBehindType) ||
    isTokenTypeQualifierKeyword(firstNonNewlineOrCommentTokenAheadType)
  ) {
    return TokenType.operatorBinaryMultiplicationOrIndirection;
  }

  if (
    // for multi indirection
    firstNonNewlineOrCommentTokenBehindType ===
      TokenType.operatorBinaryMultiplicationOrIndirection ||
    firstNonNewlineOrCommentTokenAheadType === TokenType.ambiguousAsterisk
  ) {
    return TokenType.operatorBinaryMultiplicationOrIndirection;
  }

  if (
    // for derefence after scope closing and struct pointer decls/defs
    firstNonNewlineOrCommentTokenBehindType === TokenType.specialBraceClosing &&
    firstNonNewlineOrCommentTokenAheadType === TokenType.identifier
  ) {
    const [secondNonNewlineOrCommentTokenTypeAhead] =
      findFirstTokenTypeMatchAhead(
        tokens,
        firstNonNewlineOrCommentTokenAheadIndex + 1,
        tokenTypesNewlineAndComments,
        false,
      );
    if (secondNonNewlineOrCommentTokenTypeAhead === -1) {
      throw createErr();
    }
    return secondNonNewlineOrCommentTokenTypeAhead ===
      TokenType.specialSemicolon
      ? TokenType.operatorBinaryMultiplicationOrIndirection
      : TokenType.operatorUnaryDereference;
  }

  if (
    // for dereference as first statement of if with no braces
    firstNonNewlineOrCommentTokenBehindType ===
      TokenType.specialParenthesisClosing &&
    firstNonNewlineOrCommentTokenAheadType === TokenType.identifier
  ) {
    const [firstMatchBehindType] = findFirstTokenTypeMatchBehind(
      tokens,
      firstNonNewlineOrCommentTokenBehindIndex - 1,
      [
        TokenType.specialSemicolon,
        TokenType.specialBraceOpening,
        TokenType.keywordIf,
      ],
      true,
    );
    if (firstMatchBehindType === -1) {
      throw createErr();
    }
    return firstMatchBehindType === TokenType.keywordIf
      ? TokenType.operatorUnaryDereference
      : TokenType.operatorBinaryMultiplicationOrIndirection;
  }

  if (
    // for dereference in func call or pointer in multivar decl/def
    firstNonNewlineOrCommentTokenBehindType === TokenType.specialComma &&
    firstNonNewlineOrCommentTokenAheadType === TokenType.identifier
  ) {
    const [firstMatchBehindType] = findFirstTokenTypeMatchBehind(
      tokens,
      currTokenIndex - 2,
      [
        TokenType.specialSemicolon,
        TokenType.specialBraceOpening,
        TokenType.specialParenthesisOpening,
      ],
      true,
    );
    if (firstMatchBehindType === -1) {
      throw createErr();
    }
    return firstMatchBehindType === TokenType.specialParenthesisOpening
      ? TokenType.operatorUnaryDereference
      : TokenType.operatorBinaryMultiplicationOrIndirection;
  }

  if (
    isTokenUnaryOperator(firstNonNewlineOrCommentTokenBehindType) ||
    isTokenSpecialNonClosing(firstNonNewlineOrCommentTokenBehindType) ||
    isTokenNonMultiplicationOrIndirectionBinaryOperator(
      firstNonNewlineOrCommentTokenBehindType,
    ) ||
    [TokenType.specialBraceClosing, TokenType.keywordSizeof].includes(
      firstNonNewlineOrCommentTokenBehindType,
    )
  ) {
    return TokenType.operatorUnaryDereference;
  }

  return TokenType.operatorBinaryMultiplicationOrIndirection;
}

function disambiguateAmpersand(
  firstNonNewlineOrCommentTokenTypeBehind: TokenType,
  firstNonNewlineOrCommentTokenTypeAfter: TokenType,
  createErr: () => Error,
) {
  if (
    [
      TokenType.constantNumber,
      TokenType.constantCharacter,
      TokenType.identifier,
      TokenType.specialParenthesisClosing,
      TokenType.specialBracketClosing,
    ].includes(firstNonNewlineOrCommentTokenTypeBehind) ||
    [TokenType.constantNumber, TokenType.constantCharacter].includes(
      firstNonNewlineOrCommentTokenTypeAfter,
    )
  ) {
    return TokenType.operatorBinaryBitwiseAnd;
  }

  if (
    [
      TokenType.identifier,
      TokenType.constantString,
      TokenType.specialParenthesisOpening,
    ].includes(firstNonNewlineOrCommentTokenTypeAfter)
  ) {
    return TokenType.operatorUnaryAddressOf;
  }

  throw createErr();
}
