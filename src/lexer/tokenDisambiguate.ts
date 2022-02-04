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

const tokenTypesNewlineOrComment: TokenType[] = [
  TokenType.newline,
  TokenType.commentSingleline,
  TokenType.commentMultiline,
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

  function createErr() {
    const { lineNum, tokenNum } = tokenDetermineLineAndPos(
      fileContents,
      tokens.getTokenStartIndex(currTokenIndex),
    );
    return new Error(
      `unable to diambiguate ${tokenTypeToNameMap.get(
        currTokenType,
      )} at line ${lineNum} tokenNum ${tokenNum}`,
    );
  }

  if (currTokenType === TokenType.ambiguousColon) {
    const firstMatchBehind = findFirstTokenTypeMatchBehind(
      tokens,
      currTokenIndex - 1,
      [
        TokenType.keywordCase,
        TokenType.keywordDefault,
        TokenType.operatorTernaryQuestion,
        TokenType.specialBraceOpening,
      ],
      true,
    );
    if (firstMatchBehind === null) {
      throw createErr();
    }
    switch (firstMatchBehind[1]) {
      case TokenType.keywordCase:
      case TokenType.keywordDefault:
        return TokenType.operatorSwitchColon;
      case TokenType.operatorTernaryQuestion:
        return TokenType.operatorTernaryColon;
      default:
        return TokenType.operatorBitFieldColon;
    }
  }

  const firstNonNewlineOrCommentTokenBehindCurr = findFirstTokenTypeMatchBehind(
    tokens,
    currTokenIndex - 1,
    tokenTypesNewlineOrComment,
    false,
  );
  const firstNonNewlineOrCommentTokenAfterCurr = findFirstTokenTypeMatchAhead(
    tokens,
    currTokenIndex + 1,
    tokenTypesNewlineOrComment,
    false,
  );
  if (
    firstNonNewlineOrCommentTokenBehindCurr === null ||
    firstNonNewlineOrCommentTokenAfterCurr === null
  ) {
    throw createErr();
  }
  const firstTokenTypeBehindCurr = firstNonNewlineOrCommentTokenBehindCurr[1];
  const firstTokenTypeAfterCurr = firstNonNewlineOrCommentTokenAfterCurr[1];

  switch (currTokenType) {
    case TokenType.ambiguousPlus: {
      if (
        isTokenBinaryOperator(firstTokenTypeBehindCurr) ||
        firstTokenTypeBehindCurr === TokenType.specialBracketOpening ||
        firstTokenTypeBehindCurr === TokenType.specialParenthesisOpening ||
        firstTokenTypeBehindCurr === TokenType.keywordReturn
      ) {
        return TokenType.operatorUnaryPlus;
      }
      return TokenType.operatorBinaryArithmeticAddition;
    }

    case TokenType.ambiguousMinus: {
      if (
        isTokenBinaryOperator(firstTokenTypeBehindCurr) ||
        firstTokenTypeBehindCurr === TokenType.specialBracketOpening ||
        firstTokenTypeBehindCurr === TokenType.specialParenthesisOpening ||
        firstTokenTypeBehindCurr === TokenType.keywordReturn
      ) {
        return TokenType.operatorUnaryMinus;
      }
      return TokenType.operatorBinaryArithmeticSubtraction;
    }

    case TokenType.ambiguousIncrement: {
      if (
        firstTokenTypeAfterCurr === TokenType.identifier ||
        firstTokenTypeAfterCurr === TokenType.specialParenthesisOpening ||
        firstTokenTypeAfterCurr === TokenType.ambiguousAsterisk
      ) {
        return TokenType.operatorUnaryArithmeticIncrementPrefix;
      }
      if (
        firstTokenTypeBehindCurr === TokenType.identifier ||
        firstTokenTypeBehindCurr === TokenType.specialParenthesisClosing ||
        firstTokenTypeBehindCurr === TokenType.specialBracketClosing
      ) {
        return TokenType.operatorUnaryArithmeticIncrementPostfix;
      }
      throw createErr();
    }

    case TokenType.ambiguousDecrement: {
      if (
        firstTokenTypeAfterCurr === TokenType.identifier ||
        firstTokenTypeAfterCurr === TokenType.specialParenthesisOpening ||
        firstTokenTypeAfterCurr === TokenType.ambiguousAsterisk
      ) {
        return TokenType.operatorUnaryArithmeticDecrementPrefix;
      }
      if (
        firstTokenTypeBehindCurr === TokenType.identifier ||
        firstTokenTypeBehindCurr === TokenType.specialParenthesisClosing ||
        firstTokenTypeBehindCurr === TokenType.specialBracketClosing
      ) {
        return TokenType.operatorUnaryArithmeticDecrementPostfix;
      }
      throw createErr();
    }

    case TokenType.ambiguousAsterisk: {
      if (
        // for indirection with type qualifiers
        isTokenTypeQualifierKeyword(firstTokenTypeBehindCurr) ||
        isTokenTypeQualifierKeyword(firstTokenTypeAfterCurr)
      ) {
        return TokenType.operatorBinaryMultiplicationOrIndirection;
      }

      if (
        // for multi indirection
        firstTokenTypeBehindCurr ===
          TokenType.operatorBinaryMultiplicationOrIndirection ||
        firstTokenTypeAfterCurr === TokenType.ambiguousAsterisk
      ) {
        return TokenType.operatorBinaryMultiplicationOrIndirection;
      }

      if (
        // for derefence after scope closing and struct pointer decls/defs
        firstTokenTypeBehindCurr === TokenType.specialBraceClosing &&
        firstTokenTypeAfterCurr === TokenType.identifier
      ) {
        const secondNonNewlineOrCommentTokenAfterCurr =
          findFirstTokenTypeMatchAhead(
            tokens,
            currTokenIndex + 2,
            tokenTypesNewlineOrComment,
            false,
          );
        if (secondNonNewlineOrCommentTokenAfterCurr === null) {
          throw createErr();
        }
        if (
          secondNonNewlineOrCommentTokenAfterCurr[1] ===
          TokenType.specialSemicolon
        ) {
          return TokenType.operatorBinaryMultiplicationOrIndirection;
        }
        return TokenType.operatorUnaryDereference;
      }

      if (
        // for dereference as first statement of if with no braces
        firstTokenTypeBehindCurr === TokenType.specialParenthesisClosing &&
        firstTokenTypeAfterCurr === TokenType.identifier
      ) {
        const firstMatchBehind = findFirstTokenTypeMatchBehind(
          tokens,
          currTokenIndex - 2,
          [
            TokenType.specialSemicolon,
            TokenType.specialBraceOpening,
            TokenType.keywordIf,
          ],
          true,
        );
        if (firstMatchBehind === null) {
          throw createErr();
        }
        if (firstMatchBehind[1] === TokenType.keywordIf) {
          return TokenType.operatorUnaryDereference;
        }
        return TokenType.operatorBinaryMultiplicationOrIndirection;
      }

      if (
        // for dereference in func call or pointer in multivar decl/def
        firstTokenTypeBehindCurr === TokenType.specialComma &&
        firstTokenTypeAfterCurr === TokenType.identifier
      ) {
        const firstMatchBehind = findFirstTokenTypeMatchBehind(
          tokens,
          currTokenIndex - 2,
          [
            TokenType.specialSemicolon,
            TokenType.specialBraceOpening,
            TokenType.specialParenthesisOpening,
          ],
          true,
        );
        if (firstMatchBehind === null) {
          throw createErr();
        }
        if (firstMatchBehind[1] === TokenType.specialParenthesisOpening) {
          return TokenType.operatorUnaryDereference;
        }
        return TokenType.operatorBinaryMultiplicationOrIndirection;
      }

      if (
        firstTokenTypeBehindCurr === TokenType.specialBraceClosing ||
        isTokenUnaryOperator(firstTokenTypeBehindCurr) ||
        isTokenSpecialNonClosing(firstTokenTypeBehindCurr) ||
        isTokenNonMultiplicationOrIndirectionBinaryOperator(
          firstTokenTypeBehindCurr,
        ) ||
        firstTokenTypeBehindCurr === TokenType.keywordSizeof
      ) {
        return TokenType.operatorUnaryDereference;
      }

      return TokenType.operatorBinaryMultiplicationOrIndirection;
    }

    case TokenType.ambiguousAmpersand: {
      if (
        firstTokenTypeBehindCurr === TokenType.constantNumber ||
        firstTokenTypeBehindCurr === TokenType.constantCharacter ||
        firstTokenTypeAfterCurr === TokenType.constantNumber ||
        firstTokenTypeAfterCurr === TokenType.constantCharacter ||
        firstTokenTypeBehindCurr === TokenType.identifier ||
        firstTokenTypeBehindCurr === TokenType.specialParenthesisClosing ||
        firstTokenTypeBehindCurr === TokenType.specialBracketClosing
      ) {
        return TokenType.operatorBinaryBitwiseAnd;
      }

      if (
        firstTokenTypeAfterCurr === TokenType.identifier ||
        firstTokenTypeAfterCurr === TokenType.constantString ||
        firstTokenTypeAfterCurr === TokenType.specialParenthesisOpening
      ) {
        return TokenType.operatorUnaryAddressOf;
      }

      throw createErr();
    }

    default:
      return currTokenType;
  }
}
