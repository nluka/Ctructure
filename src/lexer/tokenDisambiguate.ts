import findFirstTokenTypeMatchAhead from './findFirstTokenTypeMatchAhead';
import findFirstTokenTypeMatchBehind from './findFirstTokenTypeMatchBehind';
import TokenArray from './TokenArray';
import tokenDetermineLineAndIndex from './tokenDetermineLineAndIndex';
import TokenType, {
  isTokenBinaryOperator,
  isTokenNonMultiplicationOrIndirectionBinaryOperator,
  isTokenSpecialNonClosing,
  isTokenTypeQualifierKeyword,
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
  const [currTokenStartIndex, currTokenType] = tokens.getToken(currTokenIndex);

  console.log(currTokenType);
  function createErr() {
    const { lineNum, indexOnLine } = tokenDetermineLineAndIndex(
      fileContents,
      currTokenStartIndex,
    );
    return new Error(
      `unable to diambiguate ${tokenTypeToNameMap.get(
        currTokenType,
      )} at line ${lineNum} indexOnLine ${indexOnLine}`,
    );
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
        firstTokenTypeBehindCurr === TokenType.specialParenthesisClosing
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
        firstTokenTypeBehindCurr === TokenType.specialParenthesisClosing
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
        // for struct pointer decls/defs
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
        if (
          secondNonNewlineOrCommentTokenAfterCurr === null ||
          (secondNonNewlineOrCommentTokenAfterCurr[1] !==
            TokenType.specialSemicolon &&
            secondNonNewlineOrCommentTokenAfterCurr[1] !==
              TokenType.operatorBinaryAssignmentDirect)
        ) {
          throw createErr();
        }
        return TokenType.operatorBinaryMultiplicationOrIndirection;
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
        // for dereference in func call or pointer in multvar decl/def
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
